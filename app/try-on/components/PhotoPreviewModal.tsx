'use client'

import { useEffect, useCallback } from 'react'
import { trackEvent, getOrCreateSessionId } from '@/lib/analytics'

type PhotoPreviewModalProps = {
  dataUrl:     string
  productName: string
  productId:   string | null
  onClose:     () => void
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

async function shareDataUrl(dataUrl: string, productName: string): Promise<boolean> {
  try {
    const res  = await fetch(dataUrl)
    const blob = await res.blob()
    const filename = `lemonade-tryon-${Date.now()}.png`
    const file = new File([blob], filename, { type: 'image/png' })

    const canShare =
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })

    if (canShare) {
      await navigator.share({
        title: `Lemonade — ${productName}`,
        text:  `Mình vừa thử màu ${productName} trên Lemonade Cosmetics! Bạn thử chưa? 💄`,
        files: [file],
      })
      return true
    }
    return false
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return true
    return false
  }
}

export default function PhotoPreviewModal({ dataUrl, productName, productId, onClose }: PhotoPreviewModalProps) {
  const filename = `lemonade-tryon-${Date.now()}.png`

  // Đóng bằng Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = useCallback(() => {
    downloadDataUrl(dataUrl, filename)
    if (productId) {
      void trackEvent({ session_id: getOrCreateSessionId(), product_id: productId, event_type: 'photo_captured' })
    }
    onClose()
  }, [dataUrl, filename, productId, onClose])

  const handleShare = useCallback(async () => {
    const shared = await shareDataUrl(dataUrl, productName)
    if (!shared) {
      // fallback: download nếu Share API không có
      downloadDataUrl(dataUrl, filename)
    }
    if (productId) {
      void trackEvent({ session_id: getOrCreateSessionId(), product_id: productId, event_type: 'share' })
    }
    onClose()
  }, [dataUrl, productName, productId, filename, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
        aria-label="Đóng"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Preview image */}
      <div className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 animate-slide-up">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Ảnh thử son" className="w-full h-auto block" />

        {/* Label overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-slate-950/80 to-transparent">
          <p className="text-white text-xs font-semibold tracking-wide">Lemonade · {productName || 'Mirror Mirror Water Tint'}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-5 w-full max-w-sm mx-4">
        {/* Lưu ảnh */}
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-lemon-500 text-brand-black font-bold py-3 rounded-full text-sm uppercase tracking-wide hover:bg-lemon-600 active:scale-95 transition-all shadow-lemon-glow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Lưu ảnh
        </button>

        {/* Chia sẻ */}
        <button
          onClick={() => void handleShare()}
          className="flex-1 flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-400/50 text-sky-300 font-bold py-3 rounded-full text-sm uppercase tracking-wide hover:bg-sky-500/30 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Chia sẻ
        </button>
      </div>

      <p className="text-white/25 text-xs mt-3">Nhấn ngoài ảnh hoặc Esc để đóng</p>
    </div>
  )
}
