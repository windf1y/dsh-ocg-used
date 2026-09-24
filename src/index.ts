/**
 * OpenCode Go quota plugin, node half: one read-only JSON route the browser
 * half polls, over the host credential and shell seams and behind the
 * Connection trust fence. The browser half ships via `exports["./client"]`,
 * discovered through the package.json `dsh.client` declaration.
 *
 * @module dsh-ocg-used
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { QUOTA_PATH, type QuotaResult } from './protocol.ts'
import { QUOTA_CACHE_MS, readQuota } from './usage.ts'

/** The route needs the web carrier to own a path; Connection gates it. */
export const inject = ['webServer']

/**
 * Host plugin body: serve the latest usage snapshot.
 * @param ctx - host context carrying the web carrier.
 */
export function apply(ctx: Context): void {
  // One read serves every reload inside the window: the upstream call is a
  // metered request against the very quota being displayed.
  let cached: { readonly at: number, readonly value: QuotaResult } | undefined

  ctx.inject(['connection', 'webServer'], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.register({
      kind: 'exact',
      path: QUOTA_PATH,
      handler: async (req, res) => {
        // The route sits outside Connection's `/api` channel, so it applies the
        // same trust fence and browser authentication itself rather than
        // answering any peer that can reach the port.
        const rejection = webCtx.connection.requestRejection(req)
        if (rejection !== undefined) {
          res.writeHead(rejection)
          res.end(rejection === 401 ? 'unauthorized' : 'forbidden')
          return
        }
        // Named routes match ahead of the carrier's method gate, so a non-GET
        // hit is answered here rather than falling through to the SPA.
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { allow: 'GET, HEAD' })
          res.end()
          return
        }
        const now = Date.now()
        if (cached === undefined || now - cached.at > QUOTA_CACHE_MS) {
          cached = { at: now, value: await readQuota(ctx) }
        }
        const body = JSON.stringify(cached.value)
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'content-length': String(Buffer.byteLength(body)),
        })
        res.end(req.method === 'HEAD' ? undefined : body)
      },
    }), 'ui-opencode-go-quota: usage route')
  })
}
