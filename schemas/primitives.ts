// Canonical JSON-facing primitive vocabulary for Render Rivals.
// Runtime validators, not TypeScript template types alone, enforce the exact
// lexical and numeric constraints defined by spec/18.

export type Sha256Digest = `sha256:${string}`;
export type CanonicalUtcTimestamp = string;
export type CanonicalDecimal = string;
export type CanonicalRelativePath = string;
export type SafeInteger = number;
export type NonNegativeSafeInteger = number;
export type PositiveSafeInteger = number;
export type Revision = number;
export type EventSequence = number;
export type ByteCount = number;
export type DurationMilliseconds = number;
export type DurationNanoseconds = number;
export type Confidence = number;

export type CurrencyCode = "USD";

export type MonetaryAmountBasis =
  | "provider_reported"
  | "computed_from_usage"
  | "estimated";

export interface MonetaryAmount {
  currency: CurrencyCode;
  amountDecimal: CanonicalDecimal;
  basis: MonetaryAmountBasis;
  pricingSnapshotHash: Sha256Digest | null;
}
