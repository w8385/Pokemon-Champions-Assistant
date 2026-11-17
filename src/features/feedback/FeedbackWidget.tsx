import React from 'react'
import { createPortal } from 'react-dom'
import { APP_BUILD_INFO } from '../../app/buildInfo'
import { createFeedbackContext, feedbackScreenLabel, type FeedbackContextV1, type FeedbackPointer, type FeedbackViewInput } from '../../app/feedbackContext'
import type { SiteLanguage } from '../../app/types'
import { UiIcon } from '../../shared/display/UiIcon'
import { captureFeedbackScreenshot, type FeedbackScreenshot } from './feedbackScreenshot'
import {
  createFeedbackRequest,
  createSubmissionId,
  feedbackClipboardText,
  feedbackMessageLength,
  MAX_FEEDBACK_MESSAGE,
  postFeedback,
  type FeedbackCategory,
  type FeedbackRequestV1,
  type FeedbackSubmitResult,
} from './feedbackTransport'

type FeedbackCopy = {
  launcher: string
  title: string
  intro: string
  close: string
  currentScreen: string
  categories: Record<FeedbackCategory, string>
  categoryLegend: string
  messageLabel: string
  placeholder: string
  diagnosticsTitle: string
  privacy: string
  diagnosticsDetails: string
  screen: string
  route: string
  language: string
  viewport: string
  version: string
  includeDiagnostics: string
  screenshotTitle: string
  screenshotPrivacy: string
  screenshotCapturing: string
  screenshotReady: string
  screenshotFailed: string
  screenshotRemoved: string
  screenshotSkip: string
  screenshotRemove: string
  screenshotRecapture: string
  screenshotPreviewAlt: string
  send: string
  sending: string
  required: string
  tooLong: string
  sentTitle: string
  sentBody: string
  done: string
  retry: string
  copy: string
  copied: string
  errors: Record<Exclude<FeedbackSubmitResult, { ok: true }>['code'], string>
}

