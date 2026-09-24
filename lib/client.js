window.__ModuleLoader__.load({
	id: "dsh-ocg-used",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/protocol.ts
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
		//#region \0dsh-ocg-used-css:src/client/QuotaChip.module.css.mjs
		const css = ".K7IGMW_chip{border:1px solid var(--dsw-alias-border-l1);height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none;white-space:nowrap;background:0 0;border-radius:999px;align-items:center;gap:9px;padding:0 10px;font-size:11px;line-height:1;display:inline-flex;position:relative}.K7IGMW_chip:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}.K7IGMW_brand{color:var(--dsw-alias-label-primary);opacity:.85;font-weight:600}.K7IGMW_item{align-items:center;gap:4px;display:inline-flex}.K7IGMW_label{opacity:.7}.K7IGMW_track{background:var(--dsw-alias-border-l1);border-radius:999px;width:20px;height:4px;display:inline-block;position:relative;overflow:hidden}.K7IGMW_fill{border-radius:999px;transition:width .25s;position:absolute;top:0;bottom:0;left:0}.K7IGMW_value{text-align:right;font-variant-numeric:tabular-nums;min-width:27px}.K7IGMW_dot{border-radius:999px;width:6px;height:6px;display:inline-block}.K7IGMW_toneOk.K7IGMW_fill,.K7IGMW_toneOk.K7IGMW_rowFill{background:var(--dsw-alias-state-success-primary)}.K7IGMW_toneWarn.K7IGMW_fill,.K7IGMW_toneWarn.K7IGMW_rowFill{background:var(--dsw-alias-state-warn-primary)}.K7IGMW_toneAlert.K7IGMW_fill,.K7IGMW_toneAlert.K7IGMW_rowFill{background:var(--dsw-alias-state-error-primary)}.K7IGMW_toneOk.K7IGMW_value{color:var(--dsw-alias-state-success-primary)}.K7IGMW_toneWarn.K7IGMW_value{color:var(--dsw-alias-state-warn-primary)}.K7IGMW_toneAlert.K7IGMW_value{color:var(--dsw-alias-state-error-primary)}.K7IGMW_toneAlert.K7IGMW_dot{background:var(--dsw-alias-state-error-primary)}.K7IGMW_pop{z-index:60;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);width:276px;color:var(--dsw-alias-label-secondary);text-align:left;cursor:default;border-radius:10px;padding:11px 12px;font-size:11.5px;line-height:1.5;position:absolute;bottom:calc(100% + 10px);right:0;box-shadow:0 10px 30px #0000004d}.K7IGMW_popHead{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:8px;margin-bottom:8px;font-size:12px;font-weight:600;display:flex}.K7IGMW_row{margin-bottom:9px}.K7IGMW_rowTop{justify-content:space-between;gap:8px;margin-bottom:4px;display:flex}.K7IGMW_rowName{color:var(--dsw-alias-label-primary)}.K7IGMW_rowTrack{background:var(--dsw-alias-border-l1);border-radius:999px;height:5px;overflow:hidden}.K7IGMW_rowFill{border-radius:999px;height:100%}.K7IGMW_rowSub{opacity:.72;margin-top:3px}.K7IGMW_popFoot{border-top:1px solid var(--dsw-alias-border-l1);opacity:.72;margin-top:2px;padding-top:7px}.K7IGMW_err{color:var(--dsw-alias-state-error-primary)}";
		const tagId = "dsh-ocg-used/QuotaChip.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ocg-used";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var QuotaChip_module_css_default = {
			"brand": "K7IGMW_brand",
			"chip": "K7IGMW_chip",
			"dot": "K7IGMW_dot",
			"err": "K7IGMW_err",
			"fill": "K7IGMW_fill",
			"item": "K7IGMW_item",
			"label": "K7IGMW_label",
			"pop": "K7IGMW_pop",
			"popFoot": "K7IGMW_popFoot",
			"popHead": "K7IGMW_popHead",
			"row": "K7IGMW_row",
			"rowFill": "K7IGMW_rowFill",
			"rowName": "K7IGMW_rowName",
			"rowSub": "K7IGMW_rowSub",
			"rowTop": "K7IGMW_rowTop",
			"rowTrack": "K7IGMW_rowTrack",
			"toneAlert": "K7IGMW_toneAlert",
			"toneOk": "K7IGMW_toneOk",
			"toneWarn": "K7IGMW_toneWarn",
			"track": "K7IGMW_track",
			"value": "K7IGMW_value"
		};
		//#endregion
		//#region src/client/QuotaChip.tsx
		/** One upstream read per minute, unless the user asks for one. */
		const REFRESH_MS = 6e4;
		/** The three windows in display order, with their dictionary keys. */
		const WINDOWS = [
			{
				key: "rolling",
				name: "window.rolling",
				short: "window.rolling.short"
			},
			{
				key: "weekly",
				name: "window.weekly",
				short: "window.weekly.short"
			},
			{
				key: "monthly",
				name: "window.monthly",
				short: "window.monthly.short"
			}
		];
		/** Every failure code's dictionary key. */
		const ERROR_KEYS = {
			"credentials-unavailable": "error.credentials-unavailable",
			"shell-unavailable": "error.shell-unavailable",
			"key-unreadable": "error.key-unreadable",
			"key-missing": "error.key-missing",
			"request-failed": "error.request-failed",
			"malformed-response": "error.malformed-response",
			"empty-usage": "error.empty-usage"
		};
		/** Two-digit zero padding for a clock label. */
		function pad2(value) {
			return value < 10 ? `0${String(value)}` : String(value);
		}
		/**
		* Join class names, dropping the ones a CSS-module lookup did not resolve.
		* @param parts - class names, any of which may be absent.
		* @returns the space-joined names present.
		*/
		function cx(...parts) {
			return parts.filter((part) => part !== void 0).join(" ");
		}
		/**
		* Warn as a window drains: a third consumed is worth noticing, nine tenths is
		* worth acting on.
		* @param remaining - whole percent still available in the window.
		* @returns the tone class carrying that state's token color.
		*/
		function toneClass(remaining) {
			if (remaining > 30) return QuotaChip_module_css_default.toneOk;
			if (remaining > 10) return QuotaChip_module_css_default.toneWarn;
			return QuotaChip_module_css_default.toneAlert;
		}
		/**
		* Break one reset instant into local calendar fields.
		* @param iso - the provider's instant.
		* @returns the local month, day, and `HH:MM`, or null when unusable.
		*/
		function resetParts(iso) {
			if (iso === null) return null;
			const at = new Date(iso);
			if (Number.isNaN(at.getTime())) return null;
			return {
				month: at.getMonth() + 1,
				day: at.getDate(),
				time: `${pad2(at.getHours())}:${pad2(at.getMinutes())}`
			};
		}
		/**
		* Render the coarse time left before one reset.
		* @param iso - the provider's instant.
		* @param t - the namespace translate seat.
		* @returns a duration, the imminent-reset phrase, or null when unknown.
		*/
		function remainingText(iso, t) {
			if (iso === null) return null;
			const at = new Date(iso);
			if (Number.isNaN(at.getTime())) return null;
			const ms = at.getTime() - Date.now();
			if (ms <= 0) return t("reset.soon");
			const minutes = Math.floor(ms / 6e4);
			const days = Math.floor(minutes / 1440);
			const hours = Math.floor(minutes % 1440 / 60);
			const rest = minutes % 60;
			if (days > 0) return t("duration.days", {
				days,
				hours
			});
			if (hours > 0) return t("duration.hours", {
				hours,
				minutes: rest
			});
			return t("duration.minutes", { minutes: rest });
		}
		/**
		* Render one window's reset line.
		* @param window - the window whose instant is described.
		* @param t - the namespace translate seat.
		* @returns the reset instant followed by the countdown, or the unknown phrase.
		*/
		function resetLine(window, t) {
			const parts = resetParts(window.resetsAt);
			if (parts === null) return t("reset.unknown");
			const at = t("reset.at", parts);
			const remaining = remainingText(window.resetsAt, t);
			return remaining === null ? at : `${at}${t("sep.inline")}${t("reset.remaining", { duration: remaining })}`;
		}
		/**
		* Render one failure with its raw diagnostic detail, if any.
		* @param failure - the coded failure the host answered.
		* @param t - the namespace translate seat.
		* @returns the localized message, plus the untouched detail.
		*/
		function failureText(failure, t) {
			const message = t(ERROR_KEYS[failure.code]);
			return failure.detail === null ? message : `${message}${t("sep.label")}${failure.detail}`;
		}
		/**
		* Render the multi-line tooltip summary of one read.
		* @param result - the latest read.
		* @param t - the namespace translate seat.
		* @returns one header line plus one line per reported window.
		*/
		function summaryText(result, t) {
			if (result === null) return t("chip.loading");
			if (!result.ok) return `${t("pop.title")}\n${failureText(result, t)}`;
			const lines = [t("pop.title")];
			for (const entry of WINDOWS) {
				const window = result[entry.key];
				if (window === null) continue;
				lines.push([
					t(entry.name),
					t("value.remaining", { percent: window.remaining }),
					t("value.used", { percent: window.used }),
					resetLine(window, t)
				].join(t("sep.inline")));
			}
			return lines.join("\n");
		}
		/**
		* The composer-toolbar quota chip.
		* @param props - the slot's runtime share plus this namespace's translate seat.
		* @returns the chip, with its hover panel while the pointer is inside it.
		*/
		function QuotaChip({ t }) {
			const [result, setResult] = (0, react.useState)(null);
			const [tick, setTick] = (0, react.useState)(0);
			const [hovered, setHovered] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let alive = true;
				const load = async () => {
					try {
						const payload = await (await fetch(QUOTA_PATH, {
							headers: { accept: "application/json" },
							cache: "no-store"
						})).json();
						if (alive) setResult(payload);
					} catch {
						if (alive) setResult({
							ok: false,
							code: "request-failed",
							detail: null
						});
					}
				};
				load();
				return () => {
					alive = false;
				};
			}, [tick]);
			(0, react.useEffect)(() => {
				const handle = window.setInterval(() => {
					setTick((value) => value + 1);
				}, REFRESH_MS);
				return () => {
					window.clearInterval(handle);
				};
			}, []);
			const summary = summaryText(result, t);
			const children = [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: QuotaChip_module_css_default.brand,
				children: t("chip.brand")
			}, "brand")];
			if (result === null) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: QuotaChip_module_css_default.label,
				children: t("chip.loading")
			}, "loading"));
			else if (!result.ok) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: QuotaChip_module_css_default.item,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: cx(QuotaChip_module_css_default.dot, QuotaChip_module_css_default.toneAlert) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: QuotaChip_module_css_default.err,
					children: t("chip.unavailable")
				})]
			}, "failure"));
			else for (const entry of WINDOWS) {
				const window = result[entry.key];
				if (window === null) continue;
				const tone = toneClass(window.remaining);
				children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: QuotaChip_module_css_default.item,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: QuotaChip_module_css_default.label,
							children: t(entry.short)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: QuotaChip_module_css_default.track,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cx(QuotaChip_module_css_default.fill, tone),
								style: { width: `${String(window.remaining)}%` }
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: cx(QuotaChip_module_css_default.value, tone),
							children: t("value.percent", { percent: window.remaining })
						})
					]
				}, entry.key));
			}
			if (hovered) {
				if (result !== null && !result.ok) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: QuotaChip_module_css_default.pop,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: QuotaChip_module_css_default.popHead,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pop.title") })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: QuotaChip_module_css_default.err,
						children: failureText(result, t)
					})]
				}, "panel"));
				else if (result !== null) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: QuotaChip_module_css_default.pop,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: QuotaChip_module_css_default.popHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pop.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pop.updated", { time: new Date(result.fetchedAt).toTimeString().slice(0, 5) }) })]
						}),
						WINDOWS.map((entry) => {
							const window = result[entry.key];
							if (window === null) return null;
							const tone = toneClass(window.remaining);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: QuotaChip_module_css_default.row,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: QuotaChip_module_css_default.rowTop,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: QuotaChip_module_css_default.rowName,
											children: t(entry.name)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											t("value.remaining", { percent: window.remaining }),
											t("sep.inline"),
											t("value.used", { percent: window.used })
										] })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: QuotaChip_module_css_default.rowTrack,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: cx(QuotaChip_module_css_default.rowFill, tone),
											style: { width: `${String(window.remaining)}%` }
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: QuotaChip_module_css_default.rowSub,
										children: resetLine(window, t)
									})
								]
							}, entry.key);
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: QuotaChip_module_css_default.popFoot,
							children: t("pop.foot")
						})
					]
				}, "panel"));
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				"aria-label": t("pop.title"),
				className: QuotaChip_module_css_default.chip,
				onClick: () => {
					setTick((value) => value + 1);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") setTick((value) => value + 1);
				},
				onMouseEnter: () => {
					setHovered(true);
				},
				onMouseLeave: () => {
					setHovered(false);
				},
				role: "button",
				tabIndex: 0,
				title: summary,
				children
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* `opencodeGoQuota` namespace dictionaries. The Simplified Chinese entries are
		* the key-set source of truth; English mirrors them key for key.
		*
		* @module dsh-ocg-used/client/locales
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "opencodeGoQuota";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"chip.brand": "Go",
			"chip.loading": "余量读取中",
			"chip.unavailable": "余量不可用",
			"window.rolling.short": "5h",
			"window.rolling": "5 小时",
			"window.weekly.short": "周",
			"window.weekly": "一周",
			"window.monthly.short": "月",
			"window.monthly": "一个月",
			"value.percent": "{percent}%",
			"value.remaining": "剩余 {percent}%",
			"value.used": "已用 {percent}%",
			"sep.inline": " · ",
			"sep.label": "：",
			"pop.title": "OpenCode Go 套餐余量",
			"pop.updated": "{time} 更新",
			"pop.foot": "每 60 秒自动刷新 · 点击胶囊立即刷新",
			"reset.at": "{month}月{day}日 {time} 重置",
			"reset.remaining": "还剩 {duration}",
			"reset.soon": "即将重置",
			"reset.unknown": "重置时间未知",
			"duration.days": "{days} 天 {hours} 小时",
			"duration.hours": "{hours} 小时 {minutes} 分",
			"duration.minutes": "{minutes} 分钟",
			"error.credentials-unavailable": "凭据服务不可用",
			"error.shell-unavailable": "命令执行服务不可用",
			"error.key-unreadable": "读取 OpenCode Go API Key 失败",
			"error.key-missing": "未配置 OPENCODE_GO_API_KEY",
			"error.request-failed": "请求 OpenCode Go 用量接口失败",
			"error.malformed-response": "用量接口返回内容无法解析",
			"error.empty-usage": "用量接口返回中没有套餐数据"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"chip.brand": "Go",
			"chip.loading": "reading quota",
			"chip.unavailable": "quota unavailable",
			"window.rolling.short": "5h",
			"window.rolling": "5 hours",
			"window.weekly.short": "wk",
			"window.weekly": "one week",
			"window.monthly.short": "mo",
			"window.monthly": "one month",
			"value.percent": "{percent}%",
			"value.remaining": "{percent}% left",
			"value.used": "{percent}% used",
			"sep.inline": " · ",
			"sep.label": ": ",
			"pop.title": "OpenCode Go plan quota",
			"pop.updated": "updated {time}",
			"pop.foot": "refreshes every 60s · click the chip to refresh now",
			"reset.at": "resets {month}/{day} {time}",
			"reset.remaining": "{duration} left",
			"reset.soon": "resetting shortly",
			"reset.unknown": "reset time unknown",
			"duration.days": "{days}d {hours}h",
			"duration.hours": "{hours}h {minutes}m",
			"duration.minutes": "{minutes}m",
			"error.credentials-unavailable": "credential service unavailable",
			"error.shell-unavailable": "command service unavailable",
			"error.key-unreadable": "reading the OpenCode Go API key failed",
			"error.key-missing": "OPENCODE_GO_API_KEY is not configured",
			"error.request-failed": "the OpenCode Go usage request failed",
			"error.malformed-response": "the usage response could not be parsed",
			"error.empty-usage": "the usage response carried no plan data"
		};
		//#endregion
		//#region src/client/index.ts
		/** Required services for dictionary registration and the composer contribution. */
		const inject = ["locale", "slots"];
		/**
		* Client plugin body: register the dictionaries and the toolbar control.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-opencode-go-quota: dictionaries");
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "opencode-go-quota",
				order: 20,
				locale: NS
			}, QuotaChip));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
