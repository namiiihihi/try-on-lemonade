'use client'

import { useCallback } from 'react'
import type { RefObject } from 'react'
import { trackEvent, getOrCreateSessionId } from '@/lib/analytics'

type ShareButtonProps = {
  canvasRef:   RefObject<HTMLCanvasElement | null>
  productName: string
  productId:   string | null
  compact?:    boolean
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

function downloadBlob(blob: Blob, filename: string): void {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href     = url
  link.click()
  URL.revokeObjectURL(url)
}

export default function ShareButton({ canvasRef, productName, productId, compact }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await canvasToBlob(canvas)
    if (!blob) return

    const filename = `lemonade-tryon-${Date.now()}.png`
    const file     = new File([blob], filename, { type: 'image/png' })

    const canShare =
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })

    if (canShare) {
      try {
        await navigator.share({
          title: `Lemonade — ${productName}`,
          text:  `Mình vừa thử màu ${productName} trên Lemonade Cosmetics! Bạn thử chưa? 💄`,
          files: [file],
        })
        if (productId) {
          void trackEvent({
            session_id: getOrCreateSessionId(),
            product_id: productId,
            event_type: 'share',
          })
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          downloadBlob(blob, filename)
        }
      }
    } else {
      downloadBlob(blob, filename)
    }
  }, [canvasRef, productName, productId])

  return (
    <button
      onClick={() => void handleShare()}
      title="Chia sẻ"
      aria-label="Chia sẻ"
      className={`rounded-full backdrop-blur-md bg-white/10 border-2 border-white/30 hover:border-lemon-500 hover:bg-lemon-500/20 active:scale-90 transition-all flex items-center justify-center ${compact ? 'w-9 h-9' : 'w-14 h-14'}`}
    >
      {/* Share icon */}
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    </button>
  )
}
