/**
 * Host-side read of the OpenCode Go subscription usage: resolve the API key
 * through the credential seam, issue one `curl` through the shell seam, and
 * fold the provider's JSON into the browser-facing view.
 *
 * The key never reaches the command line — it travels in the child's
 * environment — and never reaches the browser, which sees percentages only.
 * This module carries no user-visible copy: failures travel as
 * {@link QuotaErrorCode} values plus raw program output.
 *
 * @module dsh-ocg-used/usage
 */
import type { Context } from '@deepseek-ai/cordis';
import type { QuotaResult } from './protocol.ts';
/** How long one read stays servable, so a reload cannot fan out upstream. */
export declare const QUOTA_CACHE_MS = 15000;
/**
 * Read the subscription usage once.
 * @param ctx - host context carrying the credential and shell seams.
 * @returns the snapshot, or the coded failure the chip renders.
 */
export declare function readQuota(ctx: Context): Promise<QuotaResult>;
