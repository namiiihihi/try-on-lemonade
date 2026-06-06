import type { LipLandmarks, Landmark } from './mediapipe'

export type LipColor = {
  hex: string
  opacity: number
  finish: 'glossy' | 'matte' | 'satin'
}

export type CoverParams = {
  drawW: number; drawH: number; offsetX: number; offsetY: number
}

export function computeCoverParams(cW: number, cH: number, vW: number, vH: number): CoverParams {
  const vAR = vW / vH, cAR = cW / cH
  if (vAR > cAR) {
    const drawH = cH, drawW = cH * vAR
    return { drawW, drawH, offsetX: -(drawW - cW) / 2, offsetY: 0 }
  } else {
    const drawW = cW, drawH = cW / vAR
    return { drawW, drawH, offsetX: 0, offsetY: -(drawH - cH) / 2 }
  }
}

export function mirrorLandmarks(lm: LipLandmarks, cW: number, cH: number, p: CoverParams): LipLandmarks {
  const t = (pt: Landmark): Landmark => ({
    x: (cW - (pt.x * p.drawW + p.offsetX)) / cW,
    y: (pt.y * p.drawH + p.offsetY) / cH,
    z: pt.z,
  })
  return {
    outerUpper: lm.outerUpper.map(t),
    outerLower: lm.outerLower.map(t),
    innerUpper: lm.innerUpper.map(t),
    innerLower: lm.innerLower.map(t),
  }
}

function drawSmoothLine(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length === 0) return
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildLipClip(
  ctx: CanvasRenderingContext2D,
  ouUpper: { x: number; y: number }[],
  ouLower: { x: number; y: number }[],
  inUpper: { x: number; y: number }[],
  inLower: { x: number; y: number }[],
) {
  ctx.beginPath()
  drawSmoothLine(ctx, ouUpper)
  drawSmoothLine(ctx, ouLower)
  ctx.closePath()
  ctx.moveTo(inUpper[0]?.x ?? 0, inUpper[0]?.y ?? 0)
  drawSmoothLine(ctx, inUpper)
  drawSmoothLine(ctx, inLower)
  ctx.closePath()
}

export function renderLipColor(
  ctx: CanvasRenderingContext2D,
  lm: LipLandmarks,
  color: LipColor,
  W: number,
  H: number,
): void {
  const px = (p: Landmark) => ({ x: p.x * W, y: p.y * H })

  const ouUpper = lm.outerUpper.map(px)
  const ouLower = [...lm.outerLower].reverse().map(px)
  const inUpper = lm.innerUpper.map(px)
  const inLower = [...lm.innerLower].reverse().map(px)

  const allPts   = [...ouUpper, ...ouLower]
  const lipLeft  = Math.min(...allPts.map(p => p.x))
  const lipRight = Math.max(...allPts.map(p => p.x))
  const lipTop   = Math.min(...allPts.map(p => p.y))
  const lipBot   = Math.max(...allPts.map(p => p.y))
  const lipW     = lipRight - lipLeft
  const lipH     = lipBot   - lipTop
  const cx       = (lipLeft + lipRight) / 2
  const cy       = (lipTop  + lipBot)   / 2
  const pad      = 8

  const [r, g, b] = hexToRgb(color.hex)

  // Dark colors render lighter & sheerer — luminance-based scale
  // Very dark reds/cranberries (luminance ~0.1-0.3) scale down to 0.68x opacity
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const lightness  = Math.min(1, luminance / 0.45)
  const sheerness  = 0.68 + lightness * 0.32
  const eff        = color.opacity * sheerness

  ctx.save()

  // Clip to lip shape (outer contour minus mouth opening via evenodd)
  buildLipClip(ctx, ouUpper, ouLower, inUpper, inLower)
  ctx.clip('evenodd')

  // ── Layer 1: Soft multiply base — skin-tone blending ──────────────────
  ctx.filter = 'blur(2.5px)'
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = eff * 0.50
  ctx.fillStyle = color.hex
  ctx.fillRect(lipLeft - pad, lipTop - pad, lipW + pad * 2, lipH + pad * 2)

  // ── Layer 2: Ombre radial gradient — water-tint stain effect ──────────
  // More even spread than before = more "bám môi", less centre-heavy
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1

  const ombreCy = cy + lipH * 0.08
  const ombreR  = Math.max(lipW * 0.52, lipH * 0.62)

  const ombre = ctx.createRadialGradient(cx, ombreCy, 0, cx, ombreCy, ombreR)
  ombre.addColorStop(0,    `rgba(${r},${g},${b},${(eff * 0.78).toFixed(3)})`)
  ombre.addColorStop(0.42, `rgba(${r},${g},${b},${(eff * 0.56).toFixed(3)})`)
  ombre.addColorStop(0.75, `rgba(${r},${g},${b},${(eff * 0.26).toFixed(3)})`)
  ombre.addColorStop(1,    `rgba(${r},${g},${b},0)`)

  ctx.fillStyle = ombre
  ctx.fillRect(lipLeft - pad, lipTop - pad, lipW + pad * 2, lipH + pad * 2)

  // ── Layer 3: Minimal gloss — just a faint centre sheen ─────────────────
  ctx.filter = 'none'
  if (color.finish === 'glossy' || color.finish === 'satin') {
    const gloss = color.finish === 'glossy' ? 0.07 : 0.04
    const loCy  = lipTop + lipH * 0.68
    const gLow  = ctx.createRadialGradient(cx, loCy, 0, cx, loCy, lipH * 0.40)
    gLow.addColorStop(0, `rgba(255,255,255,${gloss})`)
    gLow.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle = gLow
    ctx.fillRect(lipLeft - pad, lipTop - pad, lipW + pad * 2, lipH + pad * 2)
  }

  ctx.restore()
}

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h)
}
