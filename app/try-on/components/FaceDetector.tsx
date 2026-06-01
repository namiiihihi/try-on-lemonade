'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { initFaceMesh, extractLipLandmarks } from '@/lib/mediapipe'
import type { FaceMeshResult, LipLandmarks, Landmark } from '@/lib/mediapipe'
import { renderLipColor, computeCoverParams, mirrorLandmarks } from '@/lib/lipRenderer'
import type { LipColor } from '@/lib/lipRenderer'
import type { Product } from '@/lib/supabase'
import { analyzeSkinTone } from '@/lib/skinAnalysis'
import type { SkinAnalysis } from '@/lib/skinAnalysis'
import ColorPalette from './ColorPalette'
import ColorRecommendation from './ColorRecommendation'
import CaptureButton from './CaptureButton'
import ShareButton from './ShareButton'
import AddToCartButton from './AddToCartButton'
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
  const resultsCount   = useRef(0)

  const [stage, setStage]             = useState<Stage>('camera')
  const [stageMsg, setStageMsg]       = useState('Đang khởi động camera...')
  const [error, setError]             = useState<string | null>(null)
  const [faceOk, setFaceOk]           = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [skinAnalysis, setSkinAnalysis] = useState<SkinAnalysis | null>(null)
  const [allShades, setAllShades]     = useState<Product[]>([])
  const [debug, setDebug]             = useState({ results: 0, face: false, errMsg: '' })
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
    resultsCount.current += 1
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
    setDebug({ results: resultsCount.current, face: detected, errMsg: '' })
  }, [])

  const handleColorSelect = useCallback((c: LipColor) => { colorRef.current = c }, [])

  const handleProductSelect = useCallback((p: Product) => {
    setSelectedProduct(p)
    setSelectedId(p.id)
  }, [])

  // Skin tone analysis — runs every 3 s when face is detected
  useEffect(() => {
    if (!faceOk) return
    const run = () => {
      const video = videoRef.current
      if (!video || allLandmarks.current.length < 468) return
      const result = analyzeSkinTone(video, allLandmarks.current)
      if (result && result.confidence > 0.3) setSkinAnalysis(result)
    }
    run() // immediate first run
    const id = setInterval(run, 3000)
    return () => clearInterval(id)
  }, [faceOk])

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

              // Draw mirrored video
              ctx.save()
              ctx.translate(w, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(video, params.offsetX, params.offsetY, params.drawW, params.drawH)
              ctx.restore()

              // Lip overlay
              const lm  = landRef.current
              const col = colorRef.current
              if (lm && col) {
                renderLipColor(ctx, mirrorLandmarks(lm, w, h, params), col, w, h)
              }

              // FaceMesh — one frame at a time
              if (!sendingRef.current) {
                sendingRef.current = true
                mesh.send({ image: video }).catch((e: unknown) => {
                  sendingRef.current = false
                  setDebug(d => ({ ...d, errMsg: e instanceof Error ? e.message : String(e) }))
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

  return (
    <div className="fixed inset-0 bg-slate-950 select-none overflow-hidden">

      <video ref={videoRef} muted playsInline className="absolute w-px h-px -left-px opacity-0 pointer-events-none" />
      <canvas ref={canvasRef} width={vpSize.w} height={vpSize.h} className="absolute inset-0 touch-none" />

      {/* ── Loading ───────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-950 to-slate-950 z-20 gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-sky-800/40" />
            <div className="absolute inset-0 rounded-full border-4 border-lemon-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white/80 text-sm font-semibold">{stageMsg}</p>
            {stage === 'model' && <p className="text-sky-400/60 text-xs mt-1">Lần đầu tải ~8MB · Lần sau sẽ được cache</p>}
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {stage === 'error' && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-950 to-slate-950 z-20 p-8">
          <div className="brand-card text-center max-w-sm">
            <p className="text-red-400 font-semibold mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* ── Debug panel ───────────────────────────────────────────────── */}
      {stage === 'ready' && (
        <div className="absolute top-16 left-4 z-20 backdrop-blur-md bg-sky-950/70 rounded-xl px-3 py-2 text-[10px] font-mono space-y-0.5 pointer-events-none border border-sky-800/30">
          <p className={debug.results > 0 ? 'text-sky-400' : 'text-red-400'}>onResults: {debug.results}x</p>
          <p className={debug.face ? 'text-sky-400' : 'text-lemon-400'}>Face: {debug.face ? '✓ detected' : '✗ not found'}</p>
          {skinAnalysis && (
            <p className="text-sky-300">
              L:{Math.round(skinAnalysis.labValues.L)} a:{Math.round(skinAnalysis.labValues.a)} b:{Math.round(skinAnalysis.labValues.b)}
            </p>
          )}
          {debug.errMsg && <p className="text-red-400 max-w-[180px] truncate">⚠ {debug.errMsg}</p>}
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      {!isLoading && stage !== 'error' && (
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
          <Link href="/" className="flex items-center gap-2 backdrop-blur-md bg-sky-950/50 border border-sky-700/30 rounded-full px-3 py-1.5 hover:bg-sky-900/60 transition-colors">
            <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <Image src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346" alt="LEMONADE"
              width={72} height={22} className="h-5 w-auto brightness-0 invert" unoptimized />
          </Link>

          <div className={`flex items-center gap-1.5 backdrop-blur-md border rounded-full px-3 py-1.5 transition-all ${faceOk ? 'bg-sky-500/20 border-sky-400/40 text-sky-300' : 'bg-sky-950/50 border-sky-700/30 text-white/40'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${faceOk ? 'bg-sky-400 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              {faceOk ? 'Nhận diện được' : 'Chờ khuôn mặt...'}
            </span>
          </div>
        </header>
      )}

      {/* ── Guide khi chưa detect ─────────────────────────────────────── */}
      {stage === 'ready' && !faceOk && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-10 pointer-events-none">
          <div className="backdrop-blur-md bg-sky-950/60 border border-sky-700/30 rounded-2xl px-6 py-3 text-center">
            <p className="text-white/80 text-sm font-medium">Đưa khuôn mặt vào giữa màn hình</p>
            <p className="text-sky-400/70 text-xs mt-1">Cần ánh sáng đủ · Nhìn thẳng camera</p>
          </div>
        </div>
      )}

      {/* ── Bottom panel — tất cả controls ────────────────────────────── */}
      {stage === 'ready' && (
        <div className="absolute bottom-0 left-0 right-0 z-10 backdrop-blur-xl bg-sky-950/85 border-t border-sky-700/40">
          <div className="max-w-xl mx-auto px-4 pt-3 pb-5 flex flex-col gap-2.5">

            {/* Row 1: Tên màu + nút capture/share */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {selectedProduct ? (
                  <>
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white/30 shadow-sm"
                      style={{ backgroundColor: selectedProduct.hex }}
                    />
                    <span className="text-white text-sm font-bold truncate">
                      {selectedProduct.name}
                    </span>
                    <span className="text-white/40 text-xs flex-shrink-0">· 169.000đ</span>
                  </>
                ) : (
                  <span className="text-white/30 text-sm italic">Chọn màu để thử →</span>
                )}
              </div>

              {/* Capture + share compact */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
            </div>

            {/* Row 2: Palette 1 hàng scroll ngang */}
            <ColorPalette
              onColorSelect={handleColorSelect}
              onProductSelect={handleProductSelect}
              onShadesLoaded={setAllShades}
              selectedId={selectedId}
            />

            {/* Row 3: Skin recommendation (collapsed by default) */}
            {skinAnalysis && allShades.length > 0 && (
              <ColorRecommendation
                analysis={skinAnalysis}
                allShades={allShades}
                onColorSelect={handleColorSelect}
                onProductSelect={handleProductSelect}
                selectedId={selectedId}
              />
            )}

            {/* Add to cart */}
            <AddToCartButton product={selectedProduct} />
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
