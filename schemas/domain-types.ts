// Canonical persisted-domain vocabulary for Render Rivals.
// Markdown specifications describe behavior and invariants; they must reference
// these names rather than redefine incompatible local unions.

export type ProjectId = `prj_${string}`;
export type SourceSnapshotId = `src_${string}`;
export type RunId = `run_${string}`;
export type RunConfigurationId = `rcf_${string}`;
export type CandidateId = `can_${string}`;
export type CaptureEpochId = `cep_${string}`;
export type CaptureId = `cap_${string}`;
export type GateResultId = `grs_${string}`;
export type ComparisonId = `cmp_${string}`;
export type EvaluationId = `eva_${string}`;
export type EvidenceRecordId = `evd_${string}`;
export type RecommendationId = `rec_${string}`;
export type UserDecisionId = `dec_${string}`;
export type PromotionId = `pro_${string}`;
export type ArtifactId = `art_${string}`;

export type CandidateRole = "current" | "contender";

export type RecommendationOutcome =
  | "contender_recommended"
  | "current_retained"
  | "tie"
  | "human_review_required"
  | "invalid_run";

export type UserDecisionAction =
  | "accept_recommendation"
  | "retain_current"
  | "decline_recommendation"
  | "select_other_eligible_candidate"
  | "defer"
  | "invalidate_run";

export type PairwiseVerdict =
  | "a_materially_better"
  | "b_materially_better"
  | "no_material_difference"
  | "unable_to_judge";

export type EvaluationPurpose =
  | "generation"
  | "critique"
  | "selection"
  | "order_reversal"
  | "tie_break"
  | "manual";

export interface InferenceUsage {
  provider: string;
  adapter: string;
  model: string | null;
  purpose: EvaluationPurpose;
  startedAt: string;
  completedAt: string;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
  costUsd: number | null;
  policySnapshotId: string;
}

export interface RecommendationRecord {
  id: RecommendationId;
  runId: RunId;
  comparisonIds: ComparisonId[];
  evaluationIds: EvaluationId[];
  outcome: RecommendationOutcome;
  recommendedCandidateId: CandidateId | null;
  consideredCandidateIds: CandidateId[];
  evidenceRecordIds: EvidenceRecordId[];
  gateResultIds: GateResultId[];
  reasonCodes: string[];
  confidence: number | null;
  policySnapshotId: string;
  reproducibilityHash: string;
  createdAt: string;
}

export interface UserDecisionRecord {
  id: UserDecisionId;
  runId: RunId;
  recommendationId: RecommendationId;
  action: UserDecisionAction;
  selectedCandidateId: CandidateId | null;
  rationale: string | null;
  acknowledgedWarningCodes: string[];
  recommendationHash: string;
  evidenceSetHash: string;
  sourceSetHash: string;
  policySnapshotId: string;
  createdAt: string;
}

export interface PromotionRecord {
  id: PromotionId;
  runId: RunId;
  userDecisionId: UserDecisionId;
  candidateId: CandidateId;
  kind: "patch_export" | "branch_create" | "workspace_preserve" | "report_export";
  status: "requested" | "validating_preconditions" | "exporting" | "verifying" | "completed" | "failed" | "cancelled" | "stale";
  outputArtifactIds: ArtifactId[];
  createdAt: string;
  completedAt: string | null;
}

export type RunState =
  | "draft"
  | "validating"
  | "ready"
  | "preparing"
  | "capturing"
  | "gating"
  | "evaluating"
  | "awaiting_decision"
  | "exporting"
  | "completed"
  | "failed"
  | "cancelled"
  | "interrupted";

export type RecoveryDisposition =
  | "resume_from_checkpoint"
  | "retry_current_phase"
  | "restart_capture_epoch"
  | "await_user_correction"
  | "create_superseding_run"
  | "cannot_recover"
  | "cleanup_only";
