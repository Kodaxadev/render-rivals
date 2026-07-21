# 04 — Supervisor IPC, Authentication, Process I/O, and Endpoint Inspection

**Status:** Canonical implementation contract  
**Shared process purposes:** `schemas/domain-types.ts`  
**Path authority:** `spec/11-artifact-event-and-schema-contracts.md`  
**Compatibility/default decisions:** `docs/SCAFFOLD-DECISION-REGISTER.md`

## 1. Purpose and threat model

The native supervisor can authorize and launch arbitrary managed root executables as the user. Its control channel is security-sensitive.

Protect against:

- accidental local connection;
- another machine user;
- remote named-pipe clients;
- stale endpoint reuse;
- malformed or oversized frames;
- unauthorized spawn requests;
- path traversal;
- shell injection;
- operation replay with changed payload;
- unverified process/listener identity.

Do not claim protection against a fully compromised same-user process with memory or environment access.

## 2. Endpoint lifetime

A new random endpoint is generated per supervisor Session. It accepts one expected coordinator, closes to new clients after authentication, and is never reused.

Canonical conceptual endpoints:

### Windows

```text
\\.\pipe\render-rivals-<random-session-id>
```

Controls:

- explicit DACL;
- current user SID and optional LocalSystem only;
- remote clients rejected;
- one pipe instance;
- expected client PID/process identity;
- Session containment membership;
- one-time nonce.

### Linux

```text
$XDG_RUNTIME_DIR/render-rivals/<session-id>/supervisor.sock
```

Controls: parent `0700`, socket `0600`, kernel peer UID/GID/PID, nonce, one connection.

### macOS

```text
$TMPDIR/render-rivals-<uid>/<session-id>/supervisor.sock
```

Controls: parent `0700`, socket `0600`, `getpeereid()`, nonce, one connection.

Old `visual-optimizer` endpoint names are noncanonical.

## 3. Coordinator authentication

```ts
interface CoordinatorHello {
  protocolMajor: number;
  protocolMinor: number;
  sessionId: string;
  nonce: string;
  coordinatorPid: number;
  nodeExecPath: string;
  coordinatorBuild: string;
  requestedCapabilities: string[];
}
```

Rust verifies:

- Session and one-time nonce;
- expected process identity and peer credentials;
- exact Node path;
- coordinator build/protocol compatibility;
- Session containment membership;
- single-client ownership.

No reconnect is supported within one Session in MVP. Unexpected disconnect is coordinator failure.

## 4. Protocol compatibility

Per `docs/SCAFFOLD-DECISION-REGISTER.md`:

- protocol major must match exactly;
- minor versions may negotiate additive capabilities;
- unknown required method, field, or capability fails closed;
- optional unknown fields are rejected in MVP unless a versioned schema explicitly permits them;
- protocol behavior is covered by golden fixtures shared by Rust and TypeScript.

## 5. Framing

```text
4-byte little-endian unsigned payload length
UTF-8 JSON payload
```

A configured maximum frame size is enforced before allocation.

```ts
interface SupervisorEnvelope {
  protocolMajor: number;
  protocolMinor: number;
  sessionId: string;
  requestId?: string;
  operationId?: string;
  sequence: number;
  kind: "request" | "response" | "event";
  method: string;
  processId?: string;
  groupId?: string;
  payload: unknown;
}
```

Each direction has monotonic safe-integer sequence. Duplicate, decreasing, gapped required response, or unsafe-integer sequence is rejected and diagnosed.

## 6. Method schemas and idempotency

Every method has a strict versioned schema.

Side-effecting requests require `operationId`:

- repeated matching operation returns the recorded result;
- repeated operation with different canonical payload is rejected;
- transport retry does not create a duplicate process or cleanup operation;
- command acceptance is distinct from observed completion.

Unknown methods and properties fail closed.

## 7. Process specification

`purpose` uses `ProcessPurpose` from `schemas/domain-types.ts`.

```ts
interface ProcessSpec {
  executable: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  stdinMode: "closed" | "pipe" | "pty";
  outputPolicy: ProcessOutputPolicy;
  groupId: string;
  purpose: ProcessPurpose;
  maySpawnContainedDescendants: boolean;
  admissionToken: string;
}
```

