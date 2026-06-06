'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import type { LipColor } from '@/lib/lipRenderer'
import { trackEvent, logEvent, getOrCreateSessionId } from '@/lib/analytics'
import { LIP_COLORS } from '@/lib/lip_colors'

type ColorPaletteProps = {
  onColorSelect:   (color: LipColor) => void
  onProductSelect?: (product: Product) => void
  onShadesLoaded?: (shades: Product[]) => void
  selectedId?:     string | null
}

const FALLBACK_SHADES = LIP_COLORS

const DOTS_PER_PAGE = 6

export default function ColorPalette({ onColorSelect, onProductSelect, onShadesLoaded, selectedId: controlledId }: ColorPaletteProps) {
  const [shades, setShades]           = useState<Product[]>(FALLBACK_SHADES)
  const [internalId, setInternalId]   = useState<string | null>(null)
  const [page, setPage]               = useState(0)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const hoverTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeId   = controlledId !== undefined ? controlledId : internalId
  const totalPages = Math.ceil(shades.length / DOTS_PER_PAGE)
  const visible    = shades.slice(page * DOTS_PER_PAGE, (page + 1) * DOTS_PER_PAGE)

  useEffect(() => {
    onShadesLoaded?.(FALLBACK_SHADES)
    async function fetchShades() {
      const { data, error } = await supabase.from('products').select('*')
      if (!error && data && data.length > 0) {
        const loaded = (data as Product[]).sort((a, b) => {
          const n = (s: string) => parseInt(s.match(/^\d+/)?.[0] ?? '999')
          return n(a.name) - n(b.name)
        })
        setShades(loaded)
        onShadesLoaded?.(loaded)
      }
    }
    fetchShades()
  }, [onShadesLoaded])

  function handleSelect(product: Product) {
    const idx = shades.findIndex(s => s.id === product.id)
    setInternalId(product.id)
    setPage(Math.floor(idx / DOTS_PER_PAGE))
    onColorSelect({ hex: product.hex, opacity: product.opacity, finish: product.finish })
    onProductSelect?.(product)
    logEvent('color_selected', { colorId: product.id, colorName: product.name })
    void trackEvent({
      session_id: getOrCreateSessionId(),
      product_id: product.id,
      event_type:  'shade_selected',
    })
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Tên màu đang hover */}
      <p className="text-white/70 text-[11px] tracking-wide drop-shadow h-4 transition-opacity duration-150" style={{ opacity: hoveredColor ? 1 : 0 }}>
        {hoveredColor ?? ''}
      </p>

    <div className="flex items-center gap-2">
      {/* Prev arrow */}
      <button
        onClick={() => setPage(p => Math.max(0, p - 1))}
        aria-label="Tông màu trước"
        className={`w-8 h-8 flex items-center justify-center text-white text-xl drop-shadow transition-opacity ${page === 0 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
      >
        ‹
      </button>

      {/* Dots */}
      <div className="flex items-center gap-3">
        {visible.map(shade => {
          const isActive = activeId === shade.id
          return (
            <button
              key={shade.id}
              onClick={() => handleSelect(shade)}
              onMouseEnter={() => {
                if (hoverTimer.current) clearTimeout(hoverTimer.current)
                setHoveredColor(shade.name)
              }}
              onMouseLeave={() => {
                hoverTimer.current = setTimeout(() => setHoveredColor(null), 600)
              }}
              title={shade.name}
              aria-label={shade.name}
              aria-pressed={isActive}
              className="rounded-full transition-all duration-150 flex-shrink-0 active:scale-90"
              style={{
                width: isActive ? 48 : 42,
                height: isActive ? 48 : 42,
                backgroundColor: shade.hex,
                outline: isActive ? '2.5px solid white' : '2.5px solid transparent',
                outlineOffset: '3px',
                boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.45)' : '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          )
        })}
      </div>

      {/* Next arrow */}
      <button
        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        aria-label="Tông màu tiếp theo"
        className={`w-8 h-8 flex items-center justify-center text-white text-xl drop-shadow transition-opacity ${page >= totalPages - 1 ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
      >
        ›
      </button>
    </div>
    </div>
  )
}
