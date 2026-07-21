# 18 — Canonical Primitives, JSON, Hashing, and Measurements

**Status:** Canonical implementation contract  
**Scope:** Cross-language JSON canonicalization, digest encoding, timestamps, integers, durations, confidence, money, token/resource accounting, units, paths, and golden fixtures  
**Primitive types:** `schemas/primitives.ts`  
**Storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**Accounting:** `spec/07-storage-security-and-configuration.md`

## 1. Purpose

Render Rivals hashes canonical records in TypeScript and verifies them in Rust. It also persists timestamps, token counts, byte counts, durations, confidence, and monetary usage. Informal rules such as “sort object keys” or “store a number” are not sufficient for cross-language identity.

This specification defines one lexical and numeric representation for every shared primitive used in persisted JSON, protocol fixtures, hashes, API bodies, reports, and diagnostics.

## 2. Shared primitive authority

`schemas/primitives.ts` is the sole shared TypeScript vocabulary for:

- SHA-256 digest strings;
- canonical UTC timestamps;
- canonical decimal strings;
- canonical relative paths;
- safe integer/count/revision/sequence aliases;
- byte and duration units;
- confidence;
- monetary amounts and cost basis.

Runtime validators and generated JSON Schema enforce exact lexical/range rules. Type aliases alone are not proof of validity.

## 3. Canonical JSON

Canonical JSON bytes used for hashing follow the JSON Canonicalization Scheme defined by RFC 8785, with Render Rivals restrictions below.

Rules:

- UTF-8 without BOM;
- no trailing newline inside the hashed canonical byte sequence unless the containing format explicitly defines it as content;
- object property ordering and string escaping follow JCS;
- only finite JSON numbers;
- every integer is within JavaScript safe-integer range;
- values requiring exact decimal precision beyond safe JSON-number semantics are strings using the canonical decimal format;
- duplicate object keys are rejected before canonicalization;
- invalid Unicode scalar sequences are rejected rather than repaired differently by runtimes;
- arrays preserve semantic order; callers sort only when the schema declares the collection unordered and defines the sort key;
- omitted and explicit `null` remain semantically distinct according to schema;
- unknown fields are rejected or preserved only through explicitly allowed extension maps before hashing;
- canonicalization version is bound through schema/version/policy inputs, not inferred from library version.

Human-readable canonical JSON files may add a final LF after the serialized JSON document. The LF is not part of an entity’s canonical JCS hash unless the schema explicitly hashes file bytes rather than the JSON value.

## 4. JSON parser requirements

All canonical readers:

- reject BOM where canonical JSON forbids it;
- reject comments and trailing commas;
- reject duplicate keys;
- reject NaN, infinity, negative zero where JCS normalization would create ambiguity for a field whose schema disallows it, and unsafe integers;
- reject invalid UTF-8;
- retain exact strings without Unicode normalization unless a field-specific rule requires normalized text;
- report a stable schema/path error rather than silently coercing string/number/boolean types.

JSONC is accepted only for user/project configuration before validation/resolution. Canonical persisted entities, events, API envelopes, and hash inputs use strict JSON values.

## 5. SHA-256 digest encoding

Every SHA-256 digest serialized in canonical JSON uses:

```text
sha256:<64 lowercase hexadecimal characters>
```

Examples:

