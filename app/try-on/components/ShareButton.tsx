'use client'

import { useCallback } from 'react'
import type { RefObject } from 'react'

type ShareButtonProps = {
  canvasRef:   RefObject<HTMLCanvasElement | null>
  productName: string
  productId:   string | null
  compact?:    boolean
  onPreview:   (dataUrl: string) => void
}

export default function ShareButton({ canvasRef, compact, onPreview }: ShareButtonProps) {
  const handleClick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onPreview(canvas.toDataURL('image/png'))
  }, [canvasRef, onPreview])

  return (
    <button
      onClick={handleClick}
      title="Chia sẻ"
      aria-label="Chia sẻ"
      className={`rounded-full backdrop-blur-md bg-white/10 border-2 border-white/30 hover:border-sky-400 hover:bg-sky-400/20 active:scale-90 transition-all flex items-center justify-center ${compact ? 'w-9 h-9' : 'w-14 h-14'}`}
    >
      <svg className={`text-white ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    </button>
  )
}
