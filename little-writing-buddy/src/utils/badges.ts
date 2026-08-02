export interface BadgeDefinition {
  id: string
  name: string
  minScore: number
  emoji: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'letter-star', name: 'Letter Star', minScore: 95, emoji: '⭐' },
  { id: 'careful-tracer', name: 'Careful Tracer', minScore: 85, emoji: '✏️' },
  { id: 'keep-going', name: 'Keep Going', minScore: 70, emoji: '🌟' },
]

export function badgeForScore(score: number): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((badge) => score >= badge.minScore)
}
