'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { initFaceMesh, extractLipLandmarks } from '@/lib/mediapipe'
import type { FaceMeshResult, LipLandmarks, Landmark } from '@/lib/mediapipe'
import { renderLipColor, computeCoverParams, mirrorLandmarks } from '@/lib/lipRenderer'
import type { LipColor } from '@/lib/lipRenderer'
import type { Product } from '@/lib/supabase'

import ColorPalette from './ColorPalette'
import CaptureButton from './CaptureButton'
import ShareButton from './ShareButton'
import UploadFallback from './UploadFallback'
import PhotoPreviewModal from './PhotoPreviewModal'

const CAMERA_ERR_KEYS = ['camera', 'permission', 'denied', 'notallowed', 'notfound']
type Stage = 'camera' | 'model' | 'ready' | 'error'

export default function FaceDetector() {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Hot-path refs
  const landRef        = useRef<LipLandmarks | null>(null)
  const colorRef       = useRef<LipColor | null>(null)
  const allLandmarks   = useRef<Landmark[]>([])       // full 468 landmarks for skin analysis
  const sendingRef     = useRef(false)

  const [stage, setStage]             = useState<Stage>('camera')
  const [stageMsg, setStageMsg]       = useState('Đang khởi động camera...')
  const [error, setError]             = useState<string | null>(null)
  const [faceOk, setFaceOk]           = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [allShades, setAllShades]     = useState<Product[]>([])
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null)

  const [vpSize, setVpSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth  : 640,
    h: typeof window !== 'undefined' ? window.innerHeight : 480,
  }))

  useEffect(() => {
    const onResize = () => setVpSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // FaceMesh results — store full landmark array for skin analysis
  const handleResults = useCallback((results: FaceMeshResult) => {
    sendingRef.current = false

    const face = results.multiFaceLandmarks?.[0]
    const detected = Array.isArray(face) && face.length > 0

    if (detected) {
      allLandmarks.current = face!
      landRef.current = extractLipLandmarks(face!)
    } else {
      landRef.current = null
    }

    setStage(s => s === 'model' ? 'ready' : s)
    setFaceOk(detected)
  }, [])

  const handleColorSelect = useCallback((c: LipColor) => { colorRef.current = c }, [])

  const handleProductSelect = useCallback((p: Product) => {
    setSelectedProduct(p)
    setSelectedId(p.id)
  }, [])

  // Camera + FaceMesh + render loop
  useEffect(() => {
    let raf: number
    let running = true

    async function start() {
      try {
        setStage('camera')
        setStageMsg('Đang khởi động camera...')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })
        if (!videoRef.current || !running) { stream.getTracks().forEach(t => t.stop()); return }
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        setStage('model')
        setStageMsg('Đang tải mô hình AI (~8 MB)...')

        const mesh = await initFaceMesh(handleResults)

        const tick = () => {
          if (!running) return
          const video  = videoRef.current
          const canvas = canvasRef.current

          if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              const { width: w, height: h } = canvas
              const params = computeCoverParams(w, h, video.videoWidth, video.videoHeight)

              // Draw mirrored video with skin brightening
              ctx.filter = 'brightness(1.07) saturate(0.88) contrast(0.95)'
              ctx.save()
              ctx.translate(w, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(video, params.offsetX, params.offsetY, params.drawW, params.drawH)
              ctx.restore()
              ctx.filter = 'none'

              // Lip overlay
              const lm  = landRef.current
              const col = colorRef.current
              if (lm && col) {
                renderLipColor(ctx, mirrorLandmarks(lm, w, h, params), col, w, h)
              }

              // FaceMesh — one frame at a time
              if (!sendingRef.current) {
                sendingRef.current = true
                mesh.send({ image: video }).catch(() => {
                  sendingRef.current = false
                })
              }
            }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

      } catch (err) {
        if (!running) return
        setError(err instanceof Error ? err.message : 'Lỗi không xác định')
        setStage('error')
      }
    }

    start()
    return () => {
      running = false
      cancelAnimationFrame(raf)
      const v = videoRef.current
      if (v?.srcObject) (v.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [handleResults])

  if (stage === 'error' && error && CAMERA_ERR_KEYS.some(k => error.toLowerCase().includes(k))) {
    return <UploadFallback />
  }

  const isLoading = stage === 'camera' || stage === 'model'

  const storeUrl = selectedProduct?.store_url ?? 'https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3'

  return (
    <div className="fixed inset-0 bg-black select-none overflow-hidden">

      <video ref={videoRef} muted playsInline className="absolute w-px h-px -left-px opacity-0 pointer-events-none" />
      <canvas ref={canvasRef} width={vpSize.w} height={vpSize.h} className="absolute inset-0 touch-none" />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-lemon-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white/70 text-sm font-medium">{stageMsg}</p>
            {stage === 'model' && <p className="text-white/30 text-xs mt-1">Lần đầu tải ~8MB · Lần sau sẽ được cache</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20 p-8">
          <div className="brand-card text-center max-w-sm">
            <p className="text-red-400 font-semibold mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      {!isLoading && stage !== 'error' && (
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-10">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <Image src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346" alt="LEMONADE"
              width={72} height={22} className="h-5 w-auto brightness-0 invert drop-shadow" unoptimized />
          </Link>

          <div className="flex items-center gap-2">
            <CaptureButton
              canvasRef={canvasRef}
              productId={selectedProduct?.id ?? null}
              compact
              onPreview={setPreviewUrl}
            />
            <ShareButton
              canvasRef={canvasRef}
              productName={selectedProduct?.name ?? 'Lemonade'}
              productId={selectedProduct?.id ?? null}
              compact
              onPreview={setPreviewUrl}
            />
          </div>
        </header>
      )}

      {/* Guide khi chưa detect */}
      {stage === 'ready' && !faceOk && (
        <div className="absolute inset-x-0 top-[38%] flex justify-center z-10 pointer-events-none">
          <div className="bg-black/35 backdrop-blur-sm rounded-2xl px-5 py-2.5 text-center">
            <p className="text-white/80 text-sm">Đưa khuôn mặt vào giữa màn hình</p>
            <p className="text-white/40 text-xs mt-0.5">Cần ánh sáng đủ · Nhìn thẳng camera</p>
          </div>
        </div>
      )}

      {/* Floating color swatches — above white card */}
      {stage === 'ready' && (
        <div className="absolute left-0 right-0 z-10 flex flex-col items-center gap-1.5" style={{ bottom: '122px' }}>
          <p className="text-white/50 text-[10px] tracking-[0.25em] uppercase drop-shadow">
            {allShades.length} tông màu
          </p>
          <ColorPalette
            onColorSelect={handleColorSelect}
            onProductSelect={handleProductSelect}
            onShadesLoaded={setAllShades}
            selectedId={selectedId}
          />
        </div>
      )}

      {/* White product card */}
      {stage === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
          <div className="max-w-xl mx-auto px-5 pt-3 pb-5">
            {selectedProduct ? (
              <>
                <p className="text-[9px] text-lemon-500 tracking-[0.35em] uppercase font-semibold mb-1.5">
                  Mirror Mirror Water Tint
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-black font-bold text-sm tracking-widest uppercase leading-tight min-w-0 truncate">
                    {selectedProduct.name.replace(/^\d+\.\s*/, '')}
                    <span className="text-black/40 font-normal normal-case tracking-normal">
                      {' '}· {selectedProduct.price.toLocaleString('vi-VN')}đ
                    </span>
                  </p>
                  <button
                    onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')}
                    className="flex items-center gap-1 bg-lemon-500 text-black text-[10px] font-bold px-4 py-2 rounded-full tracking-[0.15em] uppercase flex-shrink-0 active:scale-95 transition-transform"
                  >
                    Xem thêm
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')}
                  className="mt-1.5 text-black/30 text-[11px] hover:text-black/50 transition-colors"
                >
                  Xem thêm chi tiết ↓
                </button>
              </>
            ) : (
              <div className="text-center py-0.5">
                <p className="text-[9px] text-lemon-500 tracking-[0.35em] uppercase font-semibold mb-1">
                  Mirror Mirror Water Tint
                </p>
                <p className="text-black/40 text-sm">Chọn màu để thử →</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo preview modal */}
      {previewUrl && (
        <PhotoPreviewModal
          dataUrl={previewUrl}
          productName={selectedProduct?.name ?? 'Mirror Mirror Water Tint'}
          productId={selectedProduct?.id ?? null}
          onClose={() => setPreviewUrl(null)}
        />
      )}

    </div>
  )
}