Rust never interprets a command such as `pnpm dev && echo done`. If a shell is explicitly required, the shell is the executable and the request records shell classification and acknowledgement.

Process purposes include dependency, build, test, server, browser, fixture, evaluator, agent, Git, export, doctor, and utility operations.

## 8. Executable and path validation

Validate:

- nonempty executable and no NUL;
- canonical executable identity where possible;
- valid canonical working directory;
- working directory within an approved root;
- argument count and byte limits;
- environment count/byte limits;
- known group and Run ownership;
- nonstale admission token;
- declared purpose and descendant policy;
- resource/output policy.

Approved roots may include repository, candidate workspace, transient Session root, cache root, package-manager store, and canonical data root only for purpose-specific operations.

Project-provided paths never gain write access to arbitrary canonical locations.

## 9. Environment filtering

Coordinator constructs an allowlisted process environment. Rust applies final deny/allow rules.

Sensitive values are tagged and excluded/redacted from lifecycle records. Reserved `RENDER_RIVALS_*` Session variables are supplied only to the coordinator or explicitly authorized internal helpers, not inherited by arbitrary project commands.

## 10. Output architecture

Control frames and process bytes are separate.

Canonical process-relative layout:

```text
processes/<process-id>/
  process.json
  stdout.bin
  stderr.bin
  lifecycle.json
  usage.json
```

`spec/11` determines the owning candidate/run path and artifact registration. Raw stdout/stderr/lifecycle/usage files are registered artifacts or canonical process records as specified there.

Rust drains stdout and stderr continuously into binary-safe files.

Benefits:

- malformed UTF-8 support;
- ANSI preservation;
- exact replay;
- no cross-process interleaving;
- offset reads;
- crash durability.

## 11. Output notifications

```ts
interface OutputAvailableEvent {
  processId: string;
  stream: "stdout" | "stderr";
  offset: number;
  length: number;
  sequence: number;
}
```

Coordinator reads referenced bytes. Output notifications may be coalesced. They are not canonical semantic events.

## 12. Parsing ownership

TypeScript adapters parse provider formats, Git output, readiness output, and evaluator results. Rust remains provider-neutral and records raw bytes plus native lifecycle facts.

## 13. Backpressure and limits

```text
child pipe
→ Rust bounded memory buffer
→ per-process binary file
→ availability notification
```

If storage cannot keep up:

1. emit native warning;
2. stop workload admission;
3. apply configured output policy;
4. terminate process/group when durability cannot be maintained;
5. record exact truncation/termination.

Default MVP ceiling is 64 MiB stdout plus 64 MiB stderr per process. Never silently discard bytes.

```ts
interface ProcessOutputPolicy {
  maxStdoutMiB: number;
  maxStderrMiB: number;
  retain: "all" | "tail_after_limit";
  liveEvents: boolean;
  terminateOnLimit: boolean;
}
```

Any switch to tail retention records discarded byte ranges and cannot be represented as complete output.

## 14. Stdin and private terminals

Supported modes:

- closed;
- pipe;
- private PTY/ConPTY when implemented.

`writeStdin` works only for compatible active processes.

Private terminal is not the user console. ConPTY is deferred outside MVP unless a selected adapter proves it is required.

## 15. Native lifecycle events

```ts
export type SupervisorEvent =
  | { kind: "process.started"; processId: string; pid: number }
  | { kind: "process.output_available"; data: OutputAvailableEvent }
  | { kind: "process.resource"; snapshot: ResourceSnapshot }
  | { kind: "process.exited"; processId: string; exit: ProcessExit }
  | { kind: "group.cleanup"; result: CleanupResult }
  | { kind: "listener.changed"; inspection: ListenerInspection }
  | { kind: "supervisor.warning"; code: string; message: string };
```

Native events are observations. Coordinator converts relevant facts into canonical semantic Run events.

## 16. TypeScript supervisor client

