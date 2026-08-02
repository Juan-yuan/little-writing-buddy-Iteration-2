import { forwardRef, type CSSProperties } from 'react'
import { Award, Sparkles } from 'lucide-react'
import { feedback as copy } from '../content/siteCopy'
import type { PracticeStatus, PracticeSummary } from '../types/practice'

interface FeedbackPanelProps {
  practiceStatus: PracticeStatus
  summary: PracticeSummary
}

function feedbackTone(
  score: number,
  hasResult: boolean,
  incomplete: boolean,
) {
  if (!hasResult) return 'ready'
  if (incomplete) return 'practice'
  if (score >= 85) return 'great'
  if (score >= 65) return 'good'
  if (score >= 40) return 'practice'
  return 'practice'
}

export const FeedbackPanel = forwardRef<HTMLElement, FeedbackPanelProps>(
  function FeedbackPanel({ practiceStatus, summary }, ref) {
    const hasResult = practiceStatus === 'review' && summary.reviewKey > 0
    const showScore = hasResult && !summary.latestIncomplete
    const tone = feedbackTone(summary.latestScore, hasResult, summary.latestIncomplete)
    const ringScore = showScore ? summary.latestScore : 0

    return (
      <section
        ref={ref}
        className="panel feedback-panel"
        aria-labelledby="feedback-title"
      >
        <div className="section-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="feedback-title">{copy.title}</h2>
        </div>

        <div className="feedback-body">
          <div className="feedback-hero">
            <div
              key={summary.reviewKey}
              className={`feedback-message ${tone}`}
              role="status"
              aria-live="polite"
            >
              {hasResult ? summary.lastFeedback : copy.empty}
            </div>

            <div
              key={`score-${summary.reviewKey}`}
              className="score-card score-card-updated"
            >
              <div
                className="score-ring"
                style={{ '--ring-score': ringScore } as CSSProperties}
                data-empty={showScore ? undefined : true}
                aria-hidden={!showScore}
              >
                <span className="score-ring-value">
                  {showScore ? `${summary.latestScore}%` : '—'}
                </span>
              </div>
              <div className="score-card-copy">
                <p className="score-label">{copy.scoreLabel}</p>
                {hasResult && summary.onGuidePercent > 0 && (
                  <p className="score-detail">
                    {copy.onGuide(summary.onGuidePercent)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <dl className="feedback-stats">
            <div className="feedback-stat">
              <dt>{copy.attemptsCompleted}</dt>
              <dd>{summary.attemptsCompleted}</dd>
            </div>
            <div className="feedback-stat">
              <dt>{copy.bestScore}</dt>
              <dd>{summary.bestScore > 0 ? `${summary.bestScore}%` : '—'}</dd>
            </div>
            <div className="feedback-stat">
              <dt>{copy.currentLetter}</dt>
              <dd>{summary.currentLetter}</dd>
            </div>
          </dl>

          {summary.latestBadge && (
            <div className="badge-preview badge-new">
              <Sparkles size={18} aria-hidden="true" />
              <span>{copy.newBadge(summary.latestBadge.emoji, summary.latestBadge.name)}</span>
            </div>
          )}

          {summary.earnedBadges.length > 0 && (
            <div className="badge-collection" aria-label="Earned badges this session">
              <p className="badge-collection-title">
                <Award size={16} aria-hidden="true" />
                {copy.sessionBadges}
              </p>
              <ul className="badge-list">
                {summary.earnedBadges.map((badge) => (
                  <li key={badge.id} className="badge-chip">
                    <span aria-hidden="true">{badge.emoji}</span>
                    {badge.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    )
  },
)
