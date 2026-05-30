'use client'

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { renderLipColor, clearCanvas } from '@/lib/lipRenderer'
import type { LipColor } from '@/lib/lipRenderer'
import type { LipLandmarks } from '@/lib/mediapipe'

type ARCanvasProps = {
  landmarks: LipLandmarks | null
  color: LipColor | null
  width: number
  height: number
}

export type ARCanvasHandle = {
  captureFrame: () => string | null
}

const ARCanvas = forwardRef<ARCanvasHandle, ARCanvasProps>(
  ({ landmarks, color, width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useImperativeHandle(ref, () => ({
      captureFrame: () => canvasRef.current?.toDataURL('image/png') ?? null,
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      clearCanvas(ctx, width, height)
      if (landmarks && color) {
        renderLipColor(ctx, landmarks, color, width, height)
      }
    }, [landmarks, color, width, height])

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
    )
  }
)

ARCanvas.displayName = 'ARCanvas'

export default ARCanvas
