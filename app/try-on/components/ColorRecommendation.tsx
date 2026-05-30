'use client'

import { useState } from 'react'
import type { SkinAnalysis } from '@/lib/skinAnalysis'
import { TONE_LABEL, UNDERTONE_LABEL, SEASON_LABEL, LIP_TONE_LABEL, LEMONADE_RECOMMENDATIONS, SEASON_SUB_LABEL, LIGHTING_LABEL } from '@/lib/skinAnalysis'
import type { Product } from '@/lib/supabase'
import type { LipColor } from '@/lib/lipRenderer'

type ColorRecommendationProps = {
  analysis:        SkinAnalysis
  allShades:       Product[]
  onColorSelect:   (color: LipColor) => void
  onProductSelect: (product: Product) => void
  selectedId:      string | null
}

export default function ColorRecommendation({
  analysis,
  allShades,
  onColorSelect,
  onProductSelect,
  selectedId,
}: ColorRecommendationProps) {
  const [expanded, setExpanded] = useState(false)

  const recommendedNames = LEMONADE_RECOMMENDATIONS[analysis.tone][analysis.lipColorTone]
  const recommendedShades = recommendedNames
    .map(name => allShades.find(s => s.name.toLowerCase().includes(name.split('.')[1]?.trim().toLowerCase() ?? '')))
    .filter((s): s is Product => !!s)
    .slice(0, 4)

  if (recommendedShades.length === 0) return null

  const seasonColors: Record<string, string> = {
    spring: '#FFB7C5', summer: '#A8D8E8', autumn: '#D4956A', winter: '#8E9CC4',
  }

  return (
    <div className="mt-2">
      {/* ── Compact badge ─────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/8 hover:bg-white/12 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: seasonColors[analysis.personalColor] }}
          />
          <span className="text-white/70 text-[11px] font-medium">
            {TONE_LABEL[analysis.tone]} · {UNDERTONE_LABEL[analysis.undertone]}
          </span>
          <span className="text-white/40 text-[10px]">
            {SEASON_SUB_LABEL[analysis.personalColorSub]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
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

      {/* ── Expanded recommendation panel ────────────────────────────── */}
      {expanded && (
        <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-white/60 text-[10px] tracking-wider uppercase font-semibold">
                {LIP_TONE_LABEL[analysis.lipColorTone]} · {TONE_LABEL[analysis.tone]}
              </p>
              <p className="text-white/35 text-[9px] mt-0.5">
                {SEASON_SUB_LABEL[analysis.personalColorSub]} · {LIGHTING_LABEL[analysis.lightingLevel]}
              </p>
            </div>
            <p className="text-white/25 text-[9px]">
              Theo bảng màu Lemonade
            </p>
          </div>

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
                  {/* Swatch */}
                  <div
                    className={`w-11 h-11 rounded-full border-4 transition-all group-hover:scale-110 ${
                      isSelected
                        ? 'border-lemon-500 scale-110 shadow-lemon-glow'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: shade.hex }}
                  />
                  {/* Name */}
                  <span className={`text-[9px] text-center w-14 leading-tight line-clamp-2 ${isSelected ? 'text-lemon-400' : 'text-white/50'}`}>
                    {shade.name.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-white/25 text-[9px] mt-3 text-center">
            Phân tích từ camera · {Math.round(analysis.confidence * 100)}% độ chính xác
          </p>
        </div>
      )}
    </div>
  )
}
