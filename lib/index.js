//#region lib/types/protocol.js
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
const QUOTA_PATH = "/opencode-go/quota";
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+dsh-brand@0.1.7-rc.1_@deepseek-ai+cordis@4.0.4/node_modules/@deepseek-ai/dsh-brand/lib/index.js
/**
* Duplicate-install-safe nominal primitive helpers.
*
* A brand makes structurally identical strings or numbers non-interchangeable
* at the type level: a `SessionId` cannot be passed where a `ToolCallId` is
* expected, and an event sequence cannot be passed as a log offset. Comparison,
* logging, and serialization retain the underlying primitive behavior.
*
* This package owns no concrete domain value and keeps no runtime identity or mutable
* state, so independently installed copies produce interchangeable values.
*
* @module @deepseek-ai/dsh-brand
*/
/**
* Apply a compile-time string brand without changing the value.
* @param value - string admitted by the domain that owns the target brand.
* @returns the same string with the requested compile-time brand.
*/
function brandString(value) {
	return value;
}
//#endregion
//#region lib/types/usage.js
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
/** OpenCode Go's subscription usage endpoint. */
const USAGE_URL = "https://opencode.ai/zen/go/v1/usage";
/** Credential reference holding the `opencode-go` provider key. */
const API_KEY_REF = brandString("OPENCODE_GO_API_KEY");
/** Child environment variable carrying the key into curl. */
const KEY_ENV = "DSH_OPENCODE_GO_QUOTA_KEY";
/** Ceiling for the upstream call; the shell clamps it to its own maximum. */
const REQUEST_TIMEOUT_MS = 25e3;
/** Longest diagnostic slice handed to the browser. */
const DETAIL_LIMIT = 300;
/** One failure with no diagnostic detail behind it. */
function failure(code, detail = null) {
	return {
		ok: false,
		code,
		detail
	};
}
/** One thrown value's message, for a diagnostic. */
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
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
function readWindow(raw) {
	if (typeof raw !== "object" || raw === null) return null;
	const window = raw;
	if (typeof window.percent !== "number" || !Number.isFinite(window.percent)) return null;
	const used = Math.max(0, Math.min(100, Math.round(window.percent)));
	return {
		used,
		remaining: 100 - used,
		status: typeof window.status === "string" ? window.status : "ok",
		resetsAt: typeof window.resetsAt === "string" && window.resetsAt !== "" ? window.resetsAt : null
	};
}
/**
* Read the subscription usage once.
* @param ctx - host context carrying the credential and shell seams.
* @returns the snapshot, or the coded failure the chip renders.
*/
async function readQuota(ctx) {
	const credentials = ctx.get("credentials");
	if (credentials === void 0) return failure("credentials-unavailable");
	const shell = ctx.get("shell");
	if (shell === void 0) return failure("shell-unavailable");
	let key;
	try {
		key = (await credentials.resolve(API_KEY_REF))?.value;
	} catch (error) {
		return failure("key-unreadable", messageOf(error).slice(0, DETAIL_LIMIT));
	}
	if (key === void 0 || key === "") return failure("key-missing");
	let stdout;
	try {
		const spec = shell.resolve({
			command: `curl -sS -m 20 -H "Authorization: Bearer $${KEY_ENV}" ${USAGE_URL}`,
			env: { [KEY_ENV]: key },
			timeoutMs: REQUEST_TIMEOUT_MS
		});
		const run = await (await shell.execute(spec)).result();
		if (run.exitCode !== 0) {
			const detail = run.stderr.text.trim().slice(0, DETAIL_LIMIT);
			return failure("request-failed", detail === "" ? `exit ${String(run.exitCode)}` : detail);
		}
		stdout = run.stdout.text.trim();
	} catch (error) {
		return failure("request-failed", messageOf(error).slice(0, DETAIL_LIMIT));
	}
	let payload;
	try {
		payload = JSON.parse(stdout);
	} catch {
		return failure("malformed-response", stdout.slice(0, DETAIL_LIMIT));
	}
	const usage = typeof payload === "object" && payload !== null ? payload.usage : void 0;
	const source = typeof usage === "object" && usage !== null ? usage : {};
	const rolling = readWindow(source.rolling);
	const weekly = readWindow(source.weekly);
	const monthly = readWindow(source.monthly);
	if (rolling === null && weekly === null && monthly === null) return failure("empty-usage");
	return {
		ok: true,
		rolling,
		weekly,
		monthly,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
//#endregion
//#region lib/types/index.js
/**
* OpenCode Go quota plugin, node half: one read-only JSON route the browser
* half polls, over the host credential and shell seams and behind the
* Connection trust fence. The browser half ships via `exports["./client"]`,
* discovered through the package.json `dsh.client` declaration.
*
* @module dsh-ocg-used
*/
/** The route needs the web carrier to own a path; Connection gates it. */
const inject = ["webServer"];
/**
* Host plugin body: serve the latest usage snapshot.
* @param ctx - host context carrying the web carrier.
*/
function apply(ctx) {
	let cached;
	ctx.inject(["connection", "webServer"], (webCtx) => {
		webCtx.effect(() => webCtx.webServer.register({
			kind: "exact",
			path: QUOTA_PATH,
			handler: async (req, res) => {
				const rejection = webCtx.connection.requestRejection(req);
				if (rejection !== void 0) {
					res.writeHead(rejection);
					res.end(rejection === 401 ? "unauthorized" : "forbidden");
					return;
				}
				if (req.method !== "GET" && req.method !== "HEAD") {
					res.writeHead(405, { allow: "GET, HEAD" });
					res.end();
					return;
				}
				const now = Date.now();
				if (cached === void 0 || now - cached.at > 15e3) cached = {
					at: now,
					value: await readQuota(ctx)
				};
				const body = JSON.stringify(cached.value);
				res.writeHead(200, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-store",
					"content-length": String(Buffer.byteLength(body))
				});
				res.end(req.method === "HEAD" ? void 0 : body);
			}
		}), "ui-opencode-go-quota: usage route");
	});
}
//#endregion
export { apply, inject };
