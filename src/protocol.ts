/**
 * Wire contract shared by the OpenCode Go quota plugin's two halves: the host
 * half answers this shape from one authenticated route, and the browser half
 * renders it under the composer toolbar.
 *
 * Every field is a scalar the browser renders directly: percentages as whole
 * numbers, instants as ISO strings the browser localizes, and failures as
 * closed codes the browser turns into localized copy. The host half carries no
 * user-visible text.
 *
 * @module dsh-ocg-used/protocol
 */

/** Same-origin route serving the latest quota snapshot. */
export const QUOTA_PATH = '/opencode-go/quota'

/**
 * Subscription windows the provider meters independently, under its own names:
 * `rolling` is the 5-hour window, `weekly` the week, `monthly` the month.
 */
export const QUOTA_WINDOW_KEYS = ['rolling', 'weekly', 'monthly'] as const

/** One metered window in the provider's naming. */
export type QuotaWindowKey = (typeof QUOTA_WINDOW_KEYS)[number]

/** One usage window as the browser receives it. */
export interface QuotaWindowView {
  /** Whole percent already consumed in this window. */
  readonly used: number
  /** Whole percent still available in this window. */
  readonly remaining: number
  /** Provider status flag; `ok` unless that window is exhausted or limited. */
  readonly status: string
  /** ISO instant this window resets, or null when the provider omitted it. */
  readonly resetsAt: string | null
}

/** One successful read. */
export interface QuotaSnapshot {
  readonly ok: true
  /** 5-hour window, or null when the provider did not report it. */
  readonly rolling: QuotaWindowView | null
  /** Weekly window, or null when the provider did not report it. */
  readonly weekly: QuotaWindowView | null
  /** Monthly window, or null when the provider did not report it. */
  readonly monthly: QuotaWindowView | null
  /** ISO instant of this read. */
  readonly fetchedAt: string
}

/**
 * Why a read failed, as a closed set the browser maps to localized copy.
 *
 * - `credentials-unavailable` — this deployment mounts no credential provider.
 * - `shell-unavailable` — this deployment mounts no shell executor.
 * - `key-unreadable` — the credential provider refused to resolve the key.
 * - `key-missing` — no `OPENCODE_GO_API_KEY` is configured.
 * - `request-failed` — the upstream call could not run or exited non-zero.
 * - `malformed-response` — the upstream body was not the expected JSON.
 * - `empty-usage` — the body carried no readable window.
 */
export type QuotaErrorCode =
  | 'credentials-unavailable'
  | 'shell-unavailable'
  | 'key-unreadable'
  | 'key-missing'
  | 'request-failed'
  | 'malformed-response'
  | 'empty-usage'

/** One failed read. */
export interface QuotaFailure {
  readonly ok: false
  readonly code: QuotaErrorCode
  /** Raw diagnostic detail (program output), rendered verbatim; null when none. */
  readonly detail: string | null
}

/** What the quota route answers. */
export type QuotaResult = QuotaSnapshot | QuotaFailure
