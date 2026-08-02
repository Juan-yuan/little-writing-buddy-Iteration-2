import { useCallback, useEffect, useState } from 'react'
import { session as sessionCopy } from '../content/siteCopy'
import type { BadgeDefinition } from '../utils/badges'
import { badgeForScore } from '../utils/badges'
import type { TracingResult } from '../utils/tracingAccuracy'

const STORAGE_KEY = 'little-writing-buddy-session'

export interface SessionProgressState {
  attemptsCompleted: number
  bestScore: number
  latestScore: number
  lastFeedback: string
  earnedBadges: BadgeDefinition[]
}

const defaultState: SessionProgressState = {
  attemptsCompleted: 0,
  bestScore: 0,
  latestScore: 0,
  lastFeedback: sessionCopy.defaultFeedback,
  earnedBadges: [],
}

function loadSession(): SessionProgressState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as SessionProgressState
    return {
      ...defaultState,
      ...parsed,
      earnedBadges: parsed.earnedBadges ?? [],
    }
  } catch {
    return defaultState
  }
}

function saveSession(state: SessionProgressState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage unavailable — keep in-memory only
  }
}

export function useSessionProgress() {
  const [session, setSession] = useState<SessionProgressState>(loadSession)

  useEffect(() => {
    saveSession(session)
  }, [session])

  const recordAttempt = useCallback(
    (result: TracingResult): BadgeDefinition | undefined => {
      let newlyEarned: BadgeDefinition | undefined

      setSession((prev) => {
        if (result.incomplete) {
          return {
            ...prev,
            latestScore: result.score,
            lastFeedback: result.message,
          }
        }

        const badge = badgeForScore(result.score)
        const alreadyHasBadge = badge
          ? prev.earnedBadges.some((b) => b.id === badge.id)
          : true

        if (badge && !alreadyHasBadge) {
          newlyEarned = badge
        }

        const earnedBadges =
          badge && !alreadyHasBadge
            ? [...prev.earnedBadges, badge]
            : prev.earnedBadges

        return {
          attemptsCompleted: prev.attemptsCompleted + 1,
          bestScore: Math.max(prev.bestScore, result.score),
          latestScore: result.score,
          lastFeedback: result.message,
          earnedBadges,
        }
      })

      return newlyEarned
    },
    [],
  )

  const resetAttemptFeedback = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      latestScore: 0,
      lastFeedback: sessionCopy.defaultFeedback,
    }))
  }, [])

  return {
    session,
    recordAttempt,
    resetAttemptFeedback,
  }
}
