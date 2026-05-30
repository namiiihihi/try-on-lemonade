// Skin tone & personal color analysis from MediaPipe face landmarks.
// Uses CIE Lab* colour space for lighting-invariant skin classification.
// Considers: skin tone, undertone, eye colour, hair tone, and lighting level.

import type { Landmark } from './mediapipe'
import { LEFT_EYE_REGION, RIGHT_EYE_REGION, HAIR_FOREHEAD_TOP } from './mediapipe'

export type SkinTone         = 'light' | 'medium' | 'dark'
export type Undertone        = 'warm' | 'cool' | 'neutral'
export type PersonalColor    = 'spring' | 'summer' | 'autumn' | 'winter'
export type PersonalColorSub =
  | 'warm_spring'  | 'light_spring'  | 'clear_spring'
  | 'cool_summer'  | 'soft_summer'   | 'light_summer'
  | 'soft_autumn'  | 'deep_autumn'   | 'warm_autumn'
  | 'deep_winter'  | 'clear_winter'  | 'cool_winter'
export type LipColorTone  = 'cam' | 'do' | 'hong'
export type EyeTone       = 'dark' | 'medium' | 'light'
export type HairTone      = 'dark' | 'medium' | 'light'
export type LightingLevel = 'low' | 'normal' | 'bright'

export type SkinAnalysis = {
  tone:             SkinTone
  undertone:        Undertone
  personalColor:    PersonalColor
  personalColorSub: PersonalColorSub
  lipColorTone:     LipColorTone
  eyeTone:          EyeTone
  hairTone:         HairTone
  lightingLevel:    LightingLevel
  confidence:       number   // 0–1
  labValues:        { L: number; a: number; b: number }
}

// ── MediaPipe landmark indices for skin sampling regions ──────────────────────
const FOREHEAD_IDX    = [10, 9, 151, 337, 108, 67, 109]
const LEFT_CHEEK_IDX  = [234, 93, 132, 58, 172]
const RIGHT_CHEEK_IDX = [454, 323, 361, 288, 397]
const NOSE_IDX        = [1, 4, 5, 195]

// ── CIE Lab* conversion ────────────────────────────────────────────────────────
function linearize(c: number): number {
  c = c / 255
  return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92
}

function rgbToLab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const rl = linearize(r), gl = linearize(g), bl = linearize(b)
  const X = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047
  const Y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / 1.00000
  const Z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  const fx = f(X), fy = f(Y), fz = f(Z)
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

// ── Pixel sampler ─────────────────────────────────────────────────────────────
function sampleRegion(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  maxW: number, maxH: number,
  minBrightness = 25, maxBrightness = 235,
): { r: number; g: number; b: number } | null {
  const x0 = Math.max(0, Math.round(cx - radius))
  const y0 = Math.max(0, Math.round(cy - radius))
  const x1 = Math.min(maxW - 1, Math.round(cx + radius))
  const y1 = Math.min(maxH - 1, Math.round(cy + radius))
  const rw = x1 - x0, rh = y1 - y0
  if (rw < 1 || rh < 1) return null

  try {
    const d = ctx.getImageData(x0, y0, rw, rh).data
    let sr = 0, sg = 0, sb = 0, n = 0
    for (let i = 0; i < d.length; i += 4) {
      const avg = (d[i] + d[i + 1] + d[i + 2]) / 3
      if (avg < minBrightness || avg > maxBrightness) continue
      sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++
    }
    return n > 0 ? { r: sr / n, g: sg / n, b: sb / n } : null
  } catch {
    return null
  }
}

// ── Landmark centre helper ─────────────────────────────────────────────────────
function landmarkCentre(lm: Landmark[], indices: number[]): { x: number; y: number } | null {
  let sx = 0, sy = 0, n = 0
  for (const i of indices) {
    const p = lm[i]
    if (p) { sx += p.x; sy += p.y; n++ }
  }
  return n > 0 ? { x: sx / n, y: sy / n } : null
}