```text
sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

Rules:

- prefix is lowercase exactly `sha256:`;
- digest has exactly 64 lowercase hex characters;
- no unprefixed hex, uppercase hex, base64, `0x`, whitespace, or abbreviated digest;
- validators reject an algorithm/prefix not registered for that field;
- UI may display a shortened digest, but copy/API/export preserves full canonical value;
- equality compares complete normalized string;
- field names such as `sha256` do not permit a raw value—the value still includes the prefix;
- future algorithms require a specification/schema version and cannot be substituted under a `sha256:` field.

Existing prose examples with raw `"..."` SHA values are interpreted as abbreviated display placeholders, not an alternate serialized format.

## 6. Hash input classes

### Raw file/payload hash

SHA-256 over exact file bytes. No newline, text, encoding, line-ending, or Unicode normalization is added.

Used for:

- Artifact payloads;
- source/workspace files;
- native executables/packages;
- raw evaluator/process output;
- export files.

### Canonical JSON value hash

SHA-256 over RFC 8785 canonical UTF-8 bytes of the validated JSON value.

Used for:

- resolved Run Configuration;
- Source Manifest;
- event value excluding `eventHash`;
- evaluation packet/input manifest;
- policy snapshot;
- Recommendation reproducibility inputs;
- compatibility/package manifests when JSON-backed.

### Ordered composite hash

When a hash binds multiple already-hashed components, the schema defines one canonical JSON object/array containing named full digest strings and metadata, then hashes that JCS value. Implementations do not concatenate bare strings or bytes ad hoc.

Every hashable schema documents:

- input value/bytes;
- fields excluded and why;
- ordering rule;
- schema/canonicalization version;
- whether secrets are represented by references rather than raw values;
- expected digest field.

## 7. Event hashing

For a canonical Event:

1. validate full event with `eventHash` omitted or set aside;
2. construct the exact hash-input object defined by the Event schema, including `previousEventHash`;
3. canonicalize through JCS;
4. SHA-256 hash canonical bytes;
5. serialize full lowercase-prefixed digest as `eventHash`.

`previousEventHash` is `null` for sequence 1 and otherwise equals the preceding complete Event’s full digest.

The NDJSON line’s final LF is framing and is not part of `eventHash`. Changing insignificant JSON whitespace without changing the parsed value does not change Event hash; changing value, key, array order, or numeric value does.

## 8. Timestamps

Canonical persisted wall-clock timestamps use exactly:

```text
YYYY-MM-DDTHH:mm:ss.sssZ
```

Rules:

- UTC only, suffix uppercase `Z`;
- exactly three fractional digits (milliseconds);
- four-digit year within implementation-supported range declared by schema;
- valid Gregorian date/time;
- no timezone offsets, leap-second `:60`, omitted fraction, extra fractional precision, lowercase `z`, or local time;
- serializers truncate/round source clocks according to one tested policy before persistence; MVP uses truncation toward the earlier millisecond to avoid claiming unobserved precision;
- ordering uses parsed instant, never locale string comparison outside validated canonical form;
- timestamps record wall-clock facts and may move backward if system clock changes, so they are not used alone for duration, timeout, sequence, or causality.

## 9. Monotonic durations and deadlines

Runtime elapsed time uses monotonic clocks when available.

Persisted durations use nonnegative safe integers with explicit unit in field name/schema:

- `...Ms` for integer milliseconds;
- `...Ns` for integer nanoseconds only when required and within safe range;
- resource CPU times may use integer nanoseconds/microseconds as explicitly named;
- no unitless `duration`, `timeout`, `latency`, or `elapsed` numeric fields;
- no floating seconds;
- deadline policies store configured duration, while wall-clock deadline timestamp may be derived/displayed separately;
- clock discontinuity does not produce negative duration.

When source precision exceeds persisted precision, the measurement records rounding/truncation policy or uses the finer declared integer unit.

## 10. Safe integers

The following are nonnegative JavaScript safe integers unless a narrower bound is declared:

- revisions;
- event sequences;
- attempt numbers;
- token counts;
- byte lengths/counts;
- process counts;
- retry counts;
- timestamps represented as durations;
- output offsets/lengths;
- pagination limits;
- resource measurements that fit.

Rules:

- maximum `9_007_199_254_740_991` in JSON, though schemas impose much smaller operational limits;
- no fractional, exponential-text-specific, negative, unsafe, string-coerced, or bigint JSON values;
- increment overflow fails rather than wrapping;
- byte offset plus length is checked for overflow before file access;
- Rust conversions use checked integer conversion.

Large values outside safe range use a canonical decimal string only when a schema explicitly introduces one; they are not silently rounded.

## 11. Revisions and sequences

- mutable entity revision begins at `1` when first canonical snapshot is created;
- each successful replacement increments exactly by one;
- event sequence begins at `1` and increments exactly by one within its stream;
- attempt ordinal begins at `1` within the declared owner;
- zero is invalid unless a specific precreation draft/projection schema explicitly permits it;
- revisions, sequences, and ordinals are not interchangeable IDs;
- UI page indexes may be zero-based internally but never leak into canonical entity attempt/sequence meaning.

## 12. Confidence and ratios

Canonical confidence is a finite JSON number in `[0,1]` or explicit `null` when unknown/unsupported.

Rules:

- no NaN/infinity;
- no values below 0 or above 1;
- no percentage integer in a confidence field;
- no unbounded precision promise;
- policy defines comparison tolerance/threshold independently from serializer;
- display rounding never changes persisted value;
- aggregate confidence algorithm/version is part of policy snapshot;
- `null` is not converted to zero.

Other ratios/proportions declare their own range and meaning; they do not reuse confidence solely because both happen to be numbers.

## 13. Canonical decimal strings

Exact decimal values use:

```text
0
0.01
12.345678
```

Rules:

- ASCII digits plus optional single decimal point;
- no exponent, plus sign, grouping separator, whitespace, currency symbol, leading decimal point, or trailing decimal point;
- no leading zeros except value `0` or `0.<fraction>`;
- no negative value unless the field explicitly permits it; monetary cost is nonnegative;
- no trailing fractional zeros except when field-specific scale requires them; MVP monetary amount strips trailing zeros and removes decimal point when fraction becomes empty;
- zero is exactly `0`, never `-0` or `0.0`;
- schema declares maximum whole/fraction digits;
- comparisons/calculation use decimal arithmetic, not binary floating point.

## 14. Monetary accounting

`MonetaryAmount` uses:

- `currency="USD"` in MVP;
- `amountDecimal` canonical nonnegative decimal string;
- `basis`:
  - `provider_reported`;
  - `computed_from_usage`;
  - `estimated`;
- `pricingSnapshotHash`:
  - required for computed/estimated cost;
  - optional/null only when provider reports a final cost and pricing inputs are unavailable;
  - full canonical SHA-256 digest of stored pricing/policy metadata when present.

`InferenceUsage.cost` is `MonetaryAmount | null`, not a JSON floating-point dollar value.

Rules:

- unknown cost remains null;
- null token counts do not become zero for cost calculations;
- computed cost records exact token categories/rates/rounding in referenced pricing snapshot;
- estimated cost is labeled and never displayed as provider-billed fact;
- currency conversions are outside MVP;
- sums use exact decimal arithmetic and state whether unknown components make total partial;
- UI may format currency, but exports/API retain canonical amount and basis;
- Recommendation never uses cost unless frozen evaluation policy explicitly includes it, and first quality proof treats it as telemetry.

## 15. Token and inference counts

Token fields are nonnegative safe integers or null:

- input;
- output;
- cached input;
- reasoning;
- any future provider-specific category added through versioned extension.

Rules:

- unknown remains null;
- provider-reported zero may be zero;
- no inference from text length when provider does not report tokens unless explicitly stored as estimated separate metric;
- categories do not double-count in derived totals without provider-specific documented formula;
- raw provider usage and normalized usage/provenance remain auditable;
- retries are separate invocation facts and are not overwritten/merged.

## 16. Bytes, storage, and memory

Canonical measured byte values use integer bytes.

Configuration may expose MiB for usability only when field is explicitly `...MiB`; one MiB equals `1_048_576` bytes.

Rules:

- MB and MiB are not interchangeable;
- persisted resource observation identifies bytes or exact binary unit;
- conversions use checked integer arithmetic and documented rounding;
- disk admission compares bytes after conversion;
- screenshot/image dimensions are integer CSS/device pixels with explicit field names;
- device scale factor may be finite positive number under capture schema, not byte/count primitive.

## 17. CPU and percentages

- cumulative CPU time uses explicit integer duration unit;
- instantaneous CPU utilization, when exposed, declares interval, core normalization, range, and sampling source;
- no ambiguous `cpu: 80` field;
- percentages use explicit `...Percent` finite number in `[0,100]` only in derived metrics, never where a fraction `[0,1]` is expected;
- platform-unavailable values remain null.

## 18. Paths

Canonical relative paths use `CanonicalRelativePath` and the path rules from `spec/11`/`spec/14`:

- `/` separator;
- no absolute/drive/UNC prefix;
- no empty, `.` or `..` segment;
- no NUL;
- normalized field-specific Unicode policy;
- root containment verified after platform path resolution;
- display paths and filesystem/native paths are distinct from canonical relative path identity.

Absolute local paths may exist only in local sensitive diagnostics/configuration fields whose schema explicitly permits them. They are never hashed as portable identity unless path identity is intentionally part of that specific local record.

## 19. Media types and encodings

- media type is lowercase type/subtype plus normalized parameters according to schema;
- binary bytes are stored as Artifacts/files, not embedded as unrestricted base64 in canonical JSON;
- small protocol binary fields require explicit base64url/no-padding schema if ever introduced;
- text encoding is UTF-8 unless media/schema says otherwise;
- raw process output has no assumed text encoding.

## 20. Hash and numeric migration

Pre-scaffold documents may contain abbreviated or inconsistent illustrative values. Executable writer version 1 emits only this specification.

If any pre-implementation fixture is imported:

- raw/unprefixed digest is not accepted as canonical v1 without an explicit migration that verifies 64 hex and prepends algorithm;
- floating cost is converted only with exact original lexical input and explicit migration/provenance; otherwise cost becomes null with migration limitation;
- noncanonical timestamp is parsed only when unambiguous and rewritten into a new copy with migration record;
- migration never silently changes hash-bound meaning.

## 21. Golden fixture requirements

Cross-language TypeScript/Rust goldens cover:

- RFC 8785 object ordering/escaping/numbers;
- empty object/array/string and Unicode edge cases;
- duplicate key and invalid UTF-8 rejection;
- raw payload hash and canonical JSON hash;
- event hash chain excluding NDJSON LF;
- full lowercase-prefixed digest validation;
- timestamp lexical validity and millisecond truncation;
- safe-integer boundaries/overflow;
- revision/sequence starting/increment rules;
- confidence ranges/null;
- decimal normalization/rejection;
- exact monetary sum/computed/estimated/provider-reported cases;
- token null versus zero;
- bytes/MiB conversion;
- path normalization/rejection;
- identical logical input producing identical bytes/digest on Windows and Linux.

Golden files include expected canonical UTF-8 bytes, expected digest, and invalid-case stable path/code.

## 22. Required conformance changes

Executable schemas and code must:

- use `Sha256Digest` for every canonical SHA-256 field;
- use `CanonicalUtcTimestamp` for persisted timestamps;
- use safe integer aliases/ranges for counts/revisions/sequences;
- use explicit units in field names/types;
- replace floating persisted dollar costs with `MonetaryAmount | null`;
- generate/hash only validated canonical values;
- fail documentation/schema conformance on raw digest examples presented as literal canonical JSON values without an explicit abbreviation marker.

## 23. Nonconforming behavior

- different Rust/TypeScript canonical bytes for same validated value;
- unprefixed/uppercase/base64 SHA-256 in canonical JSON;
- hashing pretty-printed file whitespace instead of canonical value when value hash is required;
- hashing NDJSON framing LF as part of Event value;
- using local time/offset/variable fractional timestamps;
- unsafe/fractional revisions, sequences, offsets, or token counts;
- floating-point persisted currency;
- ambiguous unitless duration/size/CPU fields;
- coercing unknown measurements to zero;
- normalizing raw file bytes before content hashing;
- using filesystem path string as portable content identity.
