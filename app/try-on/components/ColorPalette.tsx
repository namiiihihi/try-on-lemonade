'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import type { LipColor } from '@/lib/lipRenderer'
import { trackEvent, getOrCreateSessionId } from '@/lib/analytics'

type ColorPaletteProps = {
  onColorSelect:   (color: LipColor) => void
  onProductSelect?: (product: Product) => void
  onShadesLoaded?: (shades: Product[]) => void
  selectedId?:     string | null
}

const IMG  = 'https://product.hstatic.net/1000303351/product'
const IMG3 = `${IMG}/swatch_ver_3`
const BASE = 'https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3'
const url  = (variantId: number) => `${BASE}?variant=${variantId}`

const FALLBACK_SHADES: Product[] = [
  { id: 'v1-01', name: '01. Pure Sunshine',        hex: '#CC7D62', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/1_8b3467529e0e4d3d94c3cdd0a0e1790f.jpg`,  store_url: url(1112574406) },
  { id: 'v1-02', name: '02. Rose Dew',             hex: '#B82040', opacity: 0.75, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/2_d75eab2da5a1471c922a65cf71fb410f.jpg`,  store_url: url(1112574689) },
  { id: 'v1-03', name: '03. Poinsettia Cranberry', hex: '#8E1A28', opacity: 0.80, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/3_90a021eb15124d37821f915e59b39e96.jpg`,  store_url: url(1112574716) },
  { id: 'v1-04', name: '04. Cinnamon Apple',       hex: '#9E3028', opacity: 0.78, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/4_e895b865cfd14ca8a871752089d4f82c.jpg`,  store_url: url(1112574752) },
  { id: 'v1-05', name: '05. Sepia Amber',          hex: '#B85F2A', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/5_8572d35ca297432ca13710f1261264fb.jpg`,  store_url: url(1112574810) },
  { id: 'v2-01', name: '06. Your Crush',           hex: '#CC2850', opacity: 0.80, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/6_bb24a3fe52c642ee8fda6a46c5661642.jpg`,  store_url: url(1119301610) },
  { id: 'v2-02', name: '07. Iconic Coral',         hex: '#C85035', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/7_77ff31fbe7554cff8b7aef97051f3543.jpg`,  store_url: url(1119301614) },
  { id: 'v2-03', name: '08. My Own Nude',          hex: '#C07858', opacity: 0.65, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/8_2cc02d985b4448f3b5aa50eb64a9e7ed.jpg`,  store_url: url(1119301621) },
  { id: 'v2-04', name: '09. Baby Rosy',            hex: '#E88A78', opacity: 0.62, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/9_bac2f94e16e14912a90f130c2472725f.jpg`,  store_url: url(1119301644) },
  { id: 'v2-05', name: '10. No Cap',               hex: '#CC6078', opacity: 0.70, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG}/10_435f73e83f3546cfb1290fb4ecd1bb4f.jpg`, store_url: url(1119301653) },
  { id: 'v3-11', name: '11. Morning Glow',         hex: '#E07A68', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG3}_11_414d6ee8d64844fba7e5cd611cc2d36c.jpg`, store_url: url(1140650061) },
  { id: 'v3-12', name: '12. Payday',               hex: '#D07058', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG3}_12_443862f25ee64a38859c5cb7e2fa309e.jpg`, store_url: url(1140650062) },
  { id: 'v3-13', name: '13. On The Date',          hex: '#E88A78', opacity: 0.65, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG3}_13_a7c7050603c948b89e2a723a67e2a19d.jpg`, store_url: url(1140650063) },
  { id: 'v3-14', name: '14. Me Time',              hex: '#C87060', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG3}_14_dd2c9cd63d1a410fa4eec5807be2ec0e.jpg`, store_url: url(1140650064) },
  { id: 'v3-15', name: '15. Gossiping',            hex: '#F0A0B5', opacity: 0.62, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: 'https://cdn.hstatic.net/products/1000303351/vn-11134207-7ras8-m34dkwallo0ee7_7d5598cb28de491080c0e0cbe70f9fb5.jpg', store_url: url(1140650065) },
  { id: 'v3-16', name: '16. Left No Crumbs',       hex: '#D87268', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: `${IMG3}_16_8d2e53564e704181850bdf94e77a1f80.jpg`, store_url: url(1140650066) },
]

export default function ColorPalette({ onColorSelect, onProductSelect, onShadesLoaded, selectedId: controlledId }: ColorPaletteProps) {
  const [shades, setShades]       = useState<Product[]>(FALLBACK_SHADES)
  const [internalId, setInternalId] = useState<string | null>(null)
  const [open, setOpen]           = useState(false)

  const activeId = controlledId !== undefined ? controlledId : internalId
  const active   = shades.find(s => s.id === activeId)

  useEffect(() => {
    onShadesLoaded?.(FALLBACK_SHADES)
    async function fetchShades() {
      const { data, error } = await supabase.from('products').select('*').order('name')
      if (!error && data && data.length > 0) {
        const loaded = data as Product[]
        setShades(loaded)
        onShadesLoaded?.(loaded)
      }
    }
    fetchShades()
  }, [onShadesLoaded])

  function handleSelect(product: Product) {
    setInternalId(product.id)
    setOpen(false)
    onColorSelect({ hex: product.hex, opacity: product.opacity, finish: product.finish })
    onProductSelect?.(product)
    void trackEvent({
      session_id: getOrCreateSessionId(),
      product_id: product.id,
      event_type:  'shade_selected',
    })
  }

  return (
    <div>
      {/* Collapsed toggle bar — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full py-1 focus:outline-none"
        aria-expanded={open}
      >
        {/* Preview dots: active shade first, then first 7 others */}
        <div className="flex items-center gap-1.5">
          {active && (
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: active.hex }}
            />
          )}
          {shades
            .filter(s => s.id !== activeId)
            .slice(0, active ? 7 : 8)
            .map(s => (
              <div
                key={s.id}
                className="w-3.5 h-3.5 rounded-full border border-white/30 flex-shrink-0"
                style={{ backgroundColor: s.hex }}
              />
            ))}
          <span className="text-white/35 text-[10px] ml-0.5">+{Math.max(0, shades.length - 8)}</span>
        </div>
        <span className="ml-auto text-white/40 text-[10px] tracking-wide flex items-center gap-1">
          Chọn màu
          <svg
            className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Expanded palette */}
      {open && (
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1 pt-2 border-t border-white/10 mt-1">
          {shades.map((shade) => {
            const isActive  = activeId === shade.id
            const shortName = shade.name.replace(/^\d+\.\s*/, '')
            return (
              <div key={shade.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleSelect(shade)}
                  title={shade.name}
                  aria-label={shade.name}
                  aria-pressed={isActive}
                  className="shade-swatch"
                  style={{ backgroundColor: shade.hex }}
                />
                <span
                  className={`text-[8px] leading-tight text-center w-12 line-clamp-2 select-none pointer-events-none transition-colors ${
                    isActive ? 'text-lemon-400 font-semibold' : 'text-white/50'
                  }`}
                >
                  {shortName}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
