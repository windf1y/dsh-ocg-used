/**
 * OpenCode Go quota plugin, node half: one read-only JSON route the browser
 * half polls, over the host credential and shell seams and behind the
 * Connection trust fence. The browser half ships via `exports["./client"]`,
 * discovered through the package.json `dsh.client` declaration.
 *
 * @module dsh-ocg-used
 */
import type { Context } from '@deepseek-ai/cordis';
/** The route needs the web carrier to own a path; Connection gates it. */
export declare const inject: string[];
/**
 * Host plugin body: serve the latest usage snapshot.
 * @param ctx - host context carrying the web carrier.
 */
export declare function apply(ctx: Context): void;
