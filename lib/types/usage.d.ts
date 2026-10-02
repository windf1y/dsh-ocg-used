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
import type { Context } from '@deepseek-ai/cordis';
import type { QuotaResult } from './protocol.ts';
/** How long one read stays servable, so a reload cannot fan out upstream. */
export declare const QUOTA_CACHE_MS = 15000;
/**
 * Read the subscription usage once.
 * @param ctx - host context carrying the credential seam.
 * @returns the snapshot, or the coded failure the chip renders.
 */
export declare function readQuota(ctx: Context): Promise<QuotaResult>;
