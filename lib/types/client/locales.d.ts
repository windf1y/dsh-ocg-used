/**
 * `opencodeGoQuota` namespace dictionaries. The Simplified Chinese entries are
 * the key-set source of truth; English mirrors them key for key.
 *
 * @module dsh-ocg-used/client/locales
 */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "opencodeGoQuota";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly 'chip.brand': "Go";
    readonly 'chip.loading': "余量读取中";
    readonly 'chip.unavailable': "余量不可用";
    readonly 'window.rolling.short': "5h";
    readonly 'window.rolling': "5 小时";
    readonly 'window.weekly.short': "周";
    readonly 'window.weekly': "一周";
    readonly 'window.monthly.short': "月";
    readonly 'window.monthly': "一个月";
    readonly 'value.percent': "{percent}%";
    readonly 'value.remaining': "剩余 {percent}%";
    readonly 'value.used': "已用 {percent}%";
    readonly 'sep.inline': " · ";
    readonly 'sep.label': "：";
    readonly 'pop.title': "OpenCode Go 套餐余量";
    readonly 'pop.updated': "{time} 更新";
    readonly 'pop.foot': "每 60 秒自动刷新 · 点击胶囊立即刷新";
    readonly 'reset.at': "{month}月{day}日 {time} 重置";
    readonly 'reset.remaining': "还剩 {duration}";
    readonly 'reset.soon': "即将重置";
    readonly 'reset.unknown': "重置时间未知";
    readonly 'duration.days': "{days} 天 {hours} 小时";
    readonly 'duration.hours': "{hours} 小时 {minutes} 分";
    readonly 'duration.minutes': "{minutes} 分钟";
    readonly 'error.credentials-unavailable': "凭据服务不可用";
    readonly 'error.shell-unavailable': "命令执行服务不可用";
    readonly 'error.key-unreadable': "读取 OpenCode Go API Key 失败";
    readonly 'error.key-missing': "未配置 OPENCODE_GO_API_KEY";
    readonly 'error.request-failed': "请求 OpenCode Go 用量接口失败";
    readonly 'error.malformed-response': "用量接口返回内容无法解析";
    readonly 'error.empty-usage': "用量接口返回中没有套餐数据";
};
/** One dictionary key of this namespace. */
export type QuotaKey = keyof typeof zh;
/** English dictionary, key-identical to the Chinese source of truth. */
export declare const en: Record<QuotaKey, string>;
