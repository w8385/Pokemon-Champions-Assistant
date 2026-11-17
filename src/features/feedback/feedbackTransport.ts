import type { FeedbackContextV1 } from '../../app/feedbackContext'
import type { SiteLanguage } from '../../app/types'
import { MAX_FEEDBACK_SCREENSHOT_BYTES } from './feedbackScreenshot'

export const MAX_FEEDBACK_MESSAGE = 1_500
export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'data', 'ui', 'other'] as const
export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]

export type FeedbackRequestV1 = {
  schemaVersion: 1
  submissionId: string
  category: FeedbackCategory
  message: string
  context: FeedbackContextV1 | null
  website: string
}

export type FeedbackSubmitResult =
  | { ok: true; receiptId?: string }
  | { ok: false; code: 'invalid' | 'too-large' | 'offline' | 'rate-limited' | 'timeout' | 'unavailable'; retryable: boolean; retryAfterMs?: number }

export function feedbackMessageLength(value: string) {
  return Array.from(value).length
}

export function createSubmissionId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `feedback-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function createFeedbackRequest(input: {
  submissionId: string
  category: FeedbackCategory
  message: string
  context: FeedbackContextV1 | null
  website?: string
}): FeedbackRequestV1 {
  return {
    schemaVersion: 1,
    submissionId: input.submissionId,
    category: input.category,
    message: input.message.trim(),
    context: input.context,
    website: input.website?.trim() ?? '',
  }
}

function retryAfterMs(value: string | null) {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1_000)
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined
}

export async function postFeedback(request: FeedbackRequestV1, options: {
  endpoint: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
  signal?: AbortSignal
  screenshot?: Blob | null
}): Promise<FeedbackSubmitResult> {
  if (!request.message || feedbackMessageLength(request.message) > MAX_FEEDBACK_MESSAGE || !FEEDBACK_CATEGORIES.includes(request.category)) {
    return { ok: false, code: feedbackMessageLength(request.message) > MAX_FEEDBACK_MESSAGE ? 'too-large' : 'invalid', retryable: false }
  }
  const endpoint = options.endpoint.trim()
  if (!endpoint) return { ok: false, code: 'unavailable', retryable: true }
  const screenshot = options.screenshot ?? null
  if (screenshot && screenshot.type !== 'image/png') return { ok: false, code: 'invalid', retryable: false }
  if (screenshot && (!screenshot.size || screenshot.size > MAX_FEEDBACK_SCREENSHOT_BYTES)) {
    return { ok: false, code: 'too-large', retryable: false }
  }
  const fetchImpl = options.fetchImpl ?? fetch
  const controller = new AbortController()
  let timedOut = false
  const timeout = globalThis.setTimeout(() => { timedOut = true; controller.abort() }, options.timeoutMs ?? 10_000)
  const abortFromParent = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) abortFromParent()
  else options.signal?.addEventListener('abort', abortFromParent, { once: true })
  try {
    const payload = {
      schemaVersion: 1,
      submissionId: request.submissionId,
      category: request.category,
      message: request.message,
      context: request.context,
      website: request.website,
    }
    let body: BodyInit = JSON.stringify(payload)
    if (screenshot) {
      const form = new FormData()
      form.set('payload_json', JSON.stringify(payload))
      form.set('screenshot', screenshot, 'feedback-screenshot.png')
      body = form
    }
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: screenshot ? { accept: 'application/json' } : { 'content-type': 'application/json', accept: 'application/json' },
      body,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
    if (response.status === 202) {
      try {
        const body = await response.json() as { ok?: unknown; receiptId?: unknown }
        if (body?.ok !== true) return { ok: false, code: 'unavailable', retryable: true }
        const receiptId = typeof body.receiptId === 'string' ? body.receiptId.slice(0, 100) : undefined
        return { ok: true, ...(receiptId ? { receiptId } : {}) }
      } catch {
        return { ok: false, code: 'unavailable', retryable: true }
      }
    }
    if (response.status === 400 || response.status === 422) return { ok: false, code: 'invalid', retryable: false }
    if (response.status === 413) return { ok: false, code: 'too-large', retryable: false }
    if (response.status === 429) return { ok: false, code: 'rate-limited', retryable: true, retryAfterMs: retryAfterMs(response.headers.get('retry-after')) }
    if (response.status === 408 || response.status === 504) return { ok: false, code: 'timeout', retryable: true }
    return { ok: false, code: 'unavailable', retryable: true }
  } catch {
    if (timedOut) return { ok: false, code: 'timeout', retryable: true }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, code: 'offline', retryable: true }
    return { ok: false, code: 'unavailable', retryable: true }
  } finally {
    globalThis.clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromParent)
  }
}

const clipboardCopy = {
  ko: {
    headings: { message: '의견', category: '분류', diagnostics: '자동 첨부 정보', submission: '제출 ID' },
    fields: { screen: '화면', route: '정규화 경로', locale: '언어', viewport: '뷰포트', app: '앱' },
    categories: { bug: '버그', feature: '기능 제안', data: '데이터 오류', ui: 'UI·UX', other: '기타' },
    omitted: '사용자가 화면 정보 첨부를 해제했습니다.', privacy: '파티·상대 정보, 메모, 검색어, 원본 URL은 첨부하지 않았습니다.',
  },
  en: {
    headings: { message: 'Feedback', category: 'Category', diagnostics: 'Attached diagnostics', submission: 'Submission ID' },
    fields: { screen: 'Screen', route: 'Canonical route', locale: 'Language', viewport: 'Viewport', app: 'App' },
    categories: { bug: 'Bug', feature: 'Feature idea', data: 'Data issue', ui: 'UI/UX', other: 'Other' },
    omitted: 'Screen details were not included.', privacy: 'Party and opponent data, notes, searches, and the original URL were not included.',
  },
  ja: {
    headings: { message: '意見', category: '種類', diagnostics: '添付情報', submission: '送信ID' },
    fields: { screen: '画面', route: '正規化経路', locale: '言語', viewport: '表示サイズ', app: 'アプリ' },
    categories: { bug: '不具合', feature: '機能提案', data: 'データ不備', ui: 'UI・UX', other: 'その他' },
    omitted: '画面情報は添付されていません。', privacy: 'パーティ、相手、メモ、検索語、元のURLは添付されていません。',
  },
} satisfies Record<SiteLanguage, {
  headings: Record<'message' | 'category' | 'diagnostics' | 'submission', string>
  fields: Record<'screen' | 'route' | 'locale' | 'viewport' | 'app', string>
  categories: Record<FeedbackCategory, string>
  omitted: string
  privacy: string
}>

export function feedbackClipboardText(request: FeedbackRequestV1, language: SiteLanguage = 'ko') {
  const copy = clipboardCopy[language]
  const context = request.context
  const diagnostics = context ? [
    `- ${copy.fields.screen}: \`${context.screen.id}\``,
    `- ${copy.fields.route}: \`${context.screen.canonicalRoute}\``,
    `- ${copy.fields.locale}: \`${context.locale}\``,
    `- ${copy.fields.viewport}: \`${context.viewport.width} × ${context.viewport.height}\` / \`${context.viewport.pointer}\``,
    `- ${copy.fields.app}: \`${context.app.version}\` / \`${context.app.revision}\``,
  ].join('\n') : `- ${copy.omitted}`
  return `${copy.headings.message}\n${request.message}\n\n${copy.headings.category}\n${copy.categories[request.category]}\n\n${copy.headings.diagnostics}\n${diagnostics}\n\n${copy.headings.submission}\n${request.submissionId}\n\n${copy.privacy}`
}