const COPY = {
  ko: {
    launcher: '의견 보내기', title: '의견 보내기', intro: '불편했던 점이나 아이디어를 짧게 남겨 주세요.', close: '닫기', currentScreen: '현재 화면',
    categories: { bug: '버그', feature: '기능 제안', data: '데이터 오류', ui: 'UI·UX', other: '기타' }, categoryLegend: '의견 종류',
    messageLabel: '의견', placeholder: '어떤 점이 불편했나요? 기대한 동작도 함께 적어 주면 더 빨리 확인할 수 있어요.',
    diagnosticsTitle: '화면 정보 자동 첨부', privacy: '화면 이름·언어·화면 크기·입력 방식·앱 버전을 텍스트로 보냅니다. 입력 데이터와 원본 URL은 이 정보에 포함하지 않습니다.',
    diagnosticsDetails: '첨부 정보 보기', screen: '화면', route: '화면 경로', language: '언어', viewport: '화면 크기', version: '앱 버전', includeDiagnostics: '화면 정보 함께 보내기',
    screenshotTitle: '현재 화면 캡처 첨부', screenshotPrivacy: '제출창을 제외한 현재 탭 화면을 Discord로 보냅니다. 화면에 보이는 파티·상대·입력 내용이 포함될 수 있어요.',
    screenshotCapturing: '화면을 캡처하는 중…', screenshotReady: '전송할 화면 미리보기', screenshotFailed: '화면을 캡처하지 못했습니다. 의견은 이미지 없이 보낼 수 있어요.', screenshotRemoved: '화면 캡처를 첨부하지 않습니다.',
    screenshotSkip: '첨부 안 함', screenshotRemove: '첨부 제거', screenshotRecapture: '다시 캡처', screenshotPreviewAlt: '전송할 현재 화면 미리보기',
    send: '보내기', sending: '보내는 중…',
    required: '의견을 한 글자 이상 입력해 주세요.', tooLong: `의견은 ${MAX_FEEDBACK_MESSAGE.toLocaleString('ko-KR')}자까지 입력할 수 있어요.`,
    sentTitle: '의견을 보냈어요', sentBody: '의견을 안전하게 접수했습니다.',
    done: '확인', retry: '다시 시도', copy: '내용 복사', copied: '복사했어요',
    errors: { invalid: '입력 내용을 확인해 주세요.', 'too-large': '의견이 너무 깁니다. 내용을 줄여 주세요.', offline: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.', 'rate-limited': '요청이 많습니다. 잠시 후 다시 시도해 주세요.', timeout: '응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.', unavailable: '지금은 접수하지 못했습니다. 다시 시도하거나 내용을 복사해 보관해 주세요.' },
  },
  en: {
    launcher: 'Send feedback', title: 'Send feedback', intro: 'Share a problem or idea without leaving your work.', close: 'Close', currentScreen: 'Current screen',
    categories: { bug: 'Bug', feature: 'Feature', data: 'Data issue', ui: 'UI/UX', other: 'Other' }, categoryLegend: 'Feedback type',
    messageLabel: 'Feedback', placeholder: 'What felt wrong? Including what you expected helps us verify it faster.',
    diagnosticsTitle: 'Attach screen details', privacy: 'Sends the screen name, language, viewport, input mode, and app version as text. Input data and the original URL are not included in these details.',
    diagnosticsDetails: 'View attached details', screen: 'Screen', route: 'Screen route', language: 'Language', viewport: 'Viewport', version: 'App version', includeDiagnostics: 'Include screen details',
    screenshotTitle: 'Attach current screen capture', screenshotPrivacy: 'Sends the current tab view to Discord without this feedback panel. Visible party, opponent, and input data may be included.',
    screenshotCapturing: 'Capturing the screen…', screenshotReady: 'Screen preview to send', screenshotFailed: 'The screen could not be captured. You can still send feedback without an image.', screenshotRemoved: 'The screen capture will not be attached.',
    screenshotSkip: 'Send without capture', screenshotRemove: 'Remove capture', screenshotRecapture: 'Capture again', screenshotPreviewAlt: 'Preview of the current screen to send',
    send: 'Send', sending: 'Sending…',
    required: 'Enter at least one character.', tooLong: `Feedback can be up to ${MAX_FEEDBACK_MESSAGE.toLocaleString('en-US')} characters.`,
    sentTitle: 'Feedback sent', sentBody: 'Your feedback was received safely.',
    done: 'Done', retry: 'Try again', copy: 'Copy content', copied: 'Copied',
    errors: { invalid: 'Check the feedback and try again.', 'too-large': 'The feedback is too long. Shorten it and try again.', offline: 'Check your connection and try again.', 'rate-limited': 'Too many requests. Please try again shortly.', timeout: 'The response took too long. Please try again.', unavailable: 'Feedback could not be sent now. Try again or copy the content for safekeeping.' },
  },
  ja: {
    launcher: '意見を送る', title: '意見を送る', intro: '不具合やアイデアを作業中のまま送れます。', close: '閉じる', currentScreen: '現在の画面',
    categories: { bug: '不具合', feature: '機能提案', data: 'データ不備', ui: 'UI・UX', other: 'その他' }, categoryLegend: '意見の種類',
    messageLabel: '意見', placeholder: '不便だった点と期待した動作を書いていただくと、より早く確認できます。',
    diagnosticsTitle: '画面情報を自動添付', privacy: '画面名・言語・表示サイズ・入力方式・アプリ版をテキストで送ります。入力データと元のURLはこの情報に含まれません。',
    diagnosticsDetails: '添付情報を見る', screen: '画面', route: '画面経路', language: '言語', viewport: '表示サイズ', version: 'アプリ版', includeDiagnostics: '画面情報を含める',
    screenshotTitle: '現在の画面キャプチャを添付', screenshotPrivacy: 'この送信画面を除いた現在のタブ表示をDiscordへ送ります。表示中のパーティ、相手、入力内容が含まれる場合があります。',
    screenshotCapturing: '画面をキャプチャしています…', screenshotReady: '送信する画面のプレビュー', screenshotFailed: '画面をキャプチャできませんでした。画像なしでも意見を送信できます。', screenshotRemoved: '画面キャプチャは添付されません。',
    screenshotSkip: 'キャプチャを添付しない', screenshotRemove: '添付を削除', screenshotRecapture: 'もう一度キャプチャ', screenshotPreviewAlt: '送信する現在画面のプレビュー',
    send: '送る', sending: '送信中…',
    required: '1文字以上入力してください。', tooLong: `意見は${MAX_FEEDBACK_MESSAGE.toLocaleString('ja-JP')}文字までです。`,
    sentTitle: '送信しました', sentBody: 'ご意見を安全に受け付けました。',
    done: '確認', retry: 'もう一度', copy: '内容をコピー', copied: 'コピーしました',
    errors: { invalid: '入力内容を確認してください。', 'too-large': '内容が長すぎます。短くして再度お試しください。', offline: '接続を確認して再度お試しください。', 'rate-limited': 'リクエストが多すぎます。しばらくしてからお試しください。', timeout: '応答に時間がかかっています。再度お試しください。', unavailable: '現在送信できません。再試行するか、内容をコピーして保管してください。' },
  },
} satisfies Record<SiteLanguage, FeedbackCopy>

type FeedbackStatus = 'idle' | 'submitting' | 'sent' | 'error'
type FeedbackScreenshotStatus = 'idle' | 'capturing' | 'ready' | 'failed' | 'removed'

function pointerType(): FeedbackPointer {
  try {
    if (window.matchMedia('(pointer: coarse)').matches) return 'coarse'
    if (window.matchMedia('(pointer: fine)').matches) return 'fine'
  } catch { /* Older test browsers may not expose matchMedia. */ }
  return 'unknown'
}

export function FeedbackWidget({ language, view, onBeforeOpen, endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT?.trim() || `${import.meta.env.BASE_URL}api/feedback` }: {
  language: SiteLanguage
  view: FeedbackViewInput
  onBeforeOpen?: () => void
  endpoint?: string
}) {
  const copy = COPY[language]
  const launcherRef = React.useRef<HTMLButtonElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const completeActionRef = React.useRef<HTMLButtonElement>(null)
  const submittingRef = React.useRef(false)
  const screenshotRunRef = React.useRef(0)
  const screenshotAbortRef = React.useRef<AbortController | null>(null)
  const screenshotUrlRef = React.useRef('')
  const [open, setOpen] = React.useState(false)
  const [category, setCategory] = React.useState<FeedbackCategory>('feature')
  const [message, setMessage] = React.useState('')
  const [website, setWebsite] = React.useState('')
  const [includeDiagnostics, setIncludeDiagnostics] = React.useState(true)
  const [draftContext, setDraftContext] = React.useState<FeedbackContextV1 | null>(null)
  const [submissionId, setSubmissionId] = React.useState(createSubmissionId)
  const [status, setStatus] = React.useState<FeedbackStatus>('idle')
  const statusRef = React.useRef<FeedbackStatus>('idle')
  statusRef.current = status
  const [errorCode, setErrorCode] = React.useState<Exclude<FeedbackSubmitResult, { ok: true }>['code'] | null>(null)
  const [validationError, setValidationError] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const [screenshot, setScreenshot] = React.useState<FeedbackScreenshot | null>(null)
  const [screenshotUrl, setScreenshotUrl] = React.useState('')
  const [screenshotStatus, setScreenshotStatus] = React.useState<FeedbackScreenshotStatus>('idle')
  const screenshotStatusRef = React.useRef<FeedbackScreenshotStatus>('idle')
  screenshotStatusRef.current = screenshotStatus

  const captureContext = React.useCallback(() => createFeedbackContext({
    view,
    locale: language,
    viewport: { width: window.innerWidth, height: window.innerHeight, pointer: pointerType() },
    app: APP_BUILD_INFO,
  }), [language, view])

  const clearScreenshot = React.useCallback(() => {
    if (screenshotUrlRef.current) window.URL.revokeObjectURL(screenshotUrlRef.current)
    screenshotUrlRef.current = ''
    setScreenshot(null)
    setScreenshotUrl('')
  }, [])

  const captureScreenshot = React.useCallback(async () => {
    const run = ++screenshotRunRef.current
    screenshotAbortRef.current?.abort()
    const controller = new AbortController()
    screenshotAbortRef.current = controller
    clearScreenshot()
    setScreenshotStatus('capturing')
    try {
      await new Promise<void>(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())))
      const next = await captureFeedbackScreenshot(controller.signal)
      if (run !== screenshotRunRef.current) return
      const nextUrl = window.URL.createObjectURL(next.blob)
      screenshotUrlRef.current = nextUrl
      setScreenshot(next)
      setScreenshotUrl(nextUrl)
      setScreenshotStatus('ready')
    } catch (error) {
      if (controller.signal.aborted || run !== screenshotRunRef.current) return
      console.warn('[feedback] screenshot capture failed', error)
      setScreenshotStatus('failed')
    } finally {
      if (screenshotAbortRef.current === controller) screenshotAbortRef.current = null
    }
  }, [clearScreenshot])

  const openWidget = () => {
    onBeforeOpen?.()
    if (!message.trim() || !draftContext) {
      setDraftContext(captureContext())
      if (screenshotStatusRef.current !== 'removed') {
        screenshotRunRef.current += 1
        screenshotAbortRef.current?.abort()
        screenshotAbortRef.current = null
        clearScreenshot()
        setScreenshotStatus('idle')
      }
    }
    setValidationError('')
    setCopied(false)
    if (status !== 'error') setStatus('idle')
    setOpen(true)
  }

  const closeWidget = React.useCallback(() => {
    if (statusRef.current === 'submitting') return
    if (screenshotStatusRef.current === 'capturing') {
      screenshotRunRef.current += 1
      screenshotAbortRef.current?.abort()
      screenshotAbortRef.current = null
      clearScreenshot()
      setScreenshotStatus('idle')
    }
    setOpen(false)
    setCopied(false)
    if (statusRef.current === 'sent') {
      setStatus('idle')
      setDraftContext(null)
    }
  }, [clearScreenshot])

  React.useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => textareaRef.current?.focus())
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), summary, a[href], [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeWidget(); return }
      if (event.key !== 'Tab') return
      const available = focusable()
      if (!available.length) { event.preventDefault(); dialog?.focus(); return }
      const first = available[0], last = available[available.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      launcherRef.current?.focus()
    }
  }, [closeWidget, open])

  React.useEffect(() => {
    if (!open || status !== 'sent') return
    const frame = window.requestAnimationFrame(() => completeActionRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open, status])

  React.useEffect(() => {
    if (open && status !== 'sent' && screenshotStatus === 'idle') void captureScreenshot()
  }, [captureScreenshot, open, screenshotStatus, status])

  React.useEffect(() => () => {
    screenshotRunRef.current += 1
    screenshotAbortRef.current?.abort()
    screenshotAbortRef.current = null
    if (screenshotUrlRef.current) window.URL.revokeObjectURL(screenshotUrlRef.current)
  }, [])

  const markEdited = () => {
    setSubmissionId(createSubmissionId())
    setErrorCode(null)
    setValidationError('')
    setCopied(false)
    if (status !== 'submitting') setStatus('idle')
  }

  const request = (): FeedbackRequestV1 => createFeedbackRequest({
    submissionId,
    category,
    message,
    context: includeDiagnostics ? draftContext : null,
    website,
  })

  const validate = () => {
    const length = feedbackMessageLength(message.trim())
    if (!length) { setValidationError(copy.required); textareaRef.current?.focus(); return false }
    if (length > MAX_FEEDBACK_MESSAGE) { setValidationError(copy.tooLong); textareaRef.current?.focus(); return false }
    return true
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submittingRef.current || status === 'submitting' || screenshotStatus === 'capturing' || !validate()) return
    const submittedRequest = request()
    submittingRef.current = true
    setStatus('submitting')
    setErrorCode(null)
    const result = await postFeedback(submittedRequest, { endpoint, screenshot: screenshot?.blob })
    submittingRef.current = false
    if (result.ok) {
      setMessage('')
      setCategory('feature')
      setIncludeDiagnostics(true)
      setSubmissionId(createSubmissionId())
      screenshotRunRef.current += 1
      screenshotAbortRef.current?.abort()
      screenshotAbortRef.current = null
      clearScreenshot()
      setScreenshotStatus('idle')
      setStatus('sent')
      return
    }
    setErrorCode(result.code)
    setStatus('error')
  }

  const removeScreenshot = () => {
    screenshotRunRef.current += 1
    screenshotAbortRef.current?.abort()
    screenshotAbortRef.current = null
    clearScreenshot()
    setScreenshotStatus('removed')
    markEdited()
  }

  const recaptureScreenshot = () => {
    markEdited()
    void captureScreenshot()
  }

  const copyRequest = async () => {
    if (!validate()) return
    try {
      await navigator.clipboard.writeText(feedbackClipboardText(request(), language))
      setCopied(true)
    } catch { setCopied(false) }
  }

  const screen = draftContext?.screen
  const screenLabel = screen ? feedbackScreenLabel(screen, language) : ''
  const dialog = open && typeof document !== 'undefined' ? createPortal(
    <div className="feedback-backdrop" data-feedback-capture-exclude="" onMouseDown={event => { if (event.target === event.currentTarget) closeWidget() }}>
      <div ref={dialogRef} className="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-description" aria-busy={status === 'submitting'} tabIndex={-1}>
        <div className="feedback-panel-header">
          <div className="feedback-panel-title">
            <span className="feedback-panel-mark"><UiIcon name="message" size={19} /></span>
            <div><h2 id="feedback-title">{copy.title}</h2><p id="feedback-description">{copy.intro}</p></div>
          </div>
          <button type="button" className="feedback-close" aria-label={copy.close} title={copy.close} disabled={status === 'submitting'} onClick={closeWidget}><UiIcon name="close" size={18} /></button>
        </div>

        {status === 'sent' ? <div className="feedback-complete" role="status" aria-live="polite">
          <span className="feedback-complete-mark"><UiIcon name="check" size={26} /></span>
          <h3>{copy.sentTitle}</h3>
          <p>{copy.sentBody}</p>
          <div className="feedback-complete-actions">
            <button ref={completeActionRef} type="button" className="action-button primary" onClick={closeWidget}>{copy.done}</button>
          </div>
        </div> : <form className="feedback-form" onSubmit={submit}>
          <div className="feedback-screen-chip"><UiIcon name="info" size={16} /><span>{copy.currentScreen}</span><strong>{screenLabel}</strong></div>

          <fieldset className="feedback-category-fieldset" disabled={status === 'submitting'}>
            <legend>{copy.categoryLegend}</legend>
            <div className="feedback-category-grid">{(Object.keys(copy.categories) as FeedbackCategory[]).map(value => <label key={value} className={category === value ? 'active' : ''}>
              <input type="radio" name="feedback-category" value={value} checked={category === value} onChange={() => { setCategory(value); markEdited() }} />
              <span>{copy.categories[value]}</span>
            </label>)}</div>
          </fieldset>

          <label className="feedback-message-field" htmlFor="feedback-message">
            <span><strong>{copy.messageLabel}</strong><small>{feedbackMessageLength(message)}/{MAX_FEEDBACK_MESSAGE.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US')}</small></span>
            <textarea ref={textareaRef} id="feedback-message" value={message} disabled={status === 'submitting'} rows={5} placeholder={copy.placeholder} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'feedback-validation-error' : undefined} onChange={event => { setMessage(Array.from(event.target.value).slice(0, MAX_FEEDBACK_MESSAGE).join('')); markEdited() }} />
          </label>
          {validationError ? <p id="feedback-validation-error" className="feedback-error" role="alert">{validationError}</p> : null}

          <section className={`feedback-screenshot feedback-screenshot-${screenshotStatus}`} aria-labelledby="feedback-screenshot-title">
            <div className="feedback-screenshot-copy">
              <strong id="feedback-screenshot-title">{copy.screenshotTitle}</strong>
              <small>{copy.screenshotPrivacy}</small>
            </div>
            <div className="feedback-screenshot-state">
              {screenshotStatus === 'ready' && screenshot && screenshotUrl ? <div className="feedback-screenshot-preview">
                <img src={screenshotUrl} alt={copy.screenshotPreviewAlt} />
                <div><strong>{copy.screenshotReady}</strong><small>{screenshot.width} × {screenshot.height} · {Math.max(1, Math.round(screenshot.blob.size / 1024)).toLocaleString()} KB</small></div>
              </div> : null}
              {screenshotStatus !== 'idle' ? <div className="feedback-screenshot-controls">
                <span className={`feedback-screenshot-status${screenshotStatus === 'ready' ? ' visually-hidden' : ''}`} role="status" aria-live="polite"><UiIcon name={screenshotStatus === 'failed' ? 'warning' : 'info'} size={16} />{screenshotStatus === 'capturing' ? copy.screenshotCapturing : screenshotStatus === 'ready' ? copy.screenshotReady : screenshotStatus === 'failed' ? copy.screenshotFailed : copy.screenshotRemoved}</span>
                <button type="button" className="action-button subtle" disabled={status === 'submitting'} onClick={screenshotStatus === 'capturing' || screenshotStatus === 'ready' ? removeScreenshot : recaptureScreenshot}>{screenshotStatus === 'capturing' ? copy.screenshotSkip : screenshotStatus === 'ready' ? copy.screenshotRemove : copy.screenshotRecapture}</button>
              </div> : null}
            </div>
          </section>

          <label className="feedback-diagnostics-toggle">
            <input type="checkbox" checked={includeDiagnostics} disabled={status === 'submitting'} onChange={event => { setIncludeDiagnostics(event.target.checked); markEdited() }} />
            <span><strong>{copy.diagnosticsTitle}</strong><small>{copy.privacy}</small></span>
          </label>
          {includeDiagnostics && draftContext ? <details className="feedback-diagnostics">
            <summary>{copy.diagnosticsDetails}</summary>
            <dl><div><dt>{copy.screen}</dt><dd>{draftContext.screen.id}</dd></div><div><dt>{copy.route}</dt><dd>{draftContext.screen.canonicalRoute}</dd></div><div><dt>{copy.language}</dt><dd>{draftContext.locale}</dd></div><div><dt>{copy.viewport}</dt><dd>{draftContext.viewport.width} × {draftContext.viewport.height} · {draftContext.viewport.pointer}</dd></div><div><dt>{copy.version}</dt><dd>{draftContext.app.version} · {draftContext.app.revision}</dd></div></dl>
          </details> : null}

          <label className="feedback-honeypot" aria-hidden="true">Website<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>
          {errorCode ? <div className="feedback-submit-error" role="alert"><UiIcon name="warning" size={17} /><span>{copy.errors[errorCode]}</span></div> : null}

          <div className={`feedback-actions${errorCode ? ' has-error' : ''}`}>
            <button type="submit" className="action-button primary feedback-submit" disabled={status === 'submitting' || screenshotStatus === 'capturing'}>{status === 'submitting' ? copy.sending : screenshotStatus === 'capturing' ? copy.screenshotCapturing : errorCode ? copy.retry : copy.send}</button>
            {errorCode ? <button type="button" className="action-button feedback-copy-action" onClick={copyRequest}><UiIcon name="copy" size={16} />{copied ? copy.copied : copy.copy}</button> : null}
          </div>
        </form>}
      </div>
    </div>, document.body) : null

  return <div className="feedback-widget" data-feedback-capture-exclude="">
    <button ref={launcherRef} type="button" className="feedback-launcher" aria-label={copy.launcher} title={copy.launcher} aria-haspopup="dialog" aria-expanded={open} aria-hidden={open || undefined} tabIndex={open ? -1 : 0} onClick={openWidget}>
      <UiIcon name="message" size={22} /><span>{copy.launcher}</span>
    </button>
    {dialog}
  </div>
}