// ── L* variance for contrast classification ───────────────────────────────────
function labVariance(labs: { L: number; a: number; b: number }[]): number {
  if (labs.length < 2) return 0
  const mean = labs.reduce((s, l) => s + l.L, 0) / labs.length
  return labs.reduce((s, l) => s + (l.L - mean) ** 2, 0) / labs.length
}

// ── Sub-type classifier ───────────────────────────────────────────────────────
// Based on 12-type system from personal colour research:
//   Spring:  Warm / Light / Clear
//   Summer:  Cool / Soft / Light
//   Autumn:  Soft / Deep / Warm
//   Winter:  Deep / Clear / Cool
function classifySubType(
  season: PersonalColor,
  L: number, aVal: number, bVal: number,
  eyeTone: EyeTone,
  lVariance: number,
): PersonalColorSub {
  const isLight        = L >= 65
  const isDark         = L <= 52
  const isHighContrast = lVariance > 9  // large spread between skin regions → "Clear"
  const isVeryWarm     = bVal >= 17
  const isStrictlyCool = aVal <= 4 && bVal <= 8

  switch (season) {
    case 'spring':
      if (isLight)               return 'light_spring'
      if (isHighContrast)        return 'clear_spring'
      return 'warm_spring'

    case 'summer':
      if (isLight)               return 'light_summer'
      if (isStrictlyCool)        return 'cool_summer'
      return 'soft_summer'

    case 'autumn':
      if (isDark)                return 'deep_autumn'
      if (isVeryWarm)            return 'warm_autumn'
      return 'soft_autumn'

    case 'winter':
      if (isDark || eyeTone === 'dark') return 'deep_winter'
      if (isHighContrast)        return 'clear_winter'
      return 'cool_winter'
  }
}

