'use client'

import { useCallback } from 'react'
import type { Product } from '@/lib/supabase'
import { trackEvent, getOrCreateSessionId } from '@/lib/analytics'

type AddToCartButtonProps = {
  product: Product | null
}

const BASE_URL = 'https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3'

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ'
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const handleAddToCart = useCallback(() => {
    if (!product) return

    // Use variant-specific URL if available, else fall back to product base URL
    const url = product.store_url ?? BASE_URL
    window.open(url, '_blank', 'noopener,noreferrer')

    void trackEvent({
      session_id: getOrCreateSessionId(),
      product_id: product.id,
      event_type: 'add_to_cart',
    })
  }, [product])

  if (!product) {
    return (
      <button
        disabled
        className="w-full py-3 rounded-2xl bg-white/8 text-white/25 text-sm font-semibold cursor-not-allowed select-none border border-white/10"
      >
        Chọn màu để thêm vào giỏ
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full py-3 rounded-2xl bg-lemon-500 text-brand-black text-sm font-bold hover:bg-lemon-600 active:scale-[0.98] transition-all shadow-lemon-glow"
    >
      🛒 Mua {product.name} — {formatPrice(product.price)}
    </button>
  )
}
