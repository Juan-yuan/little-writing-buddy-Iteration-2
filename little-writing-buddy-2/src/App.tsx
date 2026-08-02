import { useMemo, useRef, useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { FeedbackPanel } from './components/FeedbackPanel'
import { LetterControls } from './components/LetterControls'
import { PracticePreview } from './components/PracticePreview'
import { StepProgress } from './components/StepProgress'
import { WorksheetPanel } from './components/WorksheetPanel'
import { useSessionProgress } from './hooks/useSessionProgress'
import { getDisplayLetter, normalizeLetter, alphabet } from './data/letters'
import type { LetterCase, PracticeStatus, WorksheetCase } from './types/practice'
import type { TracingResult } from './utils/tracingAccuracy'

function App() {
  const { session, recordAttempt, resetAttemptFeedback } = useSessionProgress()
  const feedbackRef = useRef<HTMLElement>(null)

  const [selectedLetter, setSelectedLetter] = useState('A')
  const [letterCase, setLetterCase] = useState<LetterCase>('uppercase')
  const [practiceStatus, setPracticeStatus] = useState<PracticeStatus>('ready')
  const [lastReview, setLastReview] = useState<TracingResult | null>(null)
  const [reviewKey, setReviewKey] = useState(0)
  const [latestBadge, setLatestBadge] = useState<
    { id: string; name: string; emoji: string } | undefined
  >()
  const [worksheetLetters, setWorksheetLetters] = useState<string[]>(['A', 'B', 'C'])
  const [worksheetCase, setWorksheetCase] = useState<WorksheetCase>('uppercase')
  const [canvasResetToken, setCanvasResetToken] = useState(0)

  const displayLetter = getDisplayLetter(selectedLetter, letterCase)

  const currentStep: 1 | 2 | 3 = practiceStatus === 'review' ? 3 : 2

  const feedbackSummary = useMemo(
    () => ({
      attemptsCompleted: session.attemptsCompleted,
      bestScore: session.bestScore,
      latestScore: lastReview?.score ?? session.latestScore,
      latestIncomplete: lastReview?.incomplete ?? false,
      lastFeedback: lastReview?.message ?? session.lastFeedback,
      onGuidePercent: lastReview?.onGuidePercent ?? 0,
      currentLetter: displayLetter,
      earnedBadges: session.earnedBadges,
      latestBadge,
      reviewKey,
    }),
    [session, displayLetter, latestBadge, lastReview, reviewKey],
  )

  function resetCurrentAttempt() {
    setPracticeStatus('ready')
    setLastReview(null)
    setReviewKey(0)
    setLatestBadge(undefined)
    resetAttemptFeedback()
    setCanvasResetToken((prev) => prev + 1)
  }

  function handleLetterChange(letter: string) {
    setSelectedLetter(normalizeLetter(letter))
    resetCurrentAttempt()
  }

  function handleCaseChange(nextCase: LetterCase) {
    setLetterCase(nextCase)
    resetCurrentAttempt()
  }

  function handleReset() {
    resetCurrentAttempt()
  }

  function handleTracingStart() {
    setPracticeStatus('tracing')
  }

  function handleReview(result: TracingResult) {
    setLastReview(result)
    setReviewKey((key) => key + 1)
    setPracticeStatus('review')
    setLatestBadge(undefined)

    const newBadge = recordAttempt(result)
    if (newBadge) {
      setLatestBadge(newBadge)
    }

    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 959px)').matches) {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  function handleToggleWorksheetLetter(letter: string) {
    setWorksheetLetters((prev) =>
      prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter].sort(),
    )
  }

  function handleSelectAllWorksheetLetters() {
    setWorksheetLetters([...alphabet])
  }

  function handleClearWorksheetLetters() {
    setWorksheetLetters([])
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="workspace">
        <StepProgress currentStep={currentStep} />

        <section className="workspace-setup" aria-label="Letter selection">
          <LetterControls
            letterCase={letterCase}
            selectedLetter={selectedLetter}
            onCaseChange={handleCaseChange}
            onLetterChange={handleLetterChange}
          />
        </section>

        <div className="workspace-main">
          <PracticePreview
            letterCase={letterCase}
            selectedLetter={selectedLetter}
            status={practiceStatus}
            resetToken={canvasResetToken}
            onReset={handleReset}
            onReview={handleReview}
            onTracingStart={handleTracingStart}
          />

          <FeedbackPanel
            ref={feedbackRef}
            practiceStatus={practiceStatus}
            summary={feedbackSummary}
          />
        </div>

        <section className="workspace-worksheet" aria-label="Worksheet generator">
          <WorksheetPanel
            selectedLetters={worksheetLetters}
            worksheetCase={worksheetCase}
            onToggleLetter={handleToggleWorksheetLetter}
            onSelectAllLetters={handleSelectAllWorksheetLetters}
            onClearLetters={handleClearWorksheetLetters}
            onCaseChange={setWorksheetCase}
          />
        </section>
      </div>
    </main>
  )
}

export default App
