import type { BadgeDefinition } from '../utils/badges'
import { BADGE_DEFINITIONS } from '../utils/badges'
import type { AuthUser } from './types'

/** Shared reviewer / sponsor login — always available in this browser. */
export const DEMO_ACCOUNT = {
  id: 'demo-little-writing-buddy',
  name: 'Demo Learner',
  email: 'demo@littlewritingbuddy.edu',
  password: 'Demo1234',
} as const satisfies AuthUser & { password: string }

export type DemoProgressSeed = {
  attemptsCompleted: number
  bestScore: number
  latestScore: number
  lastFeedback: string
  earnedBadges: BadgeDefinition[]
}

/** Sample progress reviewers see after signing in with the demo account. */
export const DEMO_PROGRESS: DemoProgressSeed = {
  attemptsCompleted: 12,
  bestScore: 96,
  latestScore: 88,
  lastFeedback: 'Great tracing! You stayed on the lines.',
  earnedBadges: BADGE_DEFINITIONS.filter((badge) =>
    ['letter-star', 'careful-tracer', 'keep-going'].includes(badge.id),
  ),
}
