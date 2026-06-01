import Image from 'next/image'
import Link from 'next/link'

const SHADES = [
  { name: '01. Pure Sunshine',        hex: '#CC7D62' },
  { name: '02. Rose Dew',             hex: '#B82040' },
  { name: '03. Poinsettia Cranberry', hex: '#8E1A28' },
  { name: '04. Cinnamon Apple',       hex: '#9E3028' },
  { name: '05. Sepia Amber',          hex: '#B85F2A' },
  { name: '06. Your Crush',           hex: '#CC2850' },
  { name: '07. Iconic Coral',         hex: '#C85035' },
  { name: '08. My Own Nude',          hex: '#C07858' },
  { name: '09. Baby Rosy',            hex: '#E88A78' },
  { name: '10. No Cap',               hex: '#CC6078' },
  { name: '11. Morning Glow',         hex: '#E07A68' },
  { name: '12. Payday',               hex: '#D07058' },
  { name: '13. On The Date',          hex: '#E88A78' },
  { name: '14. Me Time',              hex: '#C87060' },
  { name: '15. Gossiping',            hex: '#F0A0B5' },
  { name: '16. Left No Crumbs',       hex: '#D87268' },
]

const PRODUCTS = [
  { id: 1, img: '/product-03.png', label: 'Mirror Mirror Water Tint' },
  { id: 2, img: '/product-04.png', label: 'Mirror Mirror Water Tint' },
  { id: 3, img: '/product-01.png', label: 'Mirror Mirror Water Tint' },
  { id: 4, img: '/product-02.png', label: 'Mirror Mirror Water Tint' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-sky-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" aria-label="Lemonade homepage">
            <Image
              src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346"
              alt="LEMONADE"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs text-brand-black uppercase tracking-widest font-semibold">
            <Link href="/"       className="hover:text-sky-500 transition-colors">Sản phẩm</Link>
            <Link href="/try-on" className="hover:text-sky-500 transition-colors">Try-On</Link>
            <Link
              href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3"
              target="_blank"
              className="hover:text-sky-500 transition-colors"
            >
              Mua ngay
            </Link>
          </nav>
          <Link href="/try-on" className="btn-lemon text-xs py-2 px-5">
            Thử màu
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-lemon-50">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 bg-lemon-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* Text */}
          <div className="animate-slide-up z-10">
            <span className="inline-block bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              AI Try-On
            </span>
            <h1 className="font-display text-6xl md:text-7xl font-bold leading-tight text-brand-black mb-4">
              For&nbsp;<span className="italic text-sky-500">LIPS</span>
            </h1>
            <p className="text-2xl font-semibold text-lemon-700 mb-2">Mirror Mirror Water Tint</p>
            <p className="text-gray-500 text-base max-w-sm mb-8 leading-relaxed">
              16 màu son glossy — thử ngay trên môi bạn bằng AI, không cần đến cửa hàng. 169.000₫ / thỏi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/try-on" className="btn-lemon">
                Thử màu miễn phí
              </Link>
              <Link
                href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3"
                target="_blank"
                className="btn-ghost"
              >
                Mua ngay
              </Link>
            </div>
            {/* Mini swatches */}
            <div className="flex gap-2 mt-8 flex-wrap">
              {SHADES.slice(0, 8).map((s) => (
                <div
                  key={s.name}
                  title={s.name}
                  className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-125 transition-transform cursor-default"
                  style={{ backgroundColor: s.hex }}
                />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-sky-300 flex items-center justify-center text-sky-400 text-xs font-bold">
                +8
              </div>
            </div>
          </div>

          {/* Product images — khung chữ nhật 2×2, ngang bằng text block */}
          <div className="relative animate-fade-in z-10">
            {/* Floating badge */}
            <div className="absolute -top-3 -right-2 z-10 bg-lemon-500 text-brand-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lemon-glow">
              16 shades
            </div>

            {/* Khung chính */}
            <div className="grid grid-cols-2 gap-3 rounded-3xl overflow-hidden bg-gradient-to-br from-sky-100 to-lemon-50 p-4 shadow-xl ring-1 ring-sky-200/60">
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="aspect-square rounded-2xl overflow-hidden bg-white/70 flex items-center justify-center shadow-sm"
                >
                  <Image
                    src={p.img}
                    alt={p.label}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-2 text-brand-black">Cách dùng</h2>
          <p className="text-gray-400 mb-12">3 bước — 3 giây — biết màu nào hợp mình</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📷', title: 'Bật camera', desc: 'Cho phép truy cập camera — AI tự nhận diện gương mặt bạn.' },
              { step: '02', icon: '💄', title: 'Chọn màu son', desc: 'Click vào bất kỳ màu nào trong 16 shade Mirror Mirror.' },
              { step: '03', icon: '✨', title: 'Thử & Mua', desc: 'Thấy màu son ảo trên môi — chụp ảnh, share, hoặc thêm vào giỏ ngay.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="brand-card flex flex-col items-center text-center gap-4 border border-sky-100 hover:border-sky-300 transition-colors">
                <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <div>
                  <span className="text-xs text-sky-500 font-bold tracking-widest">{step}</span>
                  <h3 className="font-bold text-lg mt-1 text-brand-black">{title}</h3>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shade gallery ─────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-2 text-brand-black">16 Shades</h2>
          <p className="text-gray-400 mb-10">Mirror Mirror Water Tint Collection</p>
          <div className="flex flex-wrap justify-center gap-4">
            {SHADES.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full shadow-md border-4 border-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: s.hex }}
                />
                <span className="text-xs text-gray-500 font-medium w-20 text-center leading-tight">{s.name}</span>
              </div>
            ))}
          </div>
          <Link href="/try-on" className="btn-lemon mt-12 inline-flex">
            Thử tất cả màu
          </Link>
        </div>
      </section>

      {/* ── Banner CTA ────────────────────────────────────────── */}
      <section className="py-16 bg-sky-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Tìm màu son hoàn hảo cho bạn
          </h2>
          <p className="text-sky-100 mb-8 text-lg">
            Thử nghiệm AI Try-On ngay — miễn phí, không cần cài app.
          </p>
          <Link href="/try-on" className="inline-flex items-center justify-center bg-lemon-500 text-brand-black font-bold px-10 py-4 rounded-full text-sm uppercase tracking-wide hover:bg-lemon-600 transition-all shadow-lemon-glow">
            Bắt đầu thử ngay
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
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
          <Link
            href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3"
            target="_blank"
            className="hover:text-lemon-500 transition-colors"
          >
            lemonade.vn ↗
          </Link>
        </div>
      </footer>

    </div>
  )
}
