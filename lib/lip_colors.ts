import type { Product } from './supabase'

// Helper to wrap Lemonade CDN URLs through wsrv.nl proxy (bypasses hotlink protection + CORS)
const p = (url: string) =>
  `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&output=webp&q=85`

const IMG  = 'https://product.hstatic.net/1000303351/product'
const IMG3 = `${IMG}/swatch_ver_3`
const BASE = 'https://www.lemonade.vn/products/son-tint-bong-khong-dinh-ben-mau-lemonade-mirror-mirror-water-tint-3'
const url  = (variantId: number) => `${BASE}?variant=${variantId}`

export const LIP_COLORS: Product[] = [
  { id: 'v1-01', name: '01. Pure Sunshine',        hex: '#CC7D62', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/1_8b3467529e0e4d3d94c3cdd0a0e1790f.jpg`),        store_url: url(1112574406) },
  { id: 'v1-02', name: '02. Rose Dew',             hex: '#B82040', opacity: 0.75, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/2_d75eab2da5a1471c922a65cf71fb410f.jpg`),        store_url: url(1112574689) },
  { id: 'v1-03', name: '03. Poinsettia Cranberry', hex: '#8E1A28', opacity: 0.80, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/3_90a021eb15124d37821f915e59b39e96.jpg`),        store_url: url(1112574716) },
  { id: 'v1-04', name: '04. Cinnamon Apple',       hex: '#9E3028', opacity: 0.78, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/4_e895b865cfd14ca8a871752089d4f82c.jpg`),        store_url: url(1112574752) },
  { id: 'v1-05', name: '05. Sepia Amber',          hex: '#B85F2A', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/5_8572d35ca297432ca13710f1261264fb.jpg`),        store_url: url(1112574810) },
  { id: 'v2-01', name: '06. Your Crush',           hex: '#CC2850', opacity: 0.80, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/6_bb24a3fe52c642ee8fda6a46c5661642.jpg`),        store_url: url(1119301610) },
  { id: 'v2-02', name: '07. Iconic Coral',         hex: '#C85035', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/7_77ff31fbe7554cff8b7aef97051f3543.jpg`),        store_url: url(1119301614) },
  { id: 'v2-03', name: '08. My Own Nude',          hex: '#C07858', opacity: 0.65, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/8_2cc02d985b4448f3b5aa50eb64a9e7ed.jpg`),        store_url: url(1119301621) },
  { id: 'v2-04', name: '09. Baby Rosy',            hex: '#E88A78', opacity: 0.62, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/9_bac2f94e16e14912a90f130c2472725f.jpg`),        store_url: url(1119301644) },
  { id: 'v2-05', name: '10. No Cap',               hex: '#CC6078', opacity: 0.70, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG}/10_435f73e83f3546cfb1290fb4ecd1bb4f.jpg`),       store_url: url(1119301653) },
  { id: 'v3-11', name: '11. Morning Glow',         hex: '#E07A68', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG3}_11_414d6ee8d64844fba7e5cd611cc2d36c.jpg`),      store_url: url(1140650061) },
  { id: 'v3-12', name: '12. Payday',               hex: '#D07058', opacity: 0.72, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG3}_12_443862f25ee64a38859c5cb7e2fa309e.jpg`),      store_url: url(1140650062) },
  { id: 'v3-13', name: '13. On The Date',          hex: '#E88A78', opacity: 0.65, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG3}_13_a7c7050603c948b89e2a723a67e2a19d.jpg`),      store_url: url(1140650063) },
  { id: 'v3-14', name: '14. Me Time',              hex: '#C87060', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG3}_14_dd2c9cd63d1a410fa4eec5807be2ec0e.jpg`),      store_url: url(1140650064) },
  { id: 'v3-15', name: '15. Gossiping',            hex: '#F0A0B5', opacity: 0.62, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p('https://cdn.hstatic.net/products/1000303351/vn-11134207-7ras8-m34dkwallo0ee7_7d5598cb28de491080c0e0cbe70f9fb5.jpg'), store_url: url(1140650065) },
  { id: 'v3-16', name: '16. Left No Crumbs',       hex: '#D87268', opacity: 0.68, finish: 'glossy', collection: 'Mirror Mirror Water Tint', price: 169000, image_url: p(`${IMG3}_16_8d2e53564e704181850bdf94e77a1f80.jpg`),      store_url: url(1140650066) },
]
