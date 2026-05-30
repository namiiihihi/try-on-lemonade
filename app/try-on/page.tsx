import dynamic from 'next/dynamic'

// FaceDetector uses camera + canvas APIs — client-side only
const FaceDetector = dynamic(() => import('./components/FaceDetector'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-brand-black gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-lemon-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-white/30 text-[11px] tracking-[0.4em] uppercase font-semibold">
        Khởi động camera
      </p>
    </div>
  ),
})

export default function TryOnPage() {
  return <FaceDetector />
}
