/**
 * `opencodeGoQuota` namespace dictionaries. The Simplified Chinese entries are
 * the key-set source of truth; English mirrors them key for key.
 *
 * @module dsh-ocg-used/client/locales
 */

/** Dictionary namespace owned by this plugin. */
export const NS = 'opencodeGoQuota'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'chip.brand': 'Go',
  'chip.loading': '余量读取中',
  'chip.unavailable': '余量不可用',
  'window.rolling.short': '5h',
  'window.rolling': '5 小时',
  'window.weekly.short': '周',
  'window.weekly': '一周',
  'window.monthly.short': '月',
  'window.monthly': '一个月',
  'value.percent': '{percent}%',
  'value.remaining': '剩余 {percent}%',
  'value.used': '已用 {percent}%',
  'sep.inline': ' · ',
  'sep.label': '：',
  'pop.title': 'OpenCode Go 套餐余量',
  'pop.updated': '{time} 更新',
  'pop.foot': '每 60 秒自动刷新 · 点击胶囊立即刷新',
  'reset.at': '{month}月{day}日 {time} 重置',
  'reset.remaining': '还剩 {duration}',
  'reset.soon': '即将重置',
  'reset.unknown': '重置时间未知',
  'duration.days': '{days} 天 {hours} 小时',
  'duration.hours': '{hours} 小时 {minutes} 分',
  'duration.minutes': '{minutes} 分钟',
  'error.credentials-unavailable': '凭据服务不可用',
  'error.shell-unavailable': '命令执行服务不可用',
  'error.key-unreadable': '读取 OpenCode Go API Key 失败',
  'error.key-missing': '未配置 OPENCODE_GO_API_KEY',
  'error.request-failed': '请求 OpenCode Go 用量接口失败',
  'error.malformed-response': '用量接口返回内容无法解析',
  'error.empty-usage': '用量接口返回中没有套餐数据',
} as const

/** One dictionary key of this namespace. */
export type QuotaKey = keyof typeof zh

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<QuotaKey, string> = {
  'chip.brand': 'Go',
  'chip.loading': 'reading quota',
  'chip.unavailable': 'quota unavailable',
  'window.rolling.short': '5h',
  'window.rolling': '5 hours',
  'window.weekly.short': 'wk',
  'window.weekly': 'one week',
  'window.monthly.short': 'mo',
  'window.monthly': 'one month',
  'value.percent': '{percent}%',
  'value.remaining': '{percent}% left',
  'value.used': '{percent}% used',
  'sep.inline': ' · ',
  'sep.label': ': ',
  'pop.title': 'OpenCode Go plan quota',
  'pop.updated': 'updated {time}',
  'pop.foot': 'refreshes every 60s · click the chip to refresh now',
  'reset.at': 'resets {month}/{day} {time}',
  'reset.remaining': '{duration} left',
  'reset.soon': 'resetting shortly',
  'reset.unknown': 'reset time unknown',
  'duration.days': '{days}d {hours}h',
  'duration.hours': '{hours}h {minutes}m',
  'duration.minutes': '{minutes}m',
  'error.credentials-unavailable': 'credential service unavailable',
  'error.shell-unavailable': 'command service unavailable',
  'error.key-unreadable': 'reading the OpenCode Go API key failed',
  'error.key-missing': 'OPENCODE_GO_API_KEY is not configured',
  'error.request-failed': 'the OpenCode Go usage request failed',
  'error.malformed-response': 'the usage response could not be parsed',
  'error.empty-usage': 'the usage response carried no plan data',
}
