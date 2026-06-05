// ── 1. MediaPipe FaceMesh — CDN config ──────────────────────────────────────
export const MEDIAPIPE_VERSION = '0.4.1633559619'
export const MEDIAPIPE_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${MEDIAPIPE_VERSION}`

export const MEDIAPIPE_WASM_FILES = [
  'face_mesh.js',
  'face_mesh_solution_packed_assets.data',
  'face_mesh_solution_packed_assets_loader.js',
  'face_mesh_solution_simd_wasm_bin.js',
  'face_mesh_solution_simd_wasm_bin.wasm',
] as const

export const MEDIAPIPE_CONFIG = {
  cdnBase:      MEDIAPIPE_CDN,
  packageName:  '@mediapipe/face_mesh',
  version:      MEDIAPIPE_VERSION,
  loadedVia:    'cdn-script-tag',
  locateFile:   (filename: string) => `${MEDIAPIPE_CDN}/${filename}`,
}

// ── 2. AI Libraries dùng trong dự án ────────────────────────────────────────
export const AI_PACKAGES = [
  { name: '@mediapipe/face_mesh', version: '0.4.1633559619', role: 'Face landmark detection — 468 điểm trên khuôn mặt' },
  { name: 'next',                 version: '14.x',           role: 'Framework React SSR + API routes'                  },
  { name: '@supabase/supabase-js', version: '2.x',          role: 'Database client — lưu session & analytics'         },
] as const

// ── 3. Dataset ảnh test (từ folder "image nghiên cứu 1") ────────────────────
export type TestImage = {
  filename: string
  shade_id:  string
  shade_name: string
  source:    'lemonade_cdn'
}

export const TEST_IMAGES: TestImage[] = [
  { filename: '4_e895b865cfd14ca8a871752089d4f82c_master.jpg',  shade_id: 'v1-04', shade_name: '04. Cinnamon Apple',  source: 'lemonade_cdn' },
  { filename: '5_8572d35ca297432ca13710f1261264fb_master.jpg',  shade_id: 'v1-05', shade_name: '05. Sepia Amber',     source: 'lemonade_cdn' },
  { filename: '6_bb24a3fe52c642ee8fda6a46c5661642_master.jpg',  shade_id: 'v2-01', shade_name: '06. Your Crush',      source: 'lemonade_cdn' },
  { filename: '7_77ff31fbe7554cff8b7aef97051f3543_master.jpg',  shade_id: 'v2-02', shade_name: '07. Iconic Coral',    source: 'lemonade_cdn' },
  { filename: '8_2cc02d985b4448f3b5aa50eb64a9e7ed_master.jpg',  shade_id: 'v2-03', shade_name: '08. My Own Nude',     source: 'lemonade_cdn' },
  { filename: '9_bac2f94e16e14912a90f130c2472725f_master.jpg',  shade_id: 'v2-04', shade_name: '09. Baby Rosy',       source: 'lemonade_cdn' },
  { filename: '10_435f73e83f3546cfb1290fb4ecd1bb4f_master.jpg', shade_id: 'v2-05', shade_name: '10. No Cap',          source: 'lemonade_cdn' },
  { filename: 'swatch_ver_3_11_414d6ee8d64844fba7e5cd611cc2d36c_master.jpg', shade_id: 'v3-11', shade_name: '11. Morning Glow',  source: 'lemonade_cdn' },
  { filename: 'swatch_ver_3_12_443862f25ee64a38859c5cb7e2fa309e_master.jpg', shade_id: 'v3-12', shade_name: '12. Payday',         source: 'lemonade_cdn' },
  { filename: 'swatch_ver_3_13_a7c7050603c948b89e2a723a67e2a19d_master.jpg', shade_id: 'v3-13', shade_name: '13. On The Date',    source: 'lemonade_cdn' },
  { filename: 'swatch_ver_3_14_dd2c9cd63d1a410fa4eec5807be2ec0e_master.jpg', shade_id: 'v3-14', shade_name: '14. Me Time',        source: 'lemonade_cdn' },
  { filename: 'swatch_ver_3_16_8d2e53564e704181850bdf94e77a1f80_master.jpg', shade_id: 'v3-16', shade_name: '16. Left No Crumbs', source: 'lemonade_cdn' },
]

// ── 4. Avatar son mẫu (ground truth) ────────────────────────────────────────
export type AvatarSon = {
  id:          string
  filename:    string
  publicPath:  string
  shade_id:    string
  shade_name:  string
  hex:         string
}

export const AVATAR_SON: AvatarSon[] = [
  {
    id:         'avatar-04',
    filename:   'avatar_son-04_11986be1d98f4d6f8b8f1654109e5d92_master.png',
    publicPath: '/avatar_son-04.png',
    shade_id:   'v1-04',
    shade_name: '04. Cinnamon Apple',
    hex:        '#9E3028',
  },
  {
    id:         'avatar-05',
    filename:   'avatar_son-05_65f94b3018994887878e617016cfe84e_master.png',
    publicPath: '/avatar_son-05.png',
    shade_id:   'v1-05',
    shade_name: '05. Sepia Amber',
    hex:        '#B85F2A',
  },
  {
    id:         'avatar-06',
    filename:   'avatar_son-06_683be112dc364a5ea94e6a7157ddcdb1_master.png',
    publicPath: '/avatar_son-06.png',
    shade_id:   'v2-01',
    shade_name: '06. Your Crush',
    hex:        '#CC2850',
  },
]
