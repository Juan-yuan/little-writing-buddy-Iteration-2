import { accuracy } from '../content/siteCopy'
import type { LetterCase } from '../types/practice'
import { normalizeLetter } from '../data/letters'
import { drawGuideLetterSolid } from './guideLetter'

export type Point = { x: number; y: number }

export interface TracingResult {
  score: number
  incomplete: boolean
  tooFarOutside: boolean
  message: string
  onGuidePercent: number
  pointCount: number
}

interface EvaluateOptions {
  strokes: Point[][]
  width: number
  height: number
  letter: string
  letterCase: LetterCase
}

interface GuideBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

interface LetterGuideData {
  pixels: Point[]
  grid: Map<string, Point[]>
  cellSize: number
  bounds: GuideBounds
  /** Rough expected tracing distance for a full letter attempt. */
  expectedPathLength: number
}

const MIN_POINTS = 28
const MIN_ABSOLUTE_PATH = 45
const MIN_PATH_COVERAGE = 0.32
const MIN_GUIDE_COVERAGE = 0.18
const GRID_CELL_SIZE = 8
const MAX_EVAL_DIMENSION = 280
const MAX_GUIDE_SAMPLES = 600
const MAX_STROKE_SAMPLES = 400

const guideCache = new Map<string, LetterGuideData>()

function getAccuracyFeedback(score: number, incomplete = false): string {
  if (incomplete) return accuracy.incomplete
  if (score >= 85) return accuracy.great
  if (score >= 65) return accuracy.good
  if (score >= 40) return accuracy.practice
  return accuracy.low
}

function flattenStrokes(strokes: Point[][]): Point[] {
  return strokes.flat()
}

function totalPathLength(points: Point[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    length += Math.hypot(dx, dy)
  }
  return length
}

function samplePoints(points: Point[], maxSamples: number): Point[] {
  if (points.length <= maxSamples) return points
  const step = Math.ceil(points.length / maxSamples)
  return points.filter((_, index) => index % step === 0)
}

function getEvalScale(width: number, height: number): number {
  const maxDim = Math.max(width, height)
  if (maxDim <= MAX_EVAL_DIMENSION) return 1
  return MAX_EVAL_DIMENSION / maxDim
}

function scalePoint(point: Point, scale: number): Point {
  if (scale === 1) return point
  return { x: point.x * scale, y: point.y * scale }
}

function buildSpatialGrid(pixels: Point[], cellSize: number): Map<string, Point[]> {
  const grid = new Map<string, Point[]>()

  for (const pixel of pixels) {
    const key = `${Math.floor(pixel.x / cellSize)},${Math.floor(pixel.y / cellSize)}`
    const bucket = grid.get(key)
    if (bucket) {
      bucket.push(pixel)
    } else {
      grid.set(key, [pixel])
    }
  }

  return grid
}

function getGuideBounds(pixels: Point[]): GuideBounds {
  if (pixels.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const pixel of pixels) {
    minX = Math.min(minX, pixel.x)
    minY = Math.min(minY, pixel.y)
    maxX = Math.max(maxX, pixel.x)
    maxY = Math.max(maxY, pixel.y)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

function extractLetterPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): Point[] {
  const pixels: Point[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4] < 200) {
        pixels.push({ x, y })
      }
    }
  }

  return pixels
}

function estimateExpectedPathLength(bounds: GuideBounds): number {
  if (bounds.width <= 0 || bounds.height <= 0) return MIN_ABSOLUTE_PATH * 2
  return (bounds.width + bounds.height) * 0.92
}

