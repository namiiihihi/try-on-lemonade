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

// Smooth bezier path through points (midpoint technique — no closePath)
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

export function renderLipColor(
  ctx: CanvasRenderingContext2D,
  lm: LipLandmarks,
  color: LipColor,
  W: number,
  H: number,
): void {
  const px = (p: Landmark) => ({ x: p.x * W, y: p.y * H })

  // Outer boundary: upper (left→right) + lower reversed (right→left)
  const ouUpper = lm.outerUpper.map(px)
  const ouLower = [...lm.outerLower].reverse().map(px)

  // Inner boundary (mouth opening): upper (left→right) + lower reversed
  const inUpper = lm.innerUpper.map(px)
  const inLower = [...lm.innerLower].reverse().map(px)

  ctx.save()

  // ── Build compound path with evenodd fill ──────────────────────────────────
  // Subpath 1: outer lip contour
  ctx.beginPath()
  drawSmoothLine(ctx, ouUpper)
  drawSmoothLine(ctx, ouLower)
  ctx.closePath()

  // Subpath 2: inner mouth opening (same beginPath — this is a NEW subpath within same path)
  ctx.moveTo(inUpper[0]?.x ?? 0, inUpper[0]?.y ?? 0)
  drawSmoothLine(ctx, inUpper)
  drawSmoothLine(ctx, inLower)
  ctx.closePath()
  // evenodd: outer is filled, inner (mouth opening) is subtracted → only lip surface colored

  // ── MLBB-style base layer: multiply for skin-tone blending ─────────────────
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = color.opacity * 0.85
  ctx.fillStyle = color.hex
  ctx.fill('evenodd')

  // ── Saturation punch layer ─────────────────────────────────────────────────
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = color.opacity * 0.28
  ctx.fillStyle = color.hex
  ctx.fill('evenodd')

  // ── Glossy highlight: separate upper-lip arch + lower-lip centre ──────────
  if (color.finish === 'glossy' || color.finish === 'satin') {
    const gloss   = color.finish === 'glossy' ? 0.26 : 0.12
    const lipTop  = Math.min(...ouUpper.map(p => p.y))
    const lipBot  = Math.max(...ouLower.map(p => p.y))
    const lipH    = lipBot - lipTop
    const lipLeft = Math.min(...[...ouUpper, ...ouLower].map(p => p.x))
    const lipRight= Math.max(...[...ouUpper, ...ouLower].map(p => p.x))
    const cx      = (lipLeft + lipRight) / 2

    // Upper lip: thin highlight along the Cupid's bow arch
    const upperCy  = lipTop + lipH * 0.22
    const gUpper   = ctx.createRadialGradient(cx, upperCy, 0, cx, upperCy, lipH * 0.55)
    gUpper.addColorStop(0,    `rgba(255,255,255,${gloss * 0.9})`)
    gUpper.addColorStop(0.35, `rgba(255,255,255,${gloss * 0.3})`)
    gUpper.addColorStop(1,    'rgba(255,255,255,0.00)')

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle = gUpper
    ctx.fill('evenodd')

    // Lower lip: broader centre highlight (fullest part of lower lip)
    const lowerCy  = lipTop + lipH * 0.72
    const gLower   = ctx.createRadialGradient(cx, lowerCy, 0, cx, lowerCy, lipH * 0.65)
    gLower.addColorStop(0,   `rgba(255,255,255,${gloss})`)
    gLower.addColorStop(0.4, `rgba(255,255,255,${gloss * 0.25})`)
    gLower.addColorStop(1,   'rgba(255,255,255,0.00)')

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.fillStyle = gLower
    ctx.fill('evenodd')
  }

  ctx.restore()
}

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h)
}
