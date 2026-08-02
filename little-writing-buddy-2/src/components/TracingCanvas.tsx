import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { practice as copy } from '../content/siteCopy'
import type { LetterCase } from '../types/practice'
import { getDisplayLetter } from '../data/letters'
import { drawPracticeGuide } from '../utils/guideLetter'
import {
  evaluateTracingAccuracy,
  type Point,
  type TracingResult,
} from '../utils/tracingAccuracy'

export interface TracingCanvasHandle {
  review: () => TracingResult
}

interface TracingCanvasProps {
  selectedLetter: string
  letterCase: LetterCase
  resetToken: number
  onTracingStart?: () => void
}

const STROKE_COLOR = '#f0654a'
const CANVAS_BG = '#f5fbff'

function scaleStrokes(strokes: Point[][], scaleX: number, scaleY: number): Point[][] {
  if (scaleX === 1 && scaleY === 1) return strokes
  return strokes.map((stroke) =>
    stroke.map((point) => ({
      x: point.x * scaleX,
      y: point.y * scaleY,
    })),
  )
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect()
  const { width, height } = canvas
  const dpr = window.devicePixelRatio || 1
  const cssWidth = Math.max(rect.width, 1)
  const cssHeight = Math.max(rect.height, 1)

  // Map pointer into the current logical drawing space (CSS pixels).
  return {
    x: ((event.clientX - rect.left) / cssWidth) * (width / dpr),
    y: ((event.clientY - rect.top) / cssHeight) * (height / dpr),
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[], lineWidth: number) {
  if (points.length === 0) return

  ctx.strokeStyle = STROKE_COLOR
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (points.length === 1) {
    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, lineWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = STROKE_COLOR
    ctx.fill()
    return
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = CANVAS_BG
  ctx.fillRect(0, 0, width, height)
  drawPracticeGuide(ctx, width, height, letter, letterCase)
}

export const TracingCanvas = forwardRef<TracingCanvasHandle, TracingCanvasProps>(
  function TracingCanvas({ selectedLetter, letterCase, resetToken, onTracingStart }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const strokesRef = useRef<Point[][]>([])
    const currentStrokeRef = useRef<Point[]>([])
    const isDrawingRef = useRef(false)
    const hasStartedRef = useRef(false)
    const logicalSizeRef = useRef({ width: 1, height: 1 })
    const dprRef = useRef(1)
    const displayLetter = getDisplayLetter(selectedLetter, letterCase)

    const getLineWidth = useCallback((width: number) => {
      return Math.min(18, Math.max(10, width * 0.028))
    }, [])

    const syncCanvasSize = useCallback(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return logicalSizeRef.current

      // Always measure the board container — never lock canvas to fixed style pixels.
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const width = Math.max(Math.round(rect.width), 1)
      const height = Math.max(Math.round(rect.height), 1)
      const nextSize = { width, height }
      const prevSize = logicalSizeRef.current
      const sizeChanged = prevSize.width !== width || prevSize.height !== height
      const dprChanged = dprRef.current !== dpr

      if (sizeChanged && prevSize.width > 1 && prevSize.height > 1) {
        const scaleX = width / prevSize.width
        const scaleY = height / prevSize.height
        strokesRef.current = scaleStrokes(strokesRef.current, scaleX, scaleY)
        currentStrokeRef.current = scaleStrokes([currentStrokeRef.current], scaleX, scaleY)[0] ?? []
      }

      logicalSizeRef.current = nextSize
      dprRef.current = dpr

      if (sizeChanged || dprChanged) {
        canvas.width = Math.max(Math.round(width * dpr), 1)
        canvas.height = Math.max(Math.round(height * dpr), 1)
        // Keep CSS fluid so DevTools device switches and real phones reflow correctly.
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
      }

      return nextSize
    }, [])

    const redraw = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height } = logicalSizeRef.current
      const lineWidth = getLineWidth(width)
      const dpr = dprRef.current

      // Re-apply transform in case the context was reset elsewhere.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      drawBackground(ctx, width, height, selectedLetter, letterCase)

      for (const stroke of strokesRef.current) {
        drawStroke(ctx, stroke, lineWidth)
      }

      drawStroke(ctx, currentStrokeRef.current, lineWidth)
    }, [selectedLetter, letterCase, getLineWidth])

    const resizeCanvas = useCallback(() => {
      syncCanvasSize()
      redraw()
    }, [syncCanvasSize, redraw])

    const clearCanvas = useCallback(() => {
      strokesRef.current = []
      currentStrokeRef.current = []
      isDrawingRef.current = false
      hasStartedRef.current = false
      redraw()
    }, [redraw])

    const finalizePendingStroke = useCallback(() => {
      if (currentStrokeRef.current.length === 0) return

      strokesRef.current.push([...currentStrokeRef.current])
      currentStrokeRef.current = []
      isDrawingRef.current = false
    }, [])

    const runReview = useCallback((): TracingResult => {
      finalizePendingStroke()

      let { width, height } = logicalSizeRef.current
      if (width <= 1 || height <= 1) {
        ;({ width, height } = syncCanvasSize())
      }

      return evaluateTracingAccuracy({
        strokes: strokesRef.current.map((stroke) => [...stroke]),
        width,
        height,
        letter: selectedLetter,
        letterCase,
      })
    }, [finalizePendingStroke, letterCase, selectedLetter, syncCanvasSize])

    useImperativeHandle(ref, () => ({ review: runReview }), [runReview])

    useEffect(() => {
      clearCanvas()
    }, [resetToken, selectedLetter, letterCase, clearCanvas])

    useEffect(() => {
      let frame = 0

      const scheduleResize = () => {
        cancelAnimationFrame(frame)
        // Wait one frame so DevTools device-mode / CSS media queries finish layout.
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            resizeCanvas()
          })
        })
      }

      scheduleResize()

      const container = containerRef.current
      const observer =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => scheduleResize())
          : null

      if (container && observer) {
        observer.observe(container)
      }

      window.addEventListener('resize', scheduleResize)
      window.addEventListener('orientationchange', scheduleResize)
      window.visualViewport?.addEventListener('resize', scheduleResize)

      // Fonts affect guide letter metrics — redraw once they are ready.
      document.fonts?.ready.then(() => scheduleResize()).catch(() => undefined)

      return () => {
        cancelAnimationFrame(frame)
        observer?.disconnect()
        window.removeEventListener('resize', scheduleResize)
        window.removeEventListener('orientationchange', scheduleResize)
        window.visualViewport?.removeEventListener('resize', scheduleResize)
      }
    }, [resizeCanvas])

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      event.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      // Ensure drawing coords match the latest board size before the stroke starts.
      syncCanvasSize()

      canvas.setPointerCapture(event.pointerId)
      isDrawingRef.current = true

      if (!hasStartedRef.current) {
        hasStartedRef.current = true
        onTracingStart?.()
      }

      currentStrokeRef.current = [getCanvasPoint(canvas, event.nativeEvent)]
      redraw()
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
      if (!isDrawingRef.current) return

      event.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      currentStrokeRef.current.push(getCanvasPoint(canvas, event.nativeEvent))
      redraw()
    }

    function finishStroke(event: React.PointerEvent<HTMLCanvasElement>) {
      if (!isDrawingRef.current) return

      event.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }

      isDrawingRef.current = false

      if (currentStrokeRef.current.length > 0) {
        strokesRef.current.push([...currentStrokeRef.current])
      }
      currentStrokeRef.current = []
      redraw()
    }

    return (
      <div ref={containerRef} className="practice-board">
        <canvas
          ref={canvasRef}
          className="tracing-canvas"
          aria-label={copy.canvasLabel(displayLetter)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>
    )
  },
)