function getLetterGuideData(
  width: number,
  height: number,
  letter: string,
  letterCase: LetterCase,
): LetterGuideData {
  const cacheKey = `${letter}|${letterCase}|${width}|${height}`
  const cached = guideCache.get(cacheKey)
  if (cached) return cached

  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')
  if (!ctx) {
    const emptyBounds = getGuideBounds([])
    return {
      pixels: [],
      grid: new Map(),
      cellSize: GRID_CELL_SIZE,
      bounds: emptyBounds,
      expectedPathLength: estimateExpectedPathLength(emptyBounds),
    }
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  drawGuideLetterSolid(ctx, width, height, normalizeLetter(letter), letterCase, '#000000')

  const pixels = extractLetterPixels(ctx.getImageData(0, 0, width, height).data, width, height)
  const bounds = getGuideBounds(pixels)
  const entry: LetterGuideData = {
    pixels,
    grid: buildSpatialGrid(pixels, GRID_CELL_SIZE),
    cellSize: GRID_CELL_SIZE,
    bounds,
    expectedPathLength: estimateExpectedPathLength(bounds),
  }

  guideCache.set(cacheKey, entry)
  if (guideCache.size > 104) {
    const oldestKey = guideCache.keys().next().value
    if (oldestKey) guideCache.delete(oldestKey)
  }

  return entry
}

function nearestDistanceSq(
  x: number,
  y: number,
  guide: LetterGuideData,
  maxSearchDistance: number,
): number {
  if (guide.pixels.length === 0) return Number.POSITIVE_INFINITY

  const { bounds, grid, cellSize } = guide
  const outsideX = Math.max(bounds.minX - x, x - bounds.maxX, 0)
  const outsideY = Math.max(bounds.minY - y, y - bounds.maxY, 0)
  const outsideDistance = Math.hypot(outsideX, outsideY)

  if (outsideDistance > maxSearchDistance) {
    return Number.POSITIVE_INFINITY
  }

  const originX = Math.floor(x / cellSize)
  const originY = Math.floor(y / cellSize)
  const searchCells = Math.ceil(maxSearchDistance / cellSize)
  let nearest = Number.POSITIVE_INFINITY

  for (let dy = -searchCells; dy <= searchCells; dy++) {
    for (let dx = -searchCells; dx <= searchCells; dx++) {
      const bucket = grid.get(`${originX + dx},${originY + dy}`)
      if (!bucket) continue

      for (const pixel of bucket) {
        const deltaX = x - pixel.x
        const deltaY = y - pixel.y
        const distanceSq = deltaX * deltaX + deltaY * deltaY
        if (distanceSq < nearest) {
          nearest = distanceSq
          if (nearest === 0) return 0
        }
      }
    }
  }

  return nearest
}

function hasNearbyPoint(
  x: number,
  y: number,
  grid: Map<string, Point[]>,
  cellSize: number,
  maxDistanceSq: number,
): boolean {
  const originX = Math.floor(x / cellSize)
  const originY = Math.floor(y / cellSize)
  const searchCells = Math.ceil(Math.sqrt(maxDistanceSq) / cellSize)

  for (let dy = -searchCells; dy <= searchCells; dy++) {
    for (let dx = -searchCells; dx <= searchCells; dx++) {
      const bucket = grid.get(`${originX + dx},${originY + dy}`)
      if (!bucket) continue

      for (const point of bucket) {
        const deltaX = x - point.x
        const deltaY = y - point.y
        if (deltaX * deltaX + deltaY * deltaY <= maxDistanceSq) {
          return true
        }
      }
    }
  }

  return false
}

function measureGuideCoverage(
  guide: LetterGuideData,
  strokeGrid: Map<string, Point[]>,
  innerToleranceSq: number,
): number {
  if (guide.pixels.length === 0) return 0

  const sampledGuide = samplePoints(guide.pixels, MAX_GUIDE_SAMPLES)
  let covered = 0

  for (const pixel of sampledGuide) {
    if (hasNearbyPoint(pixel.x, pixel.y, strokeGrid, GRID_CELL_SIZE, innerToleranceSq)) {
      covered++
    }
  }

  return covered / sampledGuide.length
}

function incompleteResult(pointCount: number): TracingResult {
  return {
    score: 0,
    incomplete: true,
    tooFarOutside: false,
    message: getAccuracyFeedback(0, true),
    onGuidePercent: 0,
    pointCount,
  }
}

function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}