// ── Main analysis function ────────────────────────────────────────────────────
export function analyzeSkinTone(
  video: HTMLVideoElement,
  allLandmarks: Landmark[],
): SkinAnalysis | null {
  if (!video || allLandmarks.length < 468) return null
  const vw = video.videoWidth, vh = video.videoHeight
  if (vw === 0 || vh === 0) return null

  const tmp = document.createElement('canvas')
  tmp.width = vw; tmp.height = vh
  const ctx = tmp.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0)

  // ── 1. Skin samples ─────────────────────────────────────────────────────────
  const allIdx = [...FOREHEAD_IDX, ...LEFT_CHEEK_IDX, ...RIGHT_CHEEK_IDX, ...NOSE_IDX]
  const skinSamples: { r: number; g: number; b: number }[] = []
  const skinLabs: { L: number; a: number; b: number }[] = []

  for (const idx of allIdx) {
    const lm = allLandmarks[idx]
    if (!lm) continue
    const s = sampleRegion(ctx, lm.x * vw, lm.y * vh, 10, vw, vh)
    if (s) { skinSamples.push(s); skinLabs.push(rgbToLab(s.r, s.g, s.b)) }
  }

  if (skinSamples.length < 5) return null

  // ── 2. Average skin Lab values ──────────────────────────────────────────────
  const avgR  = skinSamples.reduce((s, p) => s + p.r, 0) / skinSamples.length
  const avgG  = skinSamples.reduce((s, p) => s + p.g, 0) / skinSamples.length
  const avgB  = skinSamples.reduce((s, p) => s + p.b, 0) / skinSamples.length
  const lab   = rgbToLab(avgR, avgG, avgB)
  const lVar  = labVariance(skinLabs)

  // ── 3. Lighting level detection & compensation ──────────────────────────────
  // High mean-L* → bright/overexposed; low → dim/underexposed
  const lightingLevel: LightingLevel =
    lab.L > 74 ? 'bright' :
    lab.L < 45 ? 'low'    : 'normal'

  // Offset L* to normalise for analysis (bright env makes skin look lighter)
  const Lnorm = lab.L + (lightingLevel === 'bright' ? -6 : lightingLevel === 'low' ? +6 : 0)

  // ── 4. Skin tone (lightness L*) ─────────────────────────────────────────────
  const tone: SkinTone =
    Lnorm >= 63 ? 'light'  :
    Lnorm >= 50 ? 'medium' :
    'dark'

  // ── 5. Undertone ────────────────────────────────────────────────────────────
  // b* (yellow-blue axis): high = warm/yellow, low = cool/blue
  // a* (red-green axis):  high = warm/pink-red
  const undertone: Undertone =
    lab.b >= 14             ? 'warm'    :
    lab.b <= 7              ? 'cool'    :
    lab.a >= 8 && lab.b > 9 ? 'warm'   :
    'neutral'

  // ── 6. Eye colour approximation ─────────────────────────────────────────────
  // Average left + right iris-region centre then sample a small area
  let eyeTone: EyeTone = 'dark'  // default (most Asian eyes are dark brown)
  const leftCentre  = landmarkCentre(allLandmarks, LEFT_EYE_REGION)
  const rightCentre = landmarkCentre(allLandmarks, RIGHT_EYE_REGION)
  const eyeSamples: { r: number; g: number; b: number }[] = []

  for (const c of [leftCentre, rightCentre]) {
    if (!c) continue
    // Use very tight radius and accept darker pixels (iris is not white)
    const s = sampleRegion(ctx, c.x * vw, c.y * vh, 5, vw, vh, 10, 200)
    if (s) eyeSamples.push(s)
  }

  if (eyeSamples.length > 0) {
    const eyeAvgR = eyeSamples.reduce((s, p) => s + p.r, 0) / eyeSamples.length
    const eyeAvgG = eyeSamples.reduce((s, p) => s + p.g, 0) / eyeSamples.length
    const eyeAvgB = eyeSamples.reduce((s, p) => s + p.b, 0) / eyeSamples.length
    const eyeLab  = rgbToLab(eyeAvgR, eyeAvgG, eyeAvgB)
    eyeTone = eyeLab.L >= 55 ? 'light' : eyeLab.L >= 38 ? 'medium' : 'dark'
  }

  // ── 7. Hair tone approximation ──────────────────────────────────────────────
  // Sample above forehead landmark 10 — shift up by ~8% of video height
  let hairTone: HairTone = 'dark'  // default
  const foreheadTop = allLandmarks[HAIR_FOREHEAD_TOP]
  if (foreheadTop) {
    const hairY  = foreheadTop.y * vh - vh * 0.08  // move above hairline
    const hairCx = foreheadTop.x * vw
    // Wide range to catch hair: exclude very bright (background) and very dark
    const hs = sampleRegion(ctx, hairCx, hairY, 14, vw, vh, 8, 200)
    if (hs) {
      const hairLab = rgbToLab(hs.r, hs.g, hs.b)
      // Only trust sample if L* is plausible hair range (not white background)
      if (hairLab.L < 70) {
        hairTone = hairLab.L >= 55 ? 'light' : hairLab.L >= 35 ? 'medium' : 'dark'
      }
    }
  }

  // ── 8. Personal colour (4 seasons) ──────────────────────────────────────────
  // Warm seasons: Spring (light+warm) / Autumn (medium-dark+warm)
  // Cool seasons: Summer (light+cool) / Winter (dark+cool)
  // Hair/eye tone nudges: dark hair+eyes lean Autumn/Winter; light lean Spring/Summer
  const personalColor: PersonalColor =
    tone === 'light'  && undertone === 'warm'    ? 'spring'  :
    tone === 'light'  && undertone === 'cool'    ? 'summer'  :
    tone === 'light'  && undertone === 'neutral' ?
      (eyeTone === 'light' ? 'summer' : 'spring')              :
    tone === 'medium' && undertone === 'warm'    ? 'autumn'  :
    tone === 'medium' && undertone === 'cool'    ? 'summer'  :
    tone === 'medium' && undertone === 'neutral' ?
      (hairTone === 'light' ? 'summer' : 'autumn')             :
    tone === 'dark'   && undertone === 'warm'    ? 'autumn'  :
    'winter'

  // ── 9. Sub-type (12 types) ───────────────────────────────────────────────────
  const personalColorSub = classifySubType(personalColor, Lnorm, lab.a, lab.b, eyeTone, lVar)

  // ── 10. Lip colour tone (Lemonade chart: Cam / Đỏ / Hồng) ──────────────────
  const lipColorTone: LipColorTone =
    undertone === 'warm' ? 'cam'  :
    undertone === 'cool' ? 'hong' :
    'do'

  return {
    tone, undertone, personalColor, personalColorSub,
    lipColorTone, eyeTone, hairTone, lightingLevel,
    confidence: skinSamples.length / allIdx.length,
    labValues: lab,
  }
}

