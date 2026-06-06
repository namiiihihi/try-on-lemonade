'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LIP_COLORS } from '@/lib/lip_colors'

export default function CameraError() {
  return (
    <div className="fixed inset-0 bg-brand-black flex flex-col overflow-y-auto">

      {/* Header */}
      <header className="flex items-center px-4 py-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <Image
            src="https://theme.hstatic.net/1000303351/1001070461/14/logo.png?v=2346"
            alt="LEMONADE" width={72} height={22}
            className="h-5 w-auto brightness-0 invert"
            unoptimized
          />
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 gap-6 max-w-md mx-auto w-full">

        {/* Camera icon */}
        <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          {/* X slash */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </svg>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-white text-xl font-bold tracking-tight">
            Camera chưa được cấp quyền
          </h1>
          <p className="text-white/40 text-sm mt-2 leading-relaxed">
            Tính năng thử màu son cần truy cập camera của bạn.
          </p>
        </div>

        {/* Hướng dẫn */}
        <div className="w-full bg-white/5 rounded-2xl px-5 py-4 space-y-2.5">
          <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">Cách bật quyền camera</p>
          {[
            { icon: '🌐', text: 'Chrome / Edge: nhấn biểu tượng 🔒 trên thanh địa chỉ → Camera → Cho phép' },
            { icon: '🦊', text: 'Firefox: nhấn biểu tượng camera trên thanh địa chỉ → Bỏ chặn' },
            { icon: '🍎', text: 'Safari: Cài đặt → Safari → Camera → Cho phép' },
            { icon: '🔄', text: 'Sau khi bật quyền, tải lại trang để thử màu' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <span className="text-base leading-tight flex-shrink-0">{icon}</span>
              <p className="text-white/50 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* 16 màu tĩnh — grid 8 cột */}
        <div className="w-full">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase text-center mb-3">
            16 tông màu Mirror Mirror Water Tint
          </p>
          <div className="grid grid-cols-8 gap-2 justify-items-center">
            {LIP_COLORS.map(shade => (
              <div
                key={shade.id}
                title={shade.name}
                className="w-9 h-9 rounded-full flex-shrink-0 ring-2 ring-white/10"
                style={{ backgroundColor: shade.hex }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href="https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-brand-rose text-white font-semibold text-sm py-3.5 rounded-full transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          Mua ngay trên lemonade.vn
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

      </div>
    </div>
  )
}
