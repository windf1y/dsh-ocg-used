/**
 * Host-side read of the OpenCode Go subscription usage: resolve the API key
 * through the credential seam, issue one host-side HTTP request, and fold the
 * provider's JSON into the browser-facing view.
 *
 * The key stays in the Host process and never reaches the browser, which sees
 * percentages only.
 * This module carries no user-visible copy: failures travel as
 * {@link QuotaErrorCode} values plus bounded upstream diagnostics.
 *
 * @module dsh-ocg-used/usage
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type { Context } from '@deepseek-ai/cordis'
import type { CredentialRef } from '@deepseek-ai/dsh-credentials'
import type { QuotaFailure, QuotaResult, QuotaWindowView } from './protocol.ts'

/** OpenCode Go's subscription usage endpoint. */
const USAGE_URL = 'https://opencode.ai/zen/go/v1/usage'

/** Credential reference holding the `opencode-go` provider key. */
const API_KEY_REF = brandString<CredentialRef>('OPENCODE_GO_API_KEY')

/** Ceiling for the upstream call. */
const REQUEST_TIMEOUT_MS = 25_000

/** Longest diagnostic slice handed to the browser. */
const DETAIL_LIMIT = 300

/** How long one read stays servable, so a reload cannot fan out upstream. */
export const QUOTA_CACHE_MS = 15_000

/** One provider window, as the endpoint reports it. */
interface ProviderWindow {
  readonly status?: unknown
  readonly percent?: unknown
  readonly resetsAt?: unknown
}

/** One failure with no diagnostic detail behind it. */
function failure(code: QuotaFailure['code'], detail: string | null = null): QuotaFailure {
  return { ok: false, code, detail }
}

/** One thrown value's message, for a diagnostic. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Fold one provider window into its browser view.
 *
 * `percent` is the share of that window's allowance already consumed: the
 * three windows nest (the 5-hour allowance is 20% of the monthly one, the
 * weekly 50%), so only a consumed reading keeps 5-hour usage inside weekly
 * usage inside monthly. Reading it as remaining would place more spend in the
 * last 5 hours than in the whole week.
 *
 * @param raw - the window as parsed from the provider payload.
 * @returns the view, or null when the window carries no usable percentage.
 */
function readWindow(raw: unknown): QuotaWindowView | null {
  if (typeof raw !== 'object' || raw === null) return null
  const window = raw as ProviderWindow
  if (typeof window.percent !== 'number' || !Number.isFinite(window.percent)) return null
  const used = Math.max(0, Math.min(100, Math.round(window.percent)))
  return {
    used,
    remaining: 100 - used,
    status: typeof window.status === 'string' ? window.status : 'ok',
    resetsAt: typeof window.resetsAt === 'string' && window.resetsAt !== '' ? window.resetsAt : null,
  }
}

/**
 * Read the subscription usage once.
 * @param ctx - host context carrying the credential seam.
 * @returns the snapshot, or the coded failure the chip renders.
 */
export async function readQuota(ctx: Context): Promise<QuotaResult> {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) return failure('credentials-unavailable')

  let key: string | undefined
  try {
    const resolved = await credentials.resolve(API_KEY_REF)
    key = resolved?.value
  } catch (error) {
    return failure('key-unreadable', messageOf(error).slice(0, DETAIL_LIMIT))
  }
  if (key === undefined || key === '') return failure('key-missing')

  let stdout: string
  try {
    const response = await fetch(USAGE_URL, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    stdout = (await response.text()).trim()
    if (!response.ok) {
      const detail = stdout.slice(0, DETAIL_LIMIT)
      return failure('request-failed', detail === '' ? `HTTP ${String(response.status)}` : `HTTP ${String(response.status)}: ${detail}`)
    }
  } catch (error) {
    return failure('request-failed', messageOf(error).slice(0, DETAIL_LIMIT))
  }

  let payload: unknown
  try {
    payload = JSON.parse(stdout)
  } catch {
    return failure('malformed-response', stdout.slice(0, DETAIL_LIMIT))
  }

  const usage = typeof payload === 'object' && payload !== null
    ? (payload as { usage?: unknown }).usage
    : undefined
  const source = typeof usage === 'object' && usage !== null ? usage as Record<string, unknown> : {}
  const rolling = readWindow(source.rolling)
  const weekly = readWindow(source.weekly)
  const monthly = readWindow(source.monthly)
  if (rolling === null && weekly === null && monthly === null) return failure('empty-usage')

  return { ok: true, rolling, weekly, monthly, fetchedAt: new Date().toISOString() }
}
