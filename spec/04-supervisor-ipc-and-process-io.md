# 04 — Supervisor IPC, Authentication, Process I/O, and Endpoint Inspection

## 1. Purpose

The native supervisor can launch arbitrary executables as the user. Its local control channel is security-sensitive.

## 2. Threat model

Protect against:

- accidental local connection;
- another machine user;
- remote named-pipe clients;
- stale endpoint reuse;
- malformed frames;
- unauthorized spawn requests;
- path traversal;
- shell injection.

Do not claim protection against a fully compromised same-user process with memory/environment access.

## 3. Endpoint lifetime

A new endpoint is generated per supervisor session.

It is random, single-client, closed after coordinator connection, and never reused.

## 4. Windows endpoint

```text
\\.\pipe\visual-optimizer-<random-session-id>
```

Controls:

- explicit DACL;
- current user SID;
- optional LocalSystem;
- remote clients rejected;
- one pipe instance;
- expected client PID;
- client Job membership;
- nonce.

Default pipe security is rejected.

## 5. Linux endpoint

```text
$XDG_RUNTIME_DIR/visual-optimizer/<session-id>/supervisor.sock
```

Controls:

- parent mode `0700`;
- socket mode `0600`;
- kernel peer UID/GID/PID;
- nonce;
- one connection.

## 6. macOS endpoint

```text
$TMPDIR/visual-optimizer-<uid>/<session-id>/supervisor.sock
```

Controls:

- parent mode `0700`;
- socket mode `0600`;
- `getpeereid()`;
- nonce;
- one connection.

## 7. Coordinator hello

```ts
interface CoordinatorHello {
  protocolVersion: number;
  sessionId: string;
  nonce: string;
  coordinatorPid: number;
  nodeExecPath: string;
  coordinatorBuild: string;
}
```

Rust verifies session, nonce, expected PID, peer credentials, Node path, protocol, and containment membership.

## 8. Post-auth behavior

- no second coordinator;
- no reconnect in v0;
- unexpected disconnect is coordinator failure;
- Unix socket path may be unlinked after connection;
- Windows server creates no new instance.

## 9. Framing

Control protocol:

```text
4-byte little-endian unsigned payload length
UTF-8 JSON payload
```

Maximum frame size is enforced.

## 10. Envelope

```ts
interface SupervisorEnvelope {
  protocolVersion: 1;
  sessionId: string;
  requestId?: string;
  sequence: number;
  kind: "request" | "response" | "event";
  method: string;
  processId?: string;
  groupId?: string;
  payload: unknown;
}
```

## 11. Sequencing

Each direction has monotonic sequence. Duplicate, decreasing, or invalid request sequence is rejected. Event gaps are explicit.

## 12. Schema validation

Each method has strict schema. Unknown methods/properties fail. Protocol evolution is versioned.

## 13. No shell strings

```ts
interface ProcessSpec {
  executable: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  stdinMode: "closed" | "pipe" | "pty";
  outputPolicy: ProcessOutputPolicy;
  groupId: string;
  purpose:
    | "build"
    | "test"
    | "server"
    | "agent"
    | "judge"
    | "fixture"
    | "doctor";
}
```

Rust never interprets `pnpm dev && echo done` as a command. If a shell is explicitly required, the shell is the executable and the request is classified accordingly.

## 14. Executable validation

Validate:

- nonempty executable;
- no NUL;
- valid CWD;
- allowed root;
- env size;
- arg count/size;
- group existence;
- admission token;
- purpose.

## 15. Approved roots

Coordinator registers:

- repository;
- worktree root;
- session root;
- tool cache;
- package-manager store.

Process CWD must be within approved root.

## 16. Environment filtering

Coordinator constructs environment; Rust applies final deny/allow rules. Sensitive values are tagged and redacted from lifecycle records.

## 17. Output architecture

Control and process bytes are separate.

```text
processes/<process-id>/
  stdout.bin
  stderr.bin
  lifecycle.json
  usage.json
```

Rust drains pipes continuously.

## 18. Binary output benefits

- malformed UTF-8 support;
- ANSI preservation;
- exact replay;
- no cross-process interleaving;
- offset reads;
- crash durability.

## 19. Output notification

```ts
interface OutputAvailableEvent {
  processId: string;
  stream: "stdout" | "stderr";
  offset: number;
  length: number;
  sequence: number;
}
```

Coordinator reads referenced bytes.

## 20. Parsing ownership

TypeScript adapters parse provider formats and server readiness. Rust remains provider-neutral.

## 21. Backpressure

```text
child pipe
→ Rust bounded memory buffer
→ per-process file
→ output event
```

If disk cannot keep up:

1. emit warning;
2. stop admitting workloads;
3. apply output policy;
4. terminate if needed;
5. record truncation.

Never silently discard.

## 22. Output policy

```ts
interface ProcessOutputPolicy {
  maxStdoutMiB: number;
  maxStderrMiB: number;
  retain: "all" | "tail_after_limit";
  liveEvents: boolean;
}
```