// ── Lemonade recommendation chart ────────────────────────────────────────────
// Source: "Bảng Màu Đa Dạng" (avatar_son-05) + product research images
export const LEMONADE_RECOMMENDATIONS: Record<SkinTone, Record<LipColorTone, string[]>> = {
  light: {
    cam:  ['01. Pure Sunshine', '16. Left No Crumbs', '14. Me Time', '02. Iconic Coral'],
    do:   ['11. Morning Glow', '04. Baby Rosy', '01. Your Crush', '03. My Own Nude'],
    hong: ['15. Gossiping', '12. Payday', '13. On The Date', '05. No Cap'],
  },
  medium: {
    cam:  ['11. Morning Glow', '02. Iconic Coral', '14. Me Time', '01. Your Crush'],
    do:   ['04. Baby Rosy', '01. Your Crush', '03. My Own Nude', '12. Payday'],
    hong: ['05. No Cap', '15. Gossiping', '12. Payday', '13. On The Date'],
  },
  dark: {
    cam:  ['05. Sepia Amber', '03. Poinsettia Cranberry', '04. Cinnamon Apple'],
    do:   ['02. Rose Dew', '03. Poinsettia Cranberry', '04. Cinnamon Apple'],
    hong: ['04. Cinnamon Apple', '02. Rose Dew', '05. Sepia Amber'],
  },
}

// ── UI labels ─────────────────────────────────────────────────────────────────
export const TONE_LABEL: Record<SkinTone, string>            = { light: 'Da Sáng', medium: 'Da Trung Bình', dark: 'Da Tối' }
export const UNDERTONE_LABEL: Record<Undertone, string>      = { warm: 'Tông Ấm', cool: 'Tông Lạnh', neutral: 'Tông Trung Tính' }
export const SEASON_LABEL: Record<PersonalColor, string>     = { spring: 'Spring 🌸', summer: 'Summer 🌊', autumn: 'Autumn 🍂', winter: 'Winter ❄️' }
export const LIP_TONE_LABEL: Record<LipColorTone, string>    = { cam: 'Tone Cam', do: 'Tone Đỏ', hong: 'Tone Hồng' }
export const EYE_LABEL: Record<EyeTone, string>              = { dark: 'Mắt Tối', medium: 'Mắt Nâu', light: 'Mắt Sáng' }
export const HAIR_LABEL: Record<HairTone, string>            = { dark: 'Tóc Tối', medium: 'Tóc Nâu', light: 'Tóc Sáng' }
export const LIGHTING_LABEL: Record<LightingLevel, string>   = { low: 'Ánh sáng yếu', normal: 'Ánh sáng tốt', bright: 'Ánh sáng mạnh' }
export const SEASON_SUB_LABEL: Record<PersonalColorSub, string> = {
  warm_spring:   'Warm Spring',  light_spring:  'Light Spring',  clear_spring:  'Clear Spring',
  cool_summer:   'Cool Summer',  soft_summer:   'Soft Summer',   light_summer:  'Light Summer',
  soft_autumn:   'Soft Autumn',  deep_autumn:   'Deep Autumn',   warm_autumn:   'Warm Autumn',
  deep_winter:   'Deep Winter',  clear_winter:  'Clear Winter',  cool_winter:   'Cool Winter',
}
