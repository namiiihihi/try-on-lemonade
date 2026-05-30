import { extractLipLandmarks, LIP_OUTER_UPPER, LIP_OUTER_LOWER, LIP_INNER_UPPER, LIP_INNER_LOWER } from '@/lib/mediapipe'

function buildMockLandmarks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: parseFloat((i * 0.002).toFixed(4)),
    y: parseFloat((i * 0.003).toFixed(4)),
    z: parseFloat((i * 0.0001).toFixed(5)),
  }))
}

const landmarks = buildMockLandmarks(478) // refineLandmarks adds iris pts
const result    = extractLipLandmarks(landmarks)

describe('extractLipLandmarks', () => {
  it('returns correct number of outerUpper points', () => {
    expect(result.outerUpper).toHaveLength(LIP_OUTER_UPPER.length)
  })
  it('returns correct number of outerLower points', () => {
    expect(result.outerLower).toHaveLength(LIP_OUTER_LOWER.length)
  })
  it('returns correct number of innerUpper points', () => {
    expect(result.innerUpper).toHaveLength(LIP_INNER_UPPER.length)
  })
  it('returns correct number of innerLower points', () => {
    expect(result.innerLower).toHaveLength(LIP_INNER_LOWER.length)
  })

  it('outerUpper points map to correct landmark indices', () => {
    result.outerUpper.forEach((pt, i) => {
      expect(pt).toEqual(landmarks[LIP_OUTER_UPPER[i]])
    })
  })
  it('outerLower points map to correct landmark indices', () => {
    result.outerLower.forEach((pt, i) => {
      expect(pt).toEqual(landmarks[LIP_OUTER_LOWER[i]])
    })
  })

  it('every point has numeric x, y, z', () => {
    const all = [...result.outerUpper, ...result.outerLower, ...result.innerUpper, ...result.innerLower]
    all.forEach(pt => {
      expect(typeof pt.x).toBe('number')
      expect(typeof pt.y).toBe('number')
      expect(typeof pt.z).toBe('number')
    })
  })
})
