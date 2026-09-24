/**
 * OpenCode Go quota plugin, browser half: contributes one composer-toolbar
 * control row that renders the subscription's three metered windows. The
 * numbers arrive from this package's own host route, so the plugin issues no
 * Remote call and reads no service beyond the slot and locale registries.
 *
 * @module dsh-ocg-used/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { QuotaChip } from './QuotaChip.tsx'
import { en, NS, zh, type QuotaKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Composer-toolbar quota chip copy. */
    opencodeGoQuota: QuotaKey
  }
}

/** Required services for dictionary registration and the composer contribution. */
export const inject = ['locale', 'slots']

/**
 * Client plugin body: register the dictionaries and the toolbar control.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-opencode-go-quota: dictionaries')
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'opencode-go-quota',
    // After the model selector: provider identity reads before its allowance.
    order: 20,
    locale: NS,
  }, QuotaChip))
}