export function evaluateTracingAccuracy({
  strokes,
  width,
  height,
  letter,
  letterCase,
}: EvaluateOptions): TracingResult {
  const allPoints = flattenStrokes(strokes)
  const pointCount = allPoints.length

  if (width <= 0 || height <= 0 || pointCount === 0) {
    return incompleteResult(pointCount)
  }

  const scale = getEvalScale(width, height)
  const evalWidth = Math.max(1, Math.round(width * scale))
  const evalHeight = Math.max(1, Math.round(height * scale))
  const scaledPoints = samplePoints(
    allPoints.map((point) => scalePoint(point, scale)),
    MAX_STROKE_SAMPLES,
  )
  const drawnPathLength = totalPathLength(scaledPoints)

  const guide = getLetterGuideData(
    evalWidth,
    evalHeight,
    normalizeLetter(letter),
    letterCase,
  )

  if (guide.pixels.length === 0) {
    return incompleteResult(pointCount)
  }

  const minRequiredPath = Math.max(
    MIN_ABSOLUTE_PATH,
    guide.expectedPathLength * MIN_PATH_COVERAGE,
  )

  if (pointCount < MIN_POINTS || drawnPathLength < minRequiredPath) {
    return incompleteResult(pointCount)
  }

  const innerTolerance = Math.max(10, evalWidth * 0.022)
  const outerTolerance = innerTolerance * 1.45
  const innerToleranceSq = innerTolerance * innerTolerance
  const outerToleranceSq = outerTolerance * outerTolerance

  let onGuide = 0
  let nearGuide = 0
  let far = 0

  for (const point of scaledPoints) {
    const x = Math.round(point.x)
    const y = Math.round(point.y)

    if (x < 0 || y < 0 || x >= evalWidth || y >= evalHeight) {
      far++
      continue
    }

    const distanceSq = nearestDistanceSq(x, y, guide, outerTolerance)

    if (distanceSq <= innerToleranceSq) {
      onGuide++
    } else if (distanceSq <= outerToleranceSq) {
      nearGuide++
    } else {
      far++
    }
  }

  const total = scaledPoints.length
  const onGuideRatio = onGuide / total
  const nearGuideRatio = nearGuide / total
  const farRatio = far / total
  const onGuidePercent = Math.round(onGuideRatio * 100)

  const strokeGrid = buildSpatialGrid(scaledPoints, GRID_CELL_SIZE)
  const guideCoverage = measureGuideCoverage(guide, strokeGrid, innerToleranceSq)
  const pathCompleteness = Math.min(1, drawnPathLength / guide.expectedPathLength)

  if (guideCoverage < MIN_GUIDE_COVERAGE) {
    return incompleteResult(pointCount)
  }

  const strokeAlignment = onGuideRatio + nearGuideRatio * 0.35
  const tooFarOutside = farRatio >= 0.22

  let score =
    (strokeAlignment * 0.42 + guideCoverage * 0.48 + pathCompleteness * 0.1) * 100

  if (farRatio > 0.08) {
    score *= 1 - (farRatio - 0.08) * 1.35
  }

  if (tooFarOutside) {
    score *= 0.55
  }

  let maxScore = 100
  if (guideCoverage < 0.35) maxScore = Math.min(maxScore, 38)
  else if (guideCoverage < 0.5) maxScore = Math.min(maxScore, 55)
  else if (guideCoverage < 0.65) maxScore = Math.min(maxScore, 72)
  else if (guideCoverage < 0.78) maxScore = Math.min(maxScore, 86)

  if (farRatio > 0.12) maxScore = Math.min(maxScore, 62)
  if (farRatio > 0.2) maxScore = Math.min(maxScore, 45)
  if (farRatio > 0.3) maxScore = Math.min(maxScore, 28)

  if (pathCompleteness < 0.45) maxScore = Math.min(maxScore, 58)
  if (pathCompleteness < 0.3) maxScore = Math.min(maxScore, 40)

  score = Math.min(score, maxScore)

  if (
    score >= 95 &&
    (guideCoverage < 0.88 || strokeAlignment < 0.88 || farRatio > 0.04 || pathCompleteness < 0.72)
  ) {
    score = Math.min(score, 94)
  }

  if (
    score >= 85 &&
    (guideCoverage < 0.75 || strokeAlignment < 0.78 || farRatio > 0.08 || pathCompleteness < 0.55)
  ) {
    score = Math.min(score, 84)
  }

  score = clampScore(score)

  return {
    score,
    incomplete: false,
    tooFarOutside,
    message: getAccuracyFeedback(score),
    onGuidePercent,
    pointCount,
  }
}
