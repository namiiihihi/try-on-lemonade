import { renderLipColor, clearCanvas } from '@/lib/lipRenderer'
import type { LipColor } from '@/lib/lipRenderer'
import type { LipLandmarks } from '@/lib/mediapipe'

function makeMockCtx() {
  const gradient = { addColorStop: jest.fn() }
  const ctx = {
    save: jest.fn(), restore: jest.fn(),
    beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(),
    quadraticCurveTo: jest.fn(), closePath: jest.fn(),
    fill: jest.fn(), clearRect: jest.fn(),
    createRadialGradient: jest.fn().mockReturnValue(gradient),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as string,
    fillStyle: '' as string | CanvasGradient | CanvasPattern,
  }
  return ctx as unknown as CanvasRenderingContext2D & { fill: jest.Mock; clearRect: jest.Mock; createRadialGradient: jest.Mock }
}

const makePts = (xs: number[], y: number) => xs.map(x => ({ x, y, z: 0 }))

const landmarks: LipLandmarks = {
  outerUpper: makePts([0.40, 0.43, 0.46, 0.50, 0.54, 0.57, 0.60], 0.55),
  outerLower: makePts([0.40, 0.43, 0.46, 0.50, 0.54, 0.57, 0.60], 0.62),
  innerUpper: makePts([0.42, 0.45, 0.48, 0.50, 0.52, 0.55, 0.58], 0.57),
  innerLower: makePts([0.42, 0.45, 0.48, 0.50, 0.52, 0.55, 0.58], 0.60),
}

describe('clearCanvas', () => {
  it('calls clearRect with full dimensions', () => {
    const ctx = makeMockCtx()
    clearCanvas(ctx, 640, 480)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480)
  })
})

describe('renderLipColor — matte', () => {
  const color: LipColor = { hex: '#9E3028', opacity: 0.78, finish: 'matte' }
  it('calls fill() (evenodd) at least once', () => {
    const ctx = makeMockCtx()
    renderLipColor(ctx, landmarks, color, 640, 480)
    expect(ctx.fill).toHaveBeenCalled()
  })
  it('does NOT create a gradient', () => {
    const ctx = makeMockCtx()
    renderLipColor(ctx, landmarks, color, 640, 480)
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
  })
})

describe('renderLipColor — glossy', () => {
  const color: LipColor = { hex: '#CC2850', opacity: 0.80, finish: 'glossy' }
  it('creates a radial gradient for shimmer', () => {
    const ctx = makeMockCtx()
    renderLipColor(ctx, landmarks, color, 640, 480)
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(2) // upper + lower lip highlight
  })
  it('calls fill() at least twice (color + shimmer)', () => {
    const ctx = makeMockCtx()
    renderLipColor(ctx, landmarks, color, 640, 480)
    expect(ctx.fill.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})

describe('renderLipColor — satin', () => {
  it('creates a subtle gradient (satin has shimmer too)', () => {
    const ctx = makeMockCtx()
    const color: LipColor = { hex: '#C07858', opacity: 0.65, finish: 'satin' }
    renderLipColor(ctx, landmarks, color, 640, 480)
    expect(ctx.createRadialGradient).toHaveBeenCalled()
  })
})
