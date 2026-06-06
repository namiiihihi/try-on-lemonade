'use client'

import { useCallback, useState } from 'react'
import type { RefObject } from 'react'
import { logEvent } from '@/lib/analytics'

type CaptureButtonProps = {
  canvasRef:   RefObject<HTMLCanvasElement | null>
  productId:   string | null
  productName?: string | null
  compact?:    boolean
  onPreview:   (dataUrl: string) => void
}

export default function CaptureButton({ canvasRef, productName, compact, onPreview }: CaptureButtonProps) {
  const [toast, setToast] = useState(false)

  const handleCapture = useCallback(() => {
    const src = canvasRef.current
    if (!src) return

    // Copy canvas + add watermark
    const out = document.createElement('canvas')
    out.width  = src.width
    out.height = src.height
    const ctx  = out.getContext('2d')!
    ctx.drawImage(src, 0, 0)

    // Watermark góc dưới phải
    const label = 'Lemonade Try-On'
    const padX = 12, padY = 10, boxH = 28, fontSize = 12
    ctx.font = `bold ${fontSize}px sans-serif`
    const textW = ctx.measureText(label).width
    const boxW  = textW + padX * 2
    const bx    = out.width  - boxW - 10
    const by    = out.height - boxH - 10
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.beginPath()
    ctx.roundRect(bx, by, boxW, boxH, 6)
    ctx.fill()
    ctx.fillStyle = '#C0392B'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, bx + padX, by + boxH / 2)

    const dataUrl = out.toDataURL('image/png')

    logEvent('photo_captured', { shadeName: productName ?? undefined })

    // Download
    const link      = document.createElement('a')
    link.download   = `lemonade-tryon-${(productName ?? 'shade').replace(/\s+/g, '-').toLowerCase()}.png`
    link.href       = dataUrl
    link.click()

    // Preview modal
    onPreview(dataUrl)

    // Toast
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }, [canvasRef, productName, onPreview])

  return (
    <>
      <button
        onClick={handleCapture}
        aria-label="Chụp ảnh kết quả try-on"
        className={
          compact
            ? 'w-9 h-9 rounded-full backdrop-blur-md bg-white/10 border-2 border-white/30 hover:border-lemon-500 hover:bg-lemon-500/20 active:scale-90 transition-all flex items-center justify-center'
            : 'flex items-center gap-2 px-6 py-3 bg-brand-rose text-white border-none rounded-full text-[15px] font-semibold cursor-pointer mt-4 transition-opacity duration-200 hover:opacity-[0.88] active:scale-[0.97]'
        }
      >
        <span>📸</span>
        {!compact && <span>Chụp ảnh</span>}
      </button>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-6 left-1/2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-sm whitespace-nowrap z-50 animate-toast-in">
          Đã lưu ảnh! Kiểm tra thư mục Downloads 🍋
        </div>
      )}
    </>
  )
}
