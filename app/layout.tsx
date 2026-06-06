import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google'
import './globals.css'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mirror Mirror Water Tint — Lemonade Cosmetics',
  description: 'Thử 16 màu son ảo ngay trên gương mặt bạn — thời gian thực, không cần đến cửa hàng.',
  openGraph: {
    title: 'Mirror Mirror Water Tint | Lemonade Try-On',
    description: 'AI Lip Try-On cho Lemonade Cosmetics',
    siteName: 'Lemonade Cosmetics',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-brand-white text-brand-black">
        {children}
      </body>
    </html>
  )
}