## 23. Stdin

Support:

- closed;
- pipe;
- private PTY/ConPTY.

`writeStdin` only for compatible process.

## 24. Private PTY

Private terminal is not user console. Coordinator may write, resize, close, and capture it. Adapter declares need.

## 25. Lifecycle events

```ts
type SupervisorEvent =
  | { kind: "process.started"; processId: string; pid: number }
  | { kind: "process.output_available"; data: OutputAvailableEvent }
  | { kind: "process.resource"; snapshot: ResourceSnapshot }
  | { kind: "process.exited"; processId: string; exit: ProcessExit }
  | { kind: "group.cleanup"; result: CleanupResult }
  | { kind: "listener.changed"; inspection: ListenerInspection }
  | { kind: "supervisor.warning"; code: string; message: string };
```

## 26. TypeScript interface

```ts
interface ProcessSupervisor {
  spawn(spec: ProcessSpec): Promise<ManagedProcess>;
  terminate(processId: string, mode: "graceful" | "force"): Promise<void>;
  terminateGroup(groupId: string, mode: "graceful" | "force"): Promise<CleanupResult>;
  writeStdin(processId: string, data: Uint8Array): Promise<void>;
  subscribe(listener: (event: SupervisorEvent) => void): () => void;
  readOutput(
    processId: string,
    stream: "stdout" | "stderr",
    range: { offset: number; length: number },
  ): Promise<Uint8Array>;
  wait(processId: string): Promise<ProcessExit>;
  getStats(groupId: string): Promise<ResourceSnapshot>;
  listGroupProcesses(groupId: string): Promise<ManagedProcessInfo[]>;
  containsProcess(groupId: string, pid: number): Promise<boolean>;
  inspectListener(endpoint: NetworkEndpoint): Promise<ListenerInspection>;
}
```

## 27. Listener inspection

```ts
interface ListenerInspection {
  endpoint: NetworkEndpoint;
  state: "absent" | "listening" | "connected";
  ownerPid: number | null;
  ownerGroupId: string | null;
  ownershipConfidence: "verified" | "inferred" | "unavailable";
  diagnostics: string[];
}
```

Listener owner may be descendant worker. Validity is group membership, not equality with root command PID.

## 28. Platform inspection

### Windows

Use native TCP tables with owning PID and Job membership.

### Linux

Use `/proc`, netlink, or tested native mechanism.

### macOS

Use supported process/socket inspection. Report unavailable when exact ownership cannot be verified.

## 29. Readiness probes

```ts
type ReadinessProbe =
  | { kind: "tcp"; host: string; port: number }
  | { kind: "http"; path: string; acceptedStatuses: number[]; bodyPattern?: string }
  | { kind: "output"; stream: "stdout" | "stderr" | "either"; pattern: string }
  | { kind: "playwright"; path: string; selector?: string }
  | { kind: "command"; executable: string; args: string[] };
```

No dedicated health endpoint is required.

## 30. Readiness composition

Profile defines required/optional probes, timeout, retry interval, and diagnostics.

Typical:

1. TCP listener exists.
2. Listener belongs to candidate group.
3. HTTP responds.
4. Playwright navigates.

## 31. Port lease

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

## 32. Port modes

### Strict assigned

Choose range, probe, launch strict, verify owner, retry collision.

### Server assigned

Server chooses/reports port, then verify.

### External

User provides URL; lifecycle marked external.

## 33. Bind-release race

Cannot eliminate generic race between probe close and server bind. Detect and retry; never assume lease owns socket.

## 34. Protocol violations

- invalid nonce;
- wrong peer PID;
- oversized frame;
- malformed JSON;
- unsupported version;
- sequence violation;
- unknown method;
- invalid root;
- unknown group;
- stale admission token.

Security-sensitive violation terminates session.

## 35. Audit record

Each request records request ID, method, group/process, accepted/rejected, validation, time, coordinator identity. Sensitive values redacted.

## 36. Tests

- `IPC-001`: nonce correct but PID wrong rejected.
- `IPC-002`: PID correct but nonce wrong rejected.
- `IPC-003`: second connection rejected.
- `IPC-004`: remote pipe client rejected.
- `IPC-005`: Unix socket permissions correct.
- `IPC-006`: peer credentials verified.
- `IPC-007`: oversized frame terminates protocol.
- `IPC-008`: binary stdout exact.
- `IPC-009`: multi-process output separated.
- `IPC-010`: slow reader does not immediately block drain.
- `IPC-011`: truncation explicit.
- `IPC-012`: metacharacters inert.
- `IPC-013`: CWD traversal rejected.
- `IPC-014`: listener owner verified as descendant.
- `IPC-015`: unknown ownership reported honestly.

## 37. Open items

- `OPEN-IPC-001`: Rust IPC/security libraries.
- `OPEN-IPC-002`: protocol compatibility rules.
- `OPEN-IPC-003`: listener inspection implementations.
- `OPEN-IPC-004`: default output limits.
- `OPEN-IPC-005`: ConPTY abstraction.
