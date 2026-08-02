export type LetterCase = 'uppercase' | 'lowercase'

export type WorksheetCase = 'uppercase' | 'lowercase' | 'both'

export type PracticeStatus = 'ready' | 'tracing' | 'review'

export interface PracticeSummary {
  attemptsCompleted: number
  bestScore: number
  latestScore: number
  latestIncomplete: boolean
  lastFeedback: string
  onGuidePercent: number
  currentLetter: string
  earnedBadges: { id: string; name: string; emoji: string }[]
  latestBadge?: { id: string; name: string; emoji: string }
  reviewKey: number
}
