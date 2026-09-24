/**
 * OpenCode Go quota plugin, browser half: contributes one composer-toolbar
 * control row that renders the subscription's three metered windows. The
 * numbers arrive from this package's own host route, so the plugin issues no
 * Remote call and reads no service beyond the slot and locale registries.
 *
 * @module dsh-ocg-used/client
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type QuotaKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Composer-toolbar quota chip copy. */
        opencodeGoQuota: QuotaKey;
    }
}
/** Required services for dictionary registration and the composer contribution. */
export declare const inject: string[];
/**
 * Client plugin body: register the dictionaries and the toolbar control.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
