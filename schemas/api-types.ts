// Canonical local dashboard/CLI-adjacent API vocabulary for Render Rivals.
// Runtime Zod/JSON Schema validators must enforce command-specific payloads,
// size limits, revision rules, relative paths, pagination cursors, and the
// status/error invariants defined by spec/17.

import type {
  OperationId,
  RecoveryDisposition,
} from "./domain-types.js";
import type { ErrorCode } from "./error-codes.js";
import type {
  CanonicalUtcTimestamp,
  Revision,
} from "./primitives.js";

export type ApiCommandName =
  | "project.register"
  | "project.doctor"
  | "run.create"
  | "run.validate"
  | "run.start"
  | "run.cancel"
  | "run.retry"
  | "run.recover"
  | "decision.record"
  | "promotion.create"
  | "export.create"
  | "cleanup.execute"
  | "session.logout";

export type ApiOperationState =
  | "accepted"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ApiProjectionKind = "canonical" | "derived";

export interface ApiCommandRequest<TPayload> {
  schema: "render-rivals/api-command-request";
  schemaVersion: "1.0.0";
  operationId: OperationId;
  expectedRevision: Revision | null;
  command: ApiCommandName;
  payload: TPayload;
}

export interface ApiCommandAccepted {
  schema: "render-rivals/api-command-accepted";
  schemaVersion: "1.0.0";
  ok: true;
  accepted: true;
  operationId: OperationId;
  command: ApiCommandName;
  acceptedAt: CanonicalUtcTimestamp;
  targetEntityId: string | null;
  currentRevision: Revision | null;
  statusPath: `/api/v1/operations/${string}`;
}

export interface ApiOperationStatus<TResult = unknown> {
  schema: "render-rivals/api-operation-status";
  schemaVersion: "1.0.0";
  ok: true;
  operationId: OperationId;
  command: ApiCommandName;
  state: ApiOperationState;
  acceptedAt: CanonicalUtcTimestamp;
  startedAt: CanonicalUtcTimestamp | null;
  terminalAt: CanonicalUtcTimestamp | null;
  targetEntityId: string | null;
  currentRevision: Revision | null;
  result: TResult | null;
  resultPath: string | null;
  error: ApiErrorBody | null;
}

export interface ApiQueryResponse<TData> {
  schema: "render-rivals/api-query-response";
  schemaVersion: "1.0.0";
  ok: true;
  projection: ApiProjectionKind;
  revision: Revision | null;
  generatedAt: CanonicalUtcTimestamp;
  data: TData;
}

export interface ApiPage<TItem> {
  items: TItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  operationId: OperationId | null;
  currentRevision: Revision | null;
  allowedCommands: ApiCommandName[];
  recoveryDisposition: RecoveryDisposition | null;
  details: Record<string, unknown> | null;
}

export interface ApiErrorResponse {
  schema: "render-rivals/api-error-response";
  schemaVersion: "1.0.0";
  ok: false;
  error: ApiErrorBody;
}
