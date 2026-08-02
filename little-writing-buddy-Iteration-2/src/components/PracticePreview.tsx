import { useRef, useState } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import { accuracy, practice as copy } from '../content/siteCopy'
import { getDisplayLetter } from '../data/letters'
import { TracingCanvas, type TracingCanvasHandle } from './TracingCanvas'
import type { TracingResult } from '../utils/tracingAccuracy'
import type { LetterCase, PracticeStatus } from '../types/practice'

interface PracticePreviewProps {
  letterCase: LetterCase
  selectedLetter: string
  status: PracticeStatus
  resetToken: number
  onReset: () => void
  onReview: (result: TracingResult) => void
  onTracingStart: () => void
}

function fallbackResult(): TracingResult {
  return {
    score: 0,
    incomplete: true,
    tooFarOutside: false,
    message: accuracy.incomplete,
    onGuidePercent: 0,
    pointCount: 0,
  }
}

export function PracticePreview({
  letterCase,
  selectedLetter,
  status,
  resetToken,
  onReset,
  onReview,
  onTracingStart,
}: PracticePreviewProps) {
  const canvasRef = useRef<TracingCanvasHandle>(null)
  const [isChecking, setIsChecking] = useState(false)
  const displayLetter = getDisplayLetter(selectedLetter, letterCase)
  const selectionKey = `${selectedLetter}-${letterCase}`
  const caseLabel = copy.case[letterCase]
  const canCheck = status !== 'ready' && !isChecking

  function handleCheckTracing() {
    if (!canCheck) return

    setIsChecking(true)
    try {
      const result = canvasRef.current?.review() ?? fallbackResult()
      onReview(result)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section className="panel practice-panel" aria-labelledby="practice-title">
      <div className="section-heading practice-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="practice-title">{copy.title}</h2>
        </div>
        <div
          className="tracing-letter-chip"
          aria-live="polite"
          aria-atomic="true"
          key={selectionKey}
        >
          <span className="tracing-letter-chip-label">
            {letterCase === 'uppercase' ? 'BIG' : 'small'}
          </span>
          <span className="tracing-letter-chip-value">{displayLetter}</span>
        </div>
      </div>

      <div className="practice-board-wrap">
        <span className="canvas-hint">{copy.drawHere}</span>
        <TracingCanvas
          ref={canvasRef}
          selectedLetter={selectedLetter}
          letterCase={letterCase}
          resetToken={resetToken}
          onTracingStart={onTracingStart}
        />
      </div>

      <div className="practice-footer">
        <p className="helper-copy">{copy.helper(displayLetter, caseLabel)}</p>
        <p className={`status-pill status-${status}`}>
          <span className="status-dot" aria-hidden="true"></span>
          {copy.status[status]} — {displayLetter}
        </p>
      </div>

      <div className="practice-actions">
        <button type="button" className="secondary-action" onClick={onReset}>
          <RotateCcw size={18} aria-hidden="true" />
          {copy.clearRetry}
        </button>
        <button
          type="button"
          className="primary-action"
          onClick={handleCheckTracing}
          disabled={!canCheck}
          aria-busy={isChecking}
          title={status === 'ready' ? copy.checkHint : undefined}
        >
          <Sparkles size={18} aria-hidden="true" />
          {isChecking ? copy.checking : copy.checkTracing}
        </button>
      </div>
    </section>
  )
}
