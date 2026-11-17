export const MAX_FEEDBACK_SCREENSHOT_BYTES = 1_800_000

const MAX_CAPTURE_EDGE = 1_440
const MAX_CAPTURE_PIXELS = 1_600_000
const MIN_CAPTURE_EDGE = 240

export type FeedbackScreenshot = {
  blob: Blob
  width: number
  height: number
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('screenshot-encoding-failed'))
    }, 'image/png')
  })
}

function resizedCanvas(source: HTMLCanvasElement, scale: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(source.width * scale))
  canvas.height = Math.max(1, Math.floor(source.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('screenshot-canvas-unavailable')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

async function boundedPng(source: HTMLCanvasElement): Promise<FeedbackScreenshot> {
  let canvas = source
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const blob = await canvasBlob(canvas)
    if (blob.size <= MAX_FEEDBACK_SCREENSHOT_BYTES) {
      return { blob, width: canvas.width, height: canvas.height }
    }
    const sizeRatio = Math.sqrt(MAX_FEEDBACK_SCREENSHOT_BYTES / blob.size) * 0.9
    const minimumRatio = Math.max(MIN_CAPTURE_EDGE / canvas.width, MIN_CAPTURE_EDGE / canvas.height)
    const nextScale = Math.min(0.82, Math.max(sizeRatio, minimumRatio))
    if (nextScale >= 1 || (canvas.width <= MIN_CAPTURE_EDGE && canvas.height <= MIN_CAPTURE_EDGE)) break
    canvas = resizedCanvas(canvas, nextScale)
  }
  throw new Error('screenshot-too-large')
}

export async function captureFeedbackScreenshot(signal?: AbortSignal): Promise<FeedbackScreenshot> {
  const width = Math.max(1, Math.floor(window.innerWidth))
  const height = Math.max(1, Math.floor(window.innerHeight))
  const edgeScale = MAX_CAPTURE_EDGE / Math.max(width, height)
  const areaScale = Math.sqrt(MAX_CAPTURE_PIXELS / (width * height))
  const scale = Math.min(1, edgeScale, areaScale)
  const { default: html2canvas } = await import('html2canvas-pro')
  const rootBackground = window.getComputedStyle(document.documentElement).backgroundColor
  const canvas = await html2canvas(document.documentElement, {
    allowTaint: false,
    backgroundColor: rootBackground && rootBackground !== 'rgba(0, 0, 0, 0)' ? rootBackground : '#111827',
    height,
    ignoreElements: element => element.hasAttribute('data-feedback-capture-exclude'),
    imageTimeout: 5_000,
    logging: false,
    removeContainer: true,
    scale,
    signal,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    useCORS: true,
    width,
    windowHeight: height,
    windowWidth: width,
    x: window.scrollX,
    y: window.scrollY,
  })
  return boundedPng(canvas)
}
