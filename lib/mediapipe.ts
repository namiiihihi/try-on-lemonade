// FaceMesh — browser-only, loads via CDN script tag.

export type Landmark = { x: number; y: number; z: number }

export type LipLandmarks = {
  outerUpper: Landmark[]   // outer boundary upper
  outerLower: Landmark[]   // outer boundary lower
  innerUpper: Landmark[]   // inner boundary upper (mouth opening top)
  innerLower: Landmark[]   // inner boundary lower (mouth opening bottom)
}

// ── Outer lip boundary (vermillion edge) ─────────────────────────────────────
export const LIP_OUTER_UPPER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
export const LIP_OUTER_LOWER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291]

// ── Inner lip boundary (mouth opening edge) ───────────────────────────────────
// Used with evenodd fill rule to prevent coloring teeth/tongue when mouth is open
export const LIP_INNER_UPPER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]
export const LIP_INNER_LOWER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]

// Legacy exports kept for unit-test compatibility
export const UPPER_LIP_INDICES = LIP_OUTER_UPPER
export const LOWER_LIP_INDICES = LIP_OUTER_LOWER

// ── Eye region landmarks for iris colour approximation ────────────────────────
// Using outer/inner corners + top/bottom lid to estimate iris centre
export const LEFT_EYE_REGION  = [33, 133, 159, 145]  // outer, inner, top, bottom
export const RIGHT_EYE_REGION = [263, 362, 386, 374]

// ── Hair / upper-head region (above forehead landmark 10) ────────────────────
export const HAIR_FOREHEAD_TOP = 10  // topmost forehead landmark — sample above this

const MEDIAPIPE_VERSION = '0.4.1633559619'
export const MEDIAPIPE_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${MEDIAPIPE_VERSION}`

type FaceMeshOptions  = { locateFile: (f: string) => string }
type FaceMeshSetOpts  = { maxNumFaces?: number; refineLandmarks?: boolean; minDetectionConfidence?: number; minTrackingConfidence?: number }
export type FaceMeshInstance = {
  setOptions: (o: FaceMeshSetOpts) => void
  onResults:  (cb: (r: FaceMeshResult) => void) => void
  send:       (input: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }) => Promise<void>
  close:      () => Promise<void>
}
export type FaceMeshResult = { multiFaceLandmarks?: Landmark[][] }
type Win = Window & { FaceMesh?: new (o: FaceMeshOptions) => FaceMeshInstance }

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const el = document.createElement('script')
    el.src = src; el.crossOrigin = 'anonymous'
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Script load failed: ${src}`))
    document.head.appendChild(el)
  })
}

export async function initFaceMesh(onResults: (r: FaceMeshResult) => void): Promise<FaceMeshInstance> {
  await injectScript(`${MEDIAPIPE_CDN}/face_mesh.js`)
  const win = window as Win
  if (!win.FaceMesh) throw new Error('window.FaceMesh unavailable after script load')
  const fm = new win.FaceMesh({ locateFile: (f) => `${MEDIAPIPE_CDN}/${f}` })
  fm.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.2, minTrackingConfidence: 0.2 })
  fm.onResults(onResults)
  return fm
}

export function extractLipLandmarks(landmarks: Landmark[]): LipLandmarks {
  return {
    outerUpper: LIP_OUTER_UPPER.map(i => landmarks[i]),
    outerLower: LIP_OUTER_LOWER.map(i => landmarks[i]),
    innerUpper: LIP_INNER_UPPER.map(i => landmarks[i]),
    innerLower: LIP_INNER_LOWER.map(i => landmarks[i]),
  }
}
