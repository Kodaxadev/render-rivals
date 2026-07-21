// Canonical operation-ledger vocabulary for Render Rivals.
// spec/19 defines persistence, idempotency, reconciliation, and state rules.

import type {
  ApiCommandName,
} from "./api-types.js";
import type {
  ArtifactId,
  OperationId,
  PolicySnapshotId,
  ProjectId,
  RecoveryDisposition,
  RunId,
  SessionId,
} from "./domain-types.js";
import type { ErrorCode } from "./error-codes.js";
import type {
  CanonicalRelativePath,
  CanonicalUtcTimestamp,
  Revision,
  Sha256Digest,
} from "./primitives.js";

export type OperationScope = "installation" | "project" | "run" | "session";

export type OperationState =
  | "accepted"
  | "running"
  | "reconciling"
  | "completed"
  | "failed"
  | "cancelled"
  | "interrupted";

export interface OperationResultReference {
  entityIds: string[];
  artifactIds: ArtifactId[];
  resultPath: CanonicalRelativePath | null;
  resultHash: Sha256Digest | null;
}

export interface OperationRecord {
  id: OperationId;
  scope: OperationScope;
  command: ApiCommandName;
  requestHash: Sha256Digest;
  payloadHash: Sha256Digest;
  policySnapshotId: PolicySnapshotId | null;
  sessionId: SessionId;
  projectId: ProjectId | null;
  runId: RunId | null;
  targetEntityId: string | null;
  expectedRevision: Revision | null;
  state: OperationState;
  revision: Revision;
  acceptedAt: CanonicalUtcTimestamp;
  startedAt: CanonicalUtcTimestamp | null;
  terminalAt: CanonicalUtcTimestamp | null;
  lastUpdatedAt: CanonicalUtcTimestamp;
  result: OperationResultReference | null;
  failureCode: ErrorCode | null;
  recoveryDisposition: RecoveryDisposition | null;
  sideEffectProofArtifactIds: ArtifactId[];
  supersededByOperationId: OperationId | null;
}
