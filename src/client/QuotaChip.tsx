/**
 * The composer-toolbar quota chip: three metered windows of the OpenCode Go
 * subscription, each rendered as the share still available, with the used
 * share, the percentage split, and the reset instant in the hover panel.
 *
 * The component owns exactly two local facts — the latest read and whether the
 * panel is open — and reaches the host through the package's own route, which
 * the apply world already authenticated. All copy comes from the `opencodeGoQuota`
 * dictionary; every color comes from a theme token through the CSS module.
 *
 * @module dsh-ocg-used/client/QuotaChip
 */

import type { PropsLocale, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { useEffect, useState, type ReactElement } from 'react'
import {
  QUOTA_PATH,
  type QuotaErrorCode,
  type QuotaFailure,
  type QuotaResult,
  type QuotaWindowKey,
  type QuotaWindowView,
} from '../protocol.ts'
import { NS, type QuotaKey } from './locales.ts'
import css from './QuotaChip.module.css'

/** Full props for the resident composer's right-hand control row. */
export type QuotaChipProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>

/** One upstream read per minute, unless the user asks for one. */
const REFRESH_MS = 60_000

/** The three windows in display order, with their dictionary keys. */
const WINDOWS: readonly {
  readonly key: QuotaWindowKey
  readonly name: QuotaKey
  readonly short: QuotaKey
}[] = [
  { key: 'rolling', name: 'window.rolling', short: 'window.rolling.short' },
  { key: 'weekly', name: 'window.weekly', short: 'window.weekly.short' },
  { key: 'monthly', name: 'window.monthly', short: 'window.monthly.short' },
]

/** Every failure code's dictionary key. */
const ERROR_KEYS: Record<QuotaErrorCode, QuotaKey> = {
  'credentials-unavailable': 'error.credentials-unavailable',
  'shell-unavailable': 'error.shell-unavailable',
  'key-unreadable': 'error.key-unreadable',
  'key-missing': 'error.key-missing',
  'request-failed': 'error.request-failed',
  'malformed-response': 'error.malformed-response',
  'empty-usage': 'error.empty-usage',
}

/** This namespace's translate seat. */
type Translate = TranslateNS<typeof NS>

/** Two-digit zero padding for a clock label. */
function pad2(value: number): string {
  return value < 10 ? `0${String(value)}` : String(value)
}

/**
 * Join class names, dropping the ones a CSS-module lookup did not resolve.
 * @param parts - class names, any of which may be absent.
 * @returns the space-joined names present.
 */
function cx(...parts: readonly (string | undefined)[]): string {
  return parts.filter((part): part is string => part !== undefined).join(' ')
}

/**
 * Warn as a window drains: a third consumed is worth noticing, nine tenths is
 * worth acting on.
 * @param remaining - whole percent still available in the window.
 * @returns the tone class carrying that state's token color.
 */
function toneClass(remaining: number): string | undefined {
  if (remaining > 30) return css.toneOk
  if (remaining > 10) return css.toneWarn
  return css.toneAlert
}

/**
 * Break one reset instant into local calendar fields.
 * @param iso - the provider's instant.
 * @returns the local month, day, and `HH:MM`, or null when unusable.
 */
function resetParts(iso: string | null): { readonly month: number, readonly day: number, readonly time: string } | null {
  if (iso === null) return null
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return null
  return {
    month: at.getMonth() + 1,
    day: at.getDate(),
    time: `${pad2(at.getHours())}:${pad2(at.getMinutes())}`,
  }
}

/**
 * Render the coarse time left before one reset.
 * @param iso - the provider's instant.
 * @param t - the namespace translate seat.
 * @returns a duration, the imminent-reset phrase, or null when unknown.
 */
function remainingText(iso: string | null, t: Translate): string | null {
  if (iso === null) return null
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return null
  const ms = at.getTime() - Date.now()
  if (ms <= 0) return t('reset.soon')
  const minutes = Math.floor(ms / 60_000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60
  if (days > 0) return t('duration.days', { days, hours })
  if (hours > 0) return t('duration.hours', { hours, minutes: rest })
  return t('duration.minutes', { minutes: rest })
}

/**
 * Render one window's reset line.
 * @param window - the window whose instant is described.
 * @param t - the namespace translate seat.
 * @returns the reset instant followed by the countdown, or the unknown phrase.
 */
function resetLine(window: QuotaWindowView, t: Translate): string {
  const parts = resetParts(window.resetsAt)
  if (parts === null) return t('reset.unknown')
  const at = t('reset.at', parts)
  const remaining = remainingText(window.resetsAt, t)
  return remaining === null ? at : `${at}${t('sep.inline')}${t('reset.remaining', { duration: remaining })}`
}

/**
 * Render one failure with its raw diagnostic detail, if any.
 * @param failure - the coded failure the host answered.
 * @param t - the namespace translate seat.
 * @returns the localized message, plus the untouched detail.
 */
function failureText(failure: QuotaFailure, t: Translate): string {
  const message = t(ERROR_KEYS[failure.code])
  return failure.detail === null ? message : `${message}${t('sep.label')}${failure.detail}`
}

/**
 * Render the multi-line tooltip summary of one read.
 * @param result - the latest read.
 * @param t - the namespace translate seat.
 * @returns one header line plus one line per reported window.
 */
function summaryText(result: QuotaResult | null, t: Translate): string {
  if (result === null) return t('chip.loading')
  if (!result.ok) return `${t('pop.title')}\n${failureText(result, t)}`
  const lines = [t('pop.title')]
  for (const entry of WINDOWS) {
    const window = result[entry.key]
    if (window === null) continue
    lines.push([
      t(entry.name),
      t('value.remaining', { percent: window.remaining }),
      t('value.used', { percent: window.used }),
      resetLine(window, t),
    ].join(t('sep.inline')))
  }
  return lines.join('\n')
}

/**
 * The composer-toolbar quota chip.
 * @param props - the slot's runtime share plus this namespace's translate seat.
 * @returns the chip, with its hover panel while the pointer is inside it.
 */
export function QuotaChip({ t }: QuotaChipProps): ReactElement {
  const [result, setResult] = useState<QuotaResult | null>(null)
  const [tick, setTick] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async (): Promise<void> => {
      try {
        const response = await fetch(QUOTA_PATH, {
          headers: { accept: 'application/json' },
          cache: 'no-store',
        })
        const payload = await response.json() as QuotaResult
        if (alive) setResult(payload)
      } catch {
        // The route answered nothing at all: the coded failure is the whole
        // fact, and the transport message carries no detail worth showing.
        if (alive) setResult({ ok: false, code: 'request-failed', detail: null })
      }
    }
    void load()
    return () => { alive = false }
  }, [tick])

  useEffect(() => {
    const handle = window.setInterval(() => { setTick(value => value + 1) }, REFRESH_MS)
    return () => { window.clearInterval(handle) }
  }, [])

  const summary = summaryText(result, t)
  const children: ReactElement[] = [
    <span className={css.brand} key="brand">{t('chip.brand')}</span>,
  ]

  if (result === null) {
    children.push(<span className={css.label} key="loading">{t('chip.loading')}</span>)
  } else if (!result.ok) {
    children.push(
      <span className={css.item} key="failure">
        <span className={cx(css.dot, css.toneAlert)} />
        <span className={css.err}>{t('chip.unavailable')}</span>
      </span>,
    )
  } else {
    for (const entry of WINDOWS) {
      const window = result[entry.key]
      if (window === null) continue
      const tone = toneClass(window.remaining)
      children.push(
        <span className={css.item} key={entry.key}>
          <span className={css.label}>{t(entry.short)}</span>
          <span className={css.track}>
            <span className={cx(css.fill, tone)} style={{ width: `${String(window.remaining)}%` }} />
          </span>
          <span className={cx(css.value, tone)}>{t('value.percent', { percent: window.remaining })}</span>
        </span>,
      )
    }
  }

  if (hovered) {
    if (result !== null && !result.ok) {
      children.push(
        <div className={css.pop} key="panel">
          <div className={css.popHead}><span>{t('pop.title')}</span></div>
          <div className={css.err}>{failureText(result, t)}</div>
        </div>,
      )
    } else if (result !== null) {
      children.push(
        <div className={css.pop} key="panel">
          <div className={css.popHead}>
            <span>{t('pop.title')}</span>
            <span>{t('pop.updated', { time: new Date(result.fetchedAt).toTimeString().slice(0, 5) })}</span>
          </div>
          {WINDOWS.map((entry) => {
            const window = result[entry.key]
            if (window === null) return null
            const tone = toneClass(window.remaining)
            return (
              <div className={css.row} key={entry.key}>
                <div className={css.rowTop}>
                  <span className={css.rowName}>{t(entry.name)}</span>
                  <span>
                    {t('value.remaining', { percent: window.remaining })}
                    {t('sep.inline')}
                    {t('value.used', { percent: window.used })}
                  </span>
                </div>
                <div className={css.rowTrack}>
                  <div className={cx(css.rowFill, tone)} style={{ width: `${String(window.remaining)}%` }} />
                </div>
                <div className={css.rowSub}>{resetLine(window, t)}</div>
              </div>
            )
          })}
          <div className={css.popFoot}>{t('pop.foot')}</div>
        </div>,
      )
    }
  }

  return (
    <div
      aria-label={t('pop.title')}
      className={css.chip}
      onClick={() => { setTick(value => value + 1) }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') setTick(value => value + 1)
      }}
      onMouseEnter={() => { setHovered(true) }}
      onMouseLeave={() => { setHovered(false) }}
      role="button"
      tabIndex={0}
      title={summary}
    >
      {children}
    </div>
  )
}
