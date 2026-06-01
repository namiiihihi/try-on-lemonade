'use client'

import { useState } from 'react'
import type { SkinAnalysis } from '@/lib/skinAnalysis'
import {
  TONE_LABEL, UNDERTONE_LABEL, SEASON_LABEL,
  LEMONADE_RECOMMENDATIONS, SEASON_SUB_LABEL, LIGHTING_LABEL,
} from '@/lib/skinAnalysis'
import type { Product } from '@/lib/supabase'
import type { LipColor } from '@/lib/lipRenderer'

type ColorRecommendationProps = {
  analysis:        SkinAnalysis
  allShades:       Product[]
  onColorSelect:   (color: LipColor) => void
  onProductSelect: (product: Product) => void
  selectedId:      string | null
}

// Visual accent per season
const SEASON_STYLE: Record<string, { dot: string; badge: string; text: string }> = {
  spring: { dot: '#FFB7C5', badge: 'bg-pink-500/15 border-pink-400/30',   text: 'text-pink-300' },
  summer: { dot: '#A8D8E8', badge: 'bg-sky-500/15 border-sky-400/30',     text: 'text-sky-300'  },
  autumn: { dot: '#D4956A', badge: 'bg-amber-500/15 border-amber-400/30', text: 'text-amber-300' },
  winter: { dot: '#8E9CC4', badge: 'bg-violet-500/15 border-violet-400/30', text: 'text-violet-300' },
}

const COOL_SUBTYPES = new Set(['cool_summer', 'soft_summer', 'light_summer', 'deep_winter', 'clear_winter', 'cool_winter'])

export default function ColorRecommendation({
  analysis,
  allShades,
  onColorSelect,
  onProductSelect,
  selectedId,
}: ColorRecommendationProps) {
  const [expanded, setExpanded] = useState(false)

  // Match by shade name (after "XX. ") — case-insensitive partial match
  const recommendedKeywords = LEMONADE_RECOMMENDATIONS[analysis.personalColorSub]
  const recommendedShades = recommendedKeywords
    .map(kw => allShades.find(s => s.name.toLowerCase().includes(kw.toLowerCase())))
    .filter((s): s is Product => !!s)
    .slice(0, 4)

  if (recommendedShades.length === 0) return null

  const style    = SEASON_STYLE[analysis.personalColor]
  const isCool   = COOL_SUBTYPES.has(analysis.personalColorSub)
  const subLabel = SEASON_SUB_LABEL[analysis.personalColorSub]

  return (
    <div>
      {/* ── Compact badge ─────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left border border-white/8"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white/20"
            style={{ backgroundColor: style.dot }}
          />
          <span className="text-white/70 text-[11px] font-medium truncate">
            {TONE_LABEL[analysis.tone]} · {UNDERTONE_LABEL[analysis.undertone]}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${style.badge} ${style.text}`}>
            {subLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-lemon-500 text-[10px] font-bold tracking-wider uppercase">
            Gợi ý ✨
          </span>
          <svg
            className={`w-3 h-3 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── Expanded panel ────────────────────────────────────────── */}
      {expanded && (
        <div className={`mt-1.5 rounded-2xl border p-3 animate-fade-in ${style.badge}`}>

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-white/80 text-xs font-bold">{SEASON_LABEL[analysis.personalColor]}</span>
                <span className={`text-[10px] font-semibold ${style.text}`}>{subLabel}</span>
                {isCool && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-sky-500/25 border border-sky-400/40 text-sky-300 rounded-full font-medium">
                    Tông Lạnh ❄️
                  </span>
                )}
              </div>
              <p className="text-white/40 text-[9px]">
                {TONE_LABEL[analysis.tone]} · {LIGHTING_LABEL[analysis.lightingLevel]}
              </p>
            </div>
            <p className="text-white/25 text-[9px] text-right">Theo bảng màu<br />Lemonade</p>
          </div>

          {/* Cool tone tip */}
          {isCool && (
            <div className="mb-3 px-2.5 py-2 rounded-xl bg-sky-500/10 border border-sky-400/20">
              <p className="text-sky-300 text-[10px] leading-relaxed">
                {analysis.personalColor === 'summer'
                  ? '💙 Tone lạnh nhẹ nhàng — hợp màu hồng pastel, hồng tím, nude cool'
                  : '❄️ Tone lạnh sắc nét — hợp màu berry đậm, hồng fuchsia, đỏ cool'}
              </p>
            </div>
          )}

          {/* Shade swatches */}
          <div className="flex gap-3 flex-wrap">
            {recommendedShades.map((shade) => {
              const isSelected = selectedId === shade.id
              return (
                <button
                  key={shade.id}
                  onClick={() => {
                    onColorSelect({ hex: shade.hex, opacity: shade.opacity, finish: shade.finish })
                    onProductSelect(shade)
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-11 h-11 rounded-full border-4 transition-all group-hover:scale-110 ${
                      isSelected
                        ? 'border-lemon-500 scale-110 shadow-lemon-glow'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                  />
                  <span className={`text-[9px] text-center w-14 leading-tight line-clamp-2 ${isSelected ? 'text-lemon-400' : 'text-white/50'}`}>
                    {shade.name.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-white/20 text-[9px] mt-3 text-center">
            Phân tích từ camera · {Math.round(analysis.confidence * 100)}% độ chính xác
          </p>
        </div>
      )}
    </div>
  )
}
