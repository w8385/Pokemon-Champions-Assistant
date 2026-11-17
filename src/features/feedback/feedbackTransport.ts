import type { FeedbackContextV1 } from '../../app/feedbackContext'

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
}): Promise<FeedbackSubmitResult> {
  if (!request.message || feedbackMessageLength(request.message) > MAX_FEEDBACK_MESSAGE || !FEEDBACK_CATEGORIES.includes(request.category)) {
    return { ok: false, code: feedbackMessageLength(request.message) > MAX_FEEDBACK_MESSAGE ? 'too-large' : 'invalid', retryable: false }
  }
  const endpoint = options.endpoint.trim()
  if (!endpoint) return { ok: false, code: 'unavailable', retryable: true }
  const fetchImpl = options.fetchImpl ?? fetch
  const controller = new AbortController()
  let timedOut = false
  const timeout = globalThis.setTimeout(() => { timedOut = true; controller.abort() }, options.timeoutMs ?? 10_000)
  const abortFromParent = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) abortFromParent()
  else options.signal?.addEventListener('abort', abortFromParent, { once: true })
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        submissionId: request.submissionId,
        category: request.category,
        message: request.message,
        context: request.context,
        website: request.website,
      }),
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
    if (response.ok) {
      let receiptId: string | undefined
      try {
        const body = await response.json() as { receiptId?: unknown }
        if (typeof body.receiptId === 'string') receiptId = body.receiptId.slice(0, 100)
      } catch { /* A 204 or non-JSON success is still a success. */ }
      return { ok: true, ...(receiptId ? { receiptId } : {}) }
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

const issueCategory = {
  bug: '버그', feature: '기능 제안', data: '데이터 오류', ui: 'UI·UX', other: '기타',
} satisfies Record<FeedbackCategory, string>

export function feedbackIssueBody(request: FeedbackRequestV1) {
  const context = request.context
  const diagnostics = context ? [
    `- 화면: \`${context.screen.id}\``,
    `- 정규화 경로: \`${context.screen.canonicalRoute}\``,
    `- 언어: \`${context.locale}\``,
    `- 뷰포트: \`${context.viewport.width} × ${context.viewport.height}\` / \`${context.viewport.pointer}\``,
    `- 앱: \`${context.app.version}\` / \`${context.app.revision}\``,
  ].join('\n') : '- 사용자가 화면 정보 첨부를 해제했습니다.'
  return `## 의견\n\n${request.message}\n\n## 분류\n\n${issueCategory[request.category]}\n\n## 자동 첨부 정보\n\n${diagnostics}\n\n> 파티·상대 정보, 메모, 검색어, 원본 URL은 첨부하지 않았습니다.\n\n<!-- feedback-id: ${request.submissionId} -->`
}

export function buildFeedbackIssueUrl(request: FeedbackRequestV1) {
  const url = new URL('https://github.com/w8385/Pokemon-Champions-Assistant/issues/new')
  const summary = Array.from(request.message.replace(/\s+/g, ' ')).slice(0, 56).join('')
  url.searchParams.set('title', `[${issueCategory[request.category]}] ${summary}`)
  url.searchParams.set('body', feedbackIssueBody(request))
  return url.toString()
}
