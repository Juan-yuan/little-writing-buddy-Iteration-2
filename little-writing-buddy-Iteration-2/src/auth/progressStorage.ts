import { DEMO_ACCOUNT, DEMO_PROGRESS, type DemoProgressSeed } from './demoAccount'

const PROGRESS_KEY = 'little-writing-buddy-progress'
const GUEST_SESSION_KEY = 'little-writing-buddy-session'

export type StoredProgress = DemoProgressSeed

type ProgressMap = Record<string, StoredProgress>

function readProgressMap(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as ProgressMap
  } catch {
    return {}
  }
}

function writeProgressMap(map: ProgressMap) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
}

export function ensureDemoProgress() {
  const map = readProgressMap()
  if (map[DEMO_ACCOUNT.id]) return
  writeProgressMap({ ...map, [DEMO_ACCOUNT.id]: { ...DEMO_PROGRESS } })
}

export function readUserProgress(userId: string): StoredProgress | null {
  ensureDemoProgress()
  return readProgressMap()[userId] ?? null
}

export function writeUserProgress(userId: string, progress: StoredProgress) {
  const map = readProgressMap()
  writeProgressMap({ ...map, [userId]: progress })
}

export function readGuestProgress(): StoredProgress | null {
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredProgress
  } catch {
    return null
  }
}

export function writeGuestProgress(progress: StoredProgress) {
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(progress))
  } catch {
    // sessionStorage unavailable — keep in-memory only
  }
}
