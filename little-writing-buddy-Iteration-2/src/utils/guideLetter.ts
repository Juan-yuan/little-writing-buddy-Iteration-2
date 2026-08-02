import type { LetterCase } from '../types/practice'
import { getDisplayLetter, normalizeLetter } from '../data/letters'

export interface GuideLayout {
  left: number
  right: number
  topLine: number
  midLine: number
  baseline: number
  descenderLine: number
}

const DESCENDER_LETTERS = new Set(['g', 'j', 'p', 'q', 'y'])

export function hasDescender(letter: string): boolean {
  return DESCENDER_LETTERS.has(letter.toLowerCase())
}

export function getGuideLayout(width: number, height: number): GuideLayout {
  return {
    left: width * 0.08,
    right: width * 0.92,
    topLine: height * 0.2,
    midLine: height * 0.48,
    baseline: height * 0.72,
    descenderLine: height * 0.88,
  }
}

interface GuideLetterMetrics {
  x: number
  baselineY: number
  fontSize: number
  font: string
}

export function getGuideLetterMetrics(
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
): GuideLetterMetrics {
  const layout = getGuideLayout(width, height)
  const x = width / 2

  if (letterCase === 'uppercase') {
    const capHeight = layout.baseline - layout.topLine
    const fontSize = capHeight * 0.88
    return {
      x,
      baselineY: layout.baseline,
      fontSize,
      font: `700 ${fontSize}px Fredoka, Nunito, sans-serif`,
    }
  }

  const base = normalizeLetter(letter)
  const display = base.toLowerCase()
  let fontSize: number

  if (hasDescender(display)) {
    const fullHeight = layout.descenderLine - layout.topLine
    fontSize = fullHeight / 0.78
  } else {
    const xHeight = layout.baseline - layout.midLine
    fontSize = xHeight / 0.52
  }
  return {
    x,
    baselineY: layout.baseline,
    fontSize,
    font: `${fontSize}px "Patrick Hand", "Segoe Print", cursive`,
  }
}

function applyLetterStyle(ctx: CanvasRenderingContext2D, metrics: GuideLetterMetrics) {
  ctx.font = metrics.font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
}

/** Solid letter for accuracy masks — must match visible guide geometry. */
export function drawGuideLetterSolid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
  fillStyle: string,
) {
  const display = getDisplayLetter(normalizeLetter(letter), letterCase)
  const metrics = getGuideLetterMetrics(width, height, display, letterCase)
  applyLetterStyle(ctx, metrics)
  ctx.fillStyle = fillStyle
  ctx.fillText(display, metrics.x, metrics.baselineY)
}

function drawGuideLine(
  ctx: CanvasRenderingContext2D,
  layout: GuideLayout,
  y: number,
  style: { color: string; width: number; dash: number[] },
) {
  ctx.beginPath()
  ctx.moveTo(layout.left, y)
  ctx.lineTo(layout.right, y)
  ctx.strokeStyle = style.color
  ctx.lineWidth = style.width
  ctx.setLineDash(style.dash)
  ctx.stroke()
  ctx.setLineDash([])
}

/** Top, mid, baseline, and optional descender guidelines. */
export function drawHandwritingGuidelines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letterCase: LetterCase,
  letter: string,
) {
  const layout = getGuideLayout(width, height)
  const showDescender =
    letterCase === 'lowercase' && hasDescender(letter)

  drawGuideLine(ctx, layout, layout.topLine, {
    color: 'rgba(110, 181, 232, 0.5)',
    width: 2,
    dash: [],
  })

  drawGuideLine(ctx, layout, layout.midLine, {
    color:
      letterCase === 'lowercase'
        ? 'rgba(126, 207, 142, 0.45)'
        : 'rgba(126, 207, 142, 0.2)',
    width: letterCase === 'lowercase' ? 2 : 1.5,
    dash: [10, 8],
  })

  drawGuideLine(ctx, layout, layout.baseline, {
    color: 'rgba(240, 101, 74, 0.5)',
    width: 2.5,
    dash: [],
  })

  if (letterCase === 'lowercase') {
    drawGuideLine(ctx, layout, layout.descenderLine, {
      color: showDescender
        ? 'rgba(110, 181, 232, 0.38)'
        : 'rgba(110, 181, 232, 0.18)',
      width: showDescender ? 2 : 1.5,
      dash: [8, 10],
    })
  }

  drawGuideLabels(ctx, layout, letterCase, showDescender)
}

function drawGuideLabels(
  ctx: CanvasRenderingContext2D,
  layout: GuideLayout,
  letterCase: LetterCase,
  showDescender: boolean,
) {
  const labelX = layout.left - 6
  ctx.fillStyle = 'rgba(107, 132, 148, 0.55)'
  ctx.font = '600 9px Nunito, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  ctx.fillText('top', labelX, layout.topLine)
  if (letterCase === 'lowercase') {
    ctx.fillText('mid', labelX, layout.midLine)
  }
  ctx.fillText('base', labelX, layout.baseline)
  if (letterCase === 'lowercase' && showDescender) {
    ctx.fillText('tail', labelX, layout.descenderLine)
  }
}

/** Pale fill + dotted stroke so students know where to trace. */
export function drawDottedGuideLetter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
) {
  const display = getDisplayLetter(normalizeLetter(letter), letterCase)
  const metrics = getGuideLetterMetrics(width, height, display, letterCase)
  applyLetterStyle(ctx, metrics)

  ctx.fillStyle =
    letterCase === 'uppercase'
      ? 'rgba(30, 74, 95, 0.07)'
      : 'rgba(30, 74, 95, 0.06)'
  ctx.fillText(display, metrics.x, metrics.baselineY)

  const dotLength = Math.max(3, metrics.fontSize * 0.045)
  const gapLength = Math.max(4, metrics.fontSize * 0.07)

  ctx.strokeStyle =
    letterCase === 'uppercase'
      ? 'rgba(30, 74, 95, 0.26)'
      : 'rgba(30, 74, 95, 0.24)'
  ctx.lineWidth = Math.max(2.5, metrics.fontSize * 0.038)
  ctx.setLineDash([dotLength, gapLength])
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeText(display, metrics.x, metrics.baselineY)
  ctx.setLineDash([])
}

/** Full practice background: guidelines + dotted guide letter. */
export function drawPracticeGuide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
) {
  drawHandwritingGuidelines(ctx, width, height, letterCase, letter)
  drawDottedGuideLetter(ctx, width, height, letter, letterCase)
}
