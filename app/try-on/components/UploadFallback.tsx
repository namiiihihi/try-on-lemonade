'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import type { LipColor } from '@/lib/lipRenderer'
import type { Product } from '@/lib/supabase'
import { clearCanvas } from '@/lib/lipRenderer'
import ColorPalette from './ColorPalette'
import AddToCartButton from './AddToCartButton'

export default function UploadFallback() {
  const imageCanvasRef   = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

  const [dimensions,       setDimensions]       = useState<{ width: number; height: number } | null>(null)
  const [selectedColor,    setSelectedColor]     = useState<LipColor | null>(null)
  const [selectedProduct,  setSelectedProduct]   = useState<Product | null>(null)
  const [hasImage,         setHasImage]          = useState(false)

  useEffect(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas || !dimensions) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    clearCanvas(ctx, dimensions.width, dimensions.height)

    if (selectedColor && hasImage) {
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, dimensions.height - 52, dimensions.width, 52)
      ctx.font        = 'bold 13px sans-serif'
      ctx.textAlign   = 'center'
      ctx.fillStyle   = selectedColor.hex
      ctx.fillText('FaceMesh không khả dụng — dùng camera để thử màu thực tế', dimensions.width / 2, dimensions.height - 18)
      ctx.restore()
    }
  }, [selectedColor, dimensions, hasImage])

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img       = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX = 640
      const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1)
      const w = Math.round(img.naturalWidth  * scale)
      const h = Math.round(img.naturalHeight * scale)

      setDimensions({ width: w, height: h })
      setHasImage(true)

      requestAnimationFrame(() => {
        const ctx = imageCanvasRef.current?.getContext('2d')
        if (ctx) ctx.drawImage(img, 0, 0, w, h)
      })
    }
    img.src = objectUrl
  }, [])

  return (
    <div className="fixed inset-0 bg-brand-black flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <NextImage
            src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346"
            alt="LEMONADE" width={72} height={22}
            className="h-5 w-auto brightness-0 invert"
            unoptimized
          />
        </Link>
        <span className="text-white/30 text-xs tracking-widest">Upload mode</span>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center py-6 px-4 gap-5">

        <p className="text-white/50 text-sm text-center max-w-sm">
          Camera không khả dụng. Tải ảnh lên để xem màu son.
        </p>

        {/* Upload button */}
        <label className="cursor-pointer btn-lemon">
          📷 Chọn ảnh từ thiết bị
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>

        {/* Image preview */}
        {dimensions ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ width: dimensions.width, height: dimensions.height }}>
            <canvas ref={imageCanvasRef}   width={dimensions.width} height={dimensions.height} className="block" />
            <canvas ref={overlayCanvasRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0 pointer-events-none" />
          </div>
        ) : (
          <div className="w-72 h-56 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm-3 7.5h9.75a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-white/20 text-xs">Ảnh sẽ hiển thị ở đây</span>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="flex-shrink-0 backdrop-blur-xl bg-black/65 border-t border-white/10 px-4 pt-3 pb-6">
        <ColorPalette onColorSelect={setSelectedColor} onProductSelect={setSelectedProduct} />
        <div className="mt-3">
          <AddToCartButton product={selectedProduct} />
        </div>
      </div>

    </div>
  )
}
