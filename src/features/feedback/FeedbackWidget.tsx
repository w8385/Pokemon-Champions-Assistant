import React from 'react'
import { createPortal } from 'react-dom'
import { APP_BUILD_INFO } from '../../app/buildInfo'
import { createFeedbackContext, feedbackScreenLabel, type FeedbackContextV1, type FeedbackPointer, type FeedbackViewInput } from '../../app/feedbackContext'
import type { SiteLanguage } from '../../app/types'
import { UiIcon } from '../../shared/display/UiIcon'
import {
  buildFeedbackIssueUrl,
  createFeedbackRequest,
  createSubmissionId,
  feedbackIssueBody,
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
  send: string
  sendGithub: string
  sending: string
  fallbackNote: string
  openForm: string
  required: string
  tooLong: string
  sentTitle: string
  sentBody: string
  handoffTitle: string
  handoffBody: string
  done: string
  writeAnother: string
  retry: string
  copy: string
  copied: string
  openGithub: string
  reopenGithub: string
  errors: Record<Exclude<FeedbackSubmitResult, { ok: true }>['code'], string>
}

const COPY = {
  ko: {
    launcher: '의견 보내기', title: '의견 보내기', intro: '불편했던 점이나 아이디어를 짧게 남겨 주세요.', close: '닫기', currentScreen: '현재 화면',
    categories: { bug: '버그', feature: '기능 제안', data: '데이터 오류', ui: 'UI·UX', other: '기타' }, categoryLegend: '의견 종류',
    messageLabel: '의견', placeholder: '어떤 점이 불편했나요? 기대한 동작도 함께 적어 주면 더 빨리 확인할 수 있어요.',
    diagnosticsTitle: '화면 정보 자동 첨부', privacy: '현재 화면·언어·화면 크기·입력 방식·앱 버전만 보냅니다. 파티·상대 정보, 메모, 검색어, 원본 URL은 보내지 않습니다.',
    diagnosticsDetails: '첨부 정보 보기', screen: '화면', route: '화면 경로', language: '언어', viewport: '화면 크기', version: '앱 버전', includeDiagnostics: '화면 정보 함께 보내기',
    send: '보내기', sendGithub: 'GitHub에서 계속', sending: '보내는 중…', fallbackNote: '현재 배포에서는 내용이 채워진 공개 GitHub 이슈 작성창으로 이어집니다.', openForm: '로그인 없이 기존 제보 폼 열기',
    required: '의견을 한 글자 이상 입력해 주세요.', tooLong: `의견은 ${MAX_FEEDBACK_MESSAGE.toLocaleString('ko-KR')}자까지 입력할 수 있어요.`,
    sentTitle: '의견을 보냈어요', sentBody: '의견을 안전하게 접수했습니다.', handoffTitle: '공개 GitHub 작성창을 열었어요', handoffBody: '공개될 내용을 확인한 뒤 Submit new issue를 눌러 접수를 완료해 주세요.',
    done: '확인', writeAnother: '다른 의견 작성', retry: '다시 시도', copy: '내용 복사', copied: '복사했어요', openGithub: 'GitHub으로 보내기', reopenGithub: 'GitHub 다시 열기',
    errors: { invalid: '입력 내용을 확인해 주세요.', 'too-large': '의견이 너무 깁니다. 내용을 줄여 주세요.', offline: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.', 'rate-limited': '요청이 많습니다. 잠시 후 다시 시도해 주세요.', timeout: '응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.', unavailable: '지금은 바로 보내지 못했습니다. 다시 시도하거나 GitHub으로 보내 주세요.' },
  },
  en: {
    launcher: 'Send feedback', title: 'Send feedback', intro: 'Share a problem or idea without leaving your work.', close: 'Close', currentScreen: 'Current screen',
    categories: { bug: 'Bug', feature: 'Feature', data: 'Data issue', ui: 'UI/UX', other: 'Other' }, categoryLegend: 'Feedback type',
    messageLabel: 'Feedback', placeholder: 'What felt wrong? Including what you expected helps us verify it faster.',
    diagnosticsTitle: 'Attach screen details', privacy: 'Sends only the screen, language, viewport, input mode, and app version. Party data, notes, searches, and the original URL are never included.',
    diagnosticsDetails: 'View attached details', screen: 'Screen', route: 'Screen route', language: 'Language', viewport: 'Viewport', version: 'App version', includeDiagnostics: 'Include screen details',
    send: 'Send', sendGithub: 'Continue on GitHub', sending: 'Sending…', fallbackNote: 'This deployment opens a prefilled public GitHub issue to finish sending.', openForm: 'Open the form without signing in',
    required: 'Enter at least one character.', tooLong: `Feedback can be up to ${MAX_FEEDBACK_MESSAGE.toLocaleString('en-US')} characters.`,
    sentTitle: 'Feedback sent', sentBody: 'Your feedback was received safely.', handoffTitle: 'The public GitHub issue is open', handoffBody: 'Review what will be public, then press Submit new issue to finish.',
    done: 'Done', writeAnother: 'Write another', retry: 'Try again', copy: 'Copy content', copied: 'Copied', openGithub: 'Send with GitHub', reopenGithub: 'Open GitHub again',
    errors: { invalid: 'Check the feedback and try again.', 'too-large': 'The feedback is too long. Shorten it and try again.', offline: 'Check your connection and try again.', 'rate-limited': 'Too many requests. Please try again shortly.', timeout: 'The response took too long. Please try again.', unavailable: 'Feedback could not be sent now. Try again or continue on GitHub.' },
  },
  ja: {
    launcher: '意見を送る', title: '意見を送る', intro: '不具合やアイデアを作業中のまま送れます。', close: '閉じる', currentScreen: '現在の画面',
    categories: { bug: '不具合', feature: '機能提案', data: 'データ不備', ui: 'UI・UX', other: 'その他' }, categoryLegend: '意見の種類',
    messageLabel: '意見', placeholder: '不便だった点と期待した動作を書いていただくと、より早く確認できます。',
    diagnosticsTitle: '画面情報を自動添付', privacy: '画面・言語・表示サイズ・入力方式・アプリ版だけを送ります。パーティ、メモ、検索語、元のURLは送りません。',
    diagnosticsDetails: '添付情報を見る', screen: '画面', route: '画面経路', language: '言語', viewport: '表示サイズ', version: 'アプリ版', includeDiagnostics: '画面情報を含める',
    send: '送る', sendGithub: 'GitHubで続ける', sending: '送信中…', fallbackNote: '現在の配信では、内容を入力済みの公開GitHub Issueで送信を完了します。', openForm: 'ログインせず既存フォームを開く',
    required: '1文字以上入力してください。', tooLong: `意見は${MAX_FEEDBACK_MESSAGE.toLocaleString('ja-JP')}文字までです。`,
    sentTitle: '送信しました', sentBody: 'ご意見を安全に受け付けました。', handoffTitle: '公開GitHub Issueを開きました', handoffBody: '公開内容を確認し、Submit new issueを押して完了してください。',
    done: '確認', writeAnother: '別の意見を書く', retry: 'もう一度', copy: '内容をコピー', copied: 'コピーしました', openGithub: 'GitHubで送る', reopenGithub: 'GitHubをもう一度開く',
    errors: { invalid: '入力内容を確認してください。', 'too-large': '内容が長すぎます。短くして再度お試しください。', offline: '接続を確認して再度お試しください。', 'rate-limited': 'リクエストが多すぎます。しばらくしてからお試しください。', timeout: '応答に時間がかかっています。再度お試しください。', unavailable: '現在送信できません。再試行するかGitHubから送ってください。' },
  },
} satisfies Record<SiteLanguage, FeedbackCopy>

type FeedbackStatus = 'idle' | 'submitting' | 'sent' | 'handoff' | 'error'

function pointerType(): FeedbackPointer {
  try {
    if (window.matchMedia('(pointer: coarse)').matches) return 'coarse'
    if (window.matchMedia('(pointer: fine)').matches) return 'fine'
  } catch { /* Older test browsers may not expose matchMedia. */ }
  return 'unknown'
}

function openExternal(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.append(link)
  link.click()
  link.remove()
}

export function FeedbackWidget({ language, view, onBeforeOpen, endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT?.trim() ?? '' }: {
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
  const [handoffUrl, setHandoffUrl] = React.useState('')

  const captureContext = React.useCallback(() => createFeedbackContext({
    view,
    locale: language,
    viewport: { width: window.innerWidth, height: window.innerHeight, pointer: pointerType() },
    app: APP_BUILD_INFO,
  }), [language, view])

  const openWidget = () => {
    onBeforeOpen?.()
    if (!message.trim() || !draftContext) setDraftContext(captureContext())
    setValidationError('')
    setCopied(false)
    if (status !== 'error') setStatus('idle')
    setOpen(true)
  }

  const closeWidget = React.useCallback(() => {
    if (statusRef.current === 'submitting') return
    setOpen(false)
    setCopied(false)
    if (statusRef.current === 'sent') {
      setStatus('idle')
      setDraftContext(null)
    }
  }, [])

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
    if (!open || (status !== 'sent' && status !== 'handoff')) return
    const frame = window.requestAnimationFrame(() => completeActionRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open, status])

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

  const handoffToGithub = () => {
    if (!validate()) return
    const url = buildFeedbackIssueUrl(request())
    setHandoffUrl(url)
    openExternal(url)
    setStatus('handoff')
    setErrorCode(null)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submittingRef.current || status === 'submitting' || !validate()) return
    if (!endpoint) { handoffToGithub(); return }
    if (website) { setStatus('sent'); return }
    const submittedRequest = request()
    submittingRef.current = true
    setStatus('submitting')
    setErrorCode(null)
    const result = await postFeedback(submittedRequest, { endpoint })
    submittingRef.current = false
    if (result.ok) {
      setMessage('')
      setCategory('feature')
      setIncludeDiagnostics(true)
      setSubmissionId(createSubmissionId())
      setStatus('sent')
      return
    }
    setErrorCode(result.code)
    setStatus('error')
  }

  const copyRequest = async () => {
    if (!validate()) return
    try {
      await navigator.clipboard.writeText(feedbackIssueBody(request()))
      setCopied(true)
    } catch { setCopied(false) }
  }

  const resetDraft = () => {
    setMessage('')
    setCategory('feature')
    setIncludeDiagnostics(true)
    setSubmissionId(createSubmissionId())
    setDraftContext(captureContext())
    setStatus('idle')
    setErrorCode(null)
    setValidationError('')
    setHandoffUrl('')
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const screen = draftContext?.screen
  const screenLabel = screen ? feedbackScreenLabel(screen, language) : ''
  const dialog = open && typeof document !== 'undefined' ? createPortal(
    <div className="feedback-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeWidget() }}>
      <div ref={dialogRef} className="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-description" aria-busy={status === 'submitting'} tabIndex={-1}>
        <div className="feedback-panel-header">
          <div className="feedback-panel-title">
            <span className="feedback-panel-mark"><UiIcon name="message" size={19} /></span>
            <div><h2 id="feedback-title">{copy.title}</h2><p id="feedback-description">{copy.intro}</p></div>
          </div>
          <button type="button" className="feedback-close" aria-label={copy.close} title={copy.close} disabled={status === 'submitting'} onClick={closeWidget}><UiIcon name="close" size={18} /></button>
        </div>

        {status === 'sent' || status === 'handoff' ? <div className="feedback-complete" role="status" aria-live="polite">
          <span className="feedback-complete-mark"><UiIcon name={status === 'sent' ? 'check' : 'upload'} size={26} /></span>
          <h3>{status === 'sent' ? copy.sentTitle : copy.handoffTitle}</h3>
          <p>{status === 'sent' ? copy.sentBody : copy.handoffBody}</p>
          <div className="feedback-complete-actions">
            {status === 'handoff' ? <button type="button" className="action-button" onClick={copyRequest}><UiIcon name="copy" size={16} />{copied ? copy.copied : copy.copy}</button> : null}
            {status === 'handoff' && handoffUrl ? <a className="action-button" href={handoffUrl} target="_blank" rel="noopener noreferrer"><UiIcon name="upload" size={16} />{copy.reopenGithub}</a> : null}
            <button ref={completeActionRef} type="button" className="action-button primary" onClick={status === 'sent' ? closeWidget : resetDraft}>{status === 'sent' ? copy.done : copy.writeAnother}</button>
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

          <div className="feedback-actions">
            <button type="submit" className="action-button primary feedback-submit" disabled={status === 'submitting'}>{status === 'submitting' ? copy.sending : endpoint ? errorCode ? copy.retry : copy.send : copy.sendGithub}</button>
            {errorCode ? <button type="button" className="action-button" onClick={handoffToGithub}><UiIcon name="upload" size={16} />{copy.openGithub}</button> : null}
            {errorCode ? <button type="button" className="action-button feedback-copy-action" onClick={copyRequest}><UiIcon name="copy" size={16} />{copied ? copy.copied : copy.copy}</button> : null}
          </div>
          {!endpoint ? <p className="feedback-fallback-note">{copy.fallbackNote}<br /><a href="https://forms.gle/Yrav9HB7Fzdffh3Q8" target="_blank" rel="noopener noreferrer">{copy.openForm}</a></p> : null}
        </form>}
      </div>
    </div>, document.body) : null

  return <div className="feedback-widget">
    <button ref={launcherRef} type="button" className="feedback-launcher" aria-label={copy.launcher} title={copy.launcher} aria-haspopup="dialog" aria-expanded={open} aria-hidden={open || undefined} tabIndex={open ? -1 : 0} onClick={openWidget}>
      <UiIcon name="message" size={22} /><span>{copy.launcher}</span>
    </button>
    {dialog}
  </div>
}
