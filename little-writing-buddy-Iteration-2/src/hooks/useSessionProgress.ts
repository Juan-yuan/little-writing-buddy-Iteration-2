import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../auth/authContextValue'
import {
  readGuestProgress,
  readUserProgress,
  writeGuestProgress,
  writeUserProgress,
  type StoredProgress,
} from '../auth/progressStorage'
import { session as sessionCopy } from '../content/siteCopy'
import type { BadgeDefinition } from '../utils/badges'
import { badgeForScore } from '../utils/badges'
import type { TracingResult } from '../utils/tracingAccuracy'

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

function normalizeProgress(raw: StoredProgress | null): SessionProgressState {
  if (!raw) return defaultState
  return {
    ...defaultState,
    ...raw,
    earnedBadges: raw.earnedBadges ?? [],
  }
}

function loadProgress(userId: string | null): SessionProgressState {
  if (userId) {
    return normalizeProgress(readUserProgress(userId))
  }
  return normalizeProgress(readGuestProgress())
}

function saveProgress(userId: string | null, state: SessionProgressState) {
  if (userId) {
    writeUserProgress(userId, state)
    return
  }
  writeGuestProgress(state)
}

export function useSessionProgress() {
  const auth = useContext(AuthContext)
  const userId = auth?.user?.id ?? null
  const sessionOwnerRef = useRef(userId)
  const [session, setSession] = useState<SessionProgressState>(() =>
    loadProgress(userId),
  )

  useEffect(() => {
    if (sessionOwnerRef.current !== userId) {
      sessionOwnerRef.current = userId
      setSession(loadProgress(userId))
      return
    }
    saveProgress(userId, session)
  }, [session, userId])

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