```ts
interface ProcessSupervisor {
  spawn(spec: ProcessSpec, operationId: string): Promise<ManagedProcess>;
  terminate(processId: string, mode: "graceful" | "force", operationId: string): Promise<void>;
  terminateGroup(groupId: string, mode: "graceful" | "force", operationId: string): Promise<CleanupResult>;
  writeStdin(processId: string, data: Uint8Array): Promise<void>;
  subscribe(listener: (event: SupervisorEvent) => void): () => void;
  readOutput(processId: string, stream: "stdout" | "stderr", range: { offset: number; length: number }): Promise<Uint8Array>;
  wait(processId: string): Promise<ProcessExit>;
  getStats(groupId: string): Promise<ResourceSnapshot>;
  listGroupProcesses(groupId: string): Promise<ManagedProcessInfo[]>;
  containsProcess(groupId: string, processIdentity: ProcessIdentity): Promise<boolean>;
  inspectListener(endpoint: NetworkEndpoint): Promise<ListenerInspection>;
}
```

PID alone is never a `ProcessIdentity`.

## 17. Listener inspection

```ts
interface ListenerInspection {
  endpoint: NetworkEndpoint;
  state: "absent" | "listening" | "connected";
  ownerPid: number | null;
  ownerProcessId: string | null;
  ownerGroupId: string | null;
  ownershipConfidence: "verified" | "inferred" | "unavailable";
  diagnostics: string[];
}
```

Listener owner may be a descendant worker. Validity is verified group membership, not equality with root PID.

Reference implementation:

- Windows: native TCP tables with owning PID plus Job/logical-group membership;
- Linux: tested `/proc`/netlink/native mechanism;
- macOS: supported process/socket inspection, otherwise unavailable.

## 18. Readiness probes

```ts
export type ReadinessProbe =
  | { kind: "tcp"; host: string; port: number }
  | { kind: "http"; path: string; acceptedStatuses: number[]; bodyPattern?: string }
  | { kind: "output"; stream: "stdout" | "stderr" | "either"; pattern: string }
  | { kind: "playwright"; path: string; selector?: string }
  | { kind: "command"; executable: string; args: string[] };
```

A profile declares required/optional probes, timeout, poll interval, and diagnostics. Typical order: listener exists, ownership verifies, HTTP responds, browser navigates and asserts readiness.

## 19. Port leases

```ts
interface PortLease {
  leaseId: string;
  groupId: string;
  requestedPort: number | null;
  resolvedPort: number;
  host: "127.0.0.1";
  state: "reserved" | "launching" | "verified" | "released";
  attempt: number;
}
```

Modes:

- strict assigned: choose range, launch strict, verify owner, retry collision;
- server assigned: server reports port, then ownership verifies;
- external: user-managed URL with limited capability and no ownership claim.

The bind-release race cannot be eliminated generically. Detect and retry; a lease never proves socket ownership.

## 20. Protocol violations

Examples:

- invalid nonce or peer identity;
- oversized/malformed frame;
- unsupported protocol;
- sequence/idempotency violation;
- unknown method;
- invalid root/group/purpose;
- stale admission token;
- changed payload under reused operation ID.

Security-sensitive violation terminates Session after safe cleanup.

## 21. Audit record

Each request records request/operation ID, method, group/process, canonical payload hash, acceptance/rejection, validation result, time, coordinator identity, and completion observation. Sensitive values are redacted.

## 22. Required tests

- nonce/PID/peer mismatch rejected;
- second connection and remote pipe client rejected;
- Unix permissions and peer credentials verified;
- protocol major/minor negotiation follows policy;
- oversized and malformed frames fail before dangerous allocation;
- operation replay is idempotent and changed replay rejected;
- binary stdout/stderr exact and separated;
- slow reader does not block draining;
- output limit/truncation explicit;
- shell metacharacters remain inert;
- working-directory traversal rejected;
- reserved Session variables do not leak to project processes;
- listener owner verified as descendant group member;
- unknown ownership reported honestly;
- PID reuse cannot satisfy process identity;
- old `visual-optimizer` endpoint paths are rejected.

Historical `OPEN-IPC-*` decisions are resolved or deferred in `docs/SCAFFOLD-DECISION-REGISTER.md`.
