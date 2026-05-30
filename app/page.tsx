import Image from 'next/image'
import Link from 'next/link'

// Màu chính thức từ lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3
const SHADES = [
  { name: '01. Pure Sunshine',        hex: '#CC7D62' },
  { name: '02. Rose Dew',             hex: '#B82040' },
  { name: '03. Poinsettia Cranberry', hex: '#8E1A28' },
  { name: '04. Cinnamon Apple',       hex: '#9E3028' },
  { name: '05. Sepia Amber',          hex: '#B85F2A' },
  { name: '01. Your Crush',           hex: '#CC2850' },
  { name: '02. Iconic Coral',         hex: '#C85035' },
  { name: '03. My Own Nude',          hex: '#C07858' },
  { name: '04. Baby Rosy',            hex: '#E88A78' },
  { name: '05. No Cap',               hex: '#CC6078' },
  { name: '11. Morning Glow',         hex: '#E07A68' },
  { name: '12. Payday',               hex: '#D07058' },
  { name: '13. On The Date',          hex: '#E88A78' },
  { name: '14. Me Time',              hex: '#C87060' },
  { name: '15. Gossiping',            hex: '#F0A0B5' },
  { name: '16. Left No Crumbs',       hex: '#D87268' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-white">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-brand-black border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo từ Lemonade CDN */}
          <Link href="/" aria-label="Lemonade homepage">
            <Image
              src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346"
              alt="LEMONADE"
              width={120}
              height={36}
              className="h-8 w-auto object-contain brightness-0 invert"
              unoptimized
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs text-white/70 uppercase tracking-widest font-semibold">
            <Link href="/"        className="hover:text-lemon-500 transition-colors">Sản phẩm</Link>
            <Link href="/try-on"  className="hover:text-lemon-500 transition-colors">Try-On</Link>
            <Link href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3" target="_blank" className="hover:text-lemon-500 transition-colors">Mua ngay</Link>
          </nav>
          <Link href="/try-on" className="btn-lemon text-xs py-2 px-5">
            Thử màu
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-brand-black text-white overflow-hidden">
        {/* Yellow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-lemon-gradient" />

        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 animate-slide-up">
            <span className="inline-block bg-lemon-500 text-brand-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              AI Try-On
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Mirror Mirror<br />
              <span className="text-lemon-500">Water Tint</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md mb-8 leading-relaxed">
              12 màu son glossy — thử ngay trên môi bạn bằng AI, không cần đến cửa hàng.
              169.000₫ / thỏi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/try-on" className="btn-lemon">
                Thử màu miễn phí
              </Link>
              <Link href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3" target="_blank" className="btn-ghost border-white/30 text-white hover:bg-white hover:text-brand-black">
                Mua ngay
              </Link>
            </div>
          </div>

          {/* Shade swatches */}
          <div className="flex-shrink-0 animate-fade-in">
            <div className="grid grid-cols-4 gap-3">
              {SHADES.map((s) => (
                <div
                  key={s.name}
                  title={s.name}
                  className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform cursor-default animate-pulse-glow"
                  style={{ backgroundColor: s.hex }}
                />
              ))}
            </div>
            <p className="text-white/40 text-xs text-center mt-3 tracking-wider">12 SHADES</p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-2">Cách dùng</h2>
          <p className="text-gray-500 mb-12">3 bước — 3 giây — biết màu nào hợp mình</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📷', title: 'Bật camera', desc: 'Cho phép truy cập camera — AI tự nhận diện gương mặt bạn.' },
              { step: '02', icon: '💄', title: 'Chọn màu son', desc: 'Click vào bất kỳ màu nào trong 12 shade Mirror Mirror.' },
              { step: '03', icon: '✨', title: 'Thử & Mua', desc: 'Thấy màu son ảo trên môi — chụp ảnh, share, hoặc thêm vào giỏ ngay.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="brand-card flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-lemon-500 rounded-full flex items-center justify-center text-2xl shadow-lemon-glow">
                  {icon}
                </div>
                <div>
                  <span className="text-xs text-lemon-600 font-bold tracking-widest">{step}</span>
                  <h3 className="font-bold text-lg mt-1">{title}</h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shade gallery ────────────────────────────────────── */}
      <section className="py-20 bg-lemon-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-2">12 Shades</h2>
          <p className="text-gray-500 mb-10">Mirror Mirror Water Tint Collection</p>
          <div className="flex flex-wrap justify-center gap-4">
            {SHADES.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full shadow-brand-card border-4 border-white"
                  style={{ backgroundColor: s.hex }}
                />
                <span className="text-xs text-gray-600 font-medium w-20 text-center leading-tight">{s.name}</span>
              </div>
            ))}
          </div>
          <Link href="/try-on" className="btn-lemon mt-12 inline-flex">
            Thử tất cả màu
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-brand-black text-white/50 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <Image
            src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346"
            alt="LEMONADE"
            width={90}
            height={28}
            className="h-6 w-auto object-contain brightness-0 invert opacity-60"
            unoptimized
          />
          <p>© 2025 Lemonade Cosmetics. Tính năng Try-On powered by AI.</p>
          <Link href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3" target="_blank" className="hover:text-lemon-500 transition-colors">
            lemonade.vn ↗
          </Link>
        </div>
      </footer>

    </div>
  )
}
