import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { DEMO_ACCOUNT, DEMO_PROGRESS } from '../auth/demoAccount'
import { ensureDemoAccount, signInAccount } from '../auth/storage'
import { useSessionProgress } from './useSessionProgress'
import type { TracingResult } from '../utils/tracingAccuracy'

function authWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

function makeResult(overrides: Partial<TracingResult> = {}): TracingResult {
  return {
    score: 96,
    incomplete: false,
    tooFarOutside: false,
    message: 'Great tracing!',
    onGuidePercent: 90,
    pointCount: 40,
    ...overrides,
  }
}

describe('feature: session progress', () => {
  it('correct: a complete attempt updates score, count, and badges', () => {
    const { result } = renderHook(() => useSessionProgress())

    act(() => {
      result.current.recordAttempt(makeResult({ score: 96 }))
    })

    expect(result.current.session.attemptsCompleted).toBe(1)
    expect(result.current.session.bestScore).toBe(96)
    expect(result.current.session.latestScore).toBe(96)
    expect(result.current.session.earnedBadges.some((b) => b.id === 'letter-star')).toBe(
      true,
    )
  })

  it('wrong: incomplete attempts do not count toward progress or badges', () => {
    const { result } = renderHook(() => useSessionProgress())

    act(() => {
      result.current.recordAttempt(
        makeResult({
          score: 0,
          incomplete: true,
          message: 'Trace a little more of the letter, then check again!',
        }),
      )
    })

    expect(result.current.session.attemptsCompleted).toBe(0)
    expect(result.current.session.bestScore).toBe(0)
    expect(result.current.session.earnedBadges).toEqual([])
    expect(result.current.session.latestScore).toBe(0)
  })

  it('correct: reset clears latest feedback while keeping progress', () => {
    const { result } = renderHook(() => useSessionProgress())

    act(() => {
      result.current.recordAttempt(makeResult({ score: 96 }))
      result.current.resetAttemptFeedback()
    })

    expect(result.current.session.attemptsCompleted).toBe(1)
    expect(result.current.session.bestScore).toBe(96)
    expect(result.current.session.latestScore).toBe(0)
    expect(result.current.session.earnedBadges).toHaveLength(1)
  })

  it('wrong: corrupt session storage falls back to defaults', () => {
    sessionStorage.setItem('little-writing-buddy-session', '{bad-json')
    const { result } = renderHook(() => useSessionProgress())
    expect(result.current.session.attemptsCompleted).toBe(0)
    expect(result.current.session.earnedBadges).toEqual([])
  })

  it('correct: duplicate badges are not awarded twice', () => {
    const { result } = renderHook(() => useSessionProgress())

    act(() => {
      result.current.recordAttempt(makeResult({ score: 96 }))
      result.current.recordAttempt(makeResult({ score: 97 }))
    })

    expect(result.current.session.attemptsCompleted).toBe(2)
    expect(result.current.session.earnedBadges.filter((b) => b.id === 'letter-star')).toHaveLength(
      1,
    )
  })

  it('correct: demo account loads prepopulated progress after sign-in', () => {
    ensureDemoAccount()
    signInAccount({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    })

    const { result } = renderHook(() => useSessionProgress(), {
      wrapper: authWrapper,
    })

    expect(result.current.session.attemptsCompleted).toBe(
      DEMO_PROGRESS.attemptsCompleted,
    )
    expect(result.current.session.bestScore).toBe(DEMO_PROGRESS.bestScore)
    expect(result.current.session.earnedBadges).toHaveLength(
      DEMO_PROGRESS.earnedBadges.length,
    )
  })
})
