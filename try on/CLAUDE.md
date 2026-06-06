# Try On Lemonteen — AI Lip Try-On for Lemonade Cosmetics

## Dự án là gì?
Hệ thống **Virtual Lip Try-On** thời gian thực cho thương hiệu mỹ phẩm Việt Nam **Lemonade Cosmetics**.
Khách hàng bật camera → AI phát hiện môi → render màu son ảo lên môi ngay lập tức, không cần đến store.

Sản phẩm chính: **Mirror Mirror Water Tint** (169.000đ, 16 màu, finish glossy).

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| AI / AR | MediaPipe FaceMesh (468 landmarks), WebGL / Canvas 2D |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel (Edge Network) |
| Analytics | Supabase + Custom Event Dashboard |
| Testing | Jest, Playwright (cross-browser) |

---

## Cấu trúc thư mục chính

```
try-on-lemonteen/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Landing + product pages
│   ├── try-on/             # AR Try-On feature route
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── ARCanvas.tsx        # WebGL renderer
│   │       ├── FaceDetector.tsx    # MediaPipe wrapper
│   │       ├── ColorPalette.tsx    # Shade picker UI
│   │       └── CaptureButton.tsx
│   └── api/
│       ├── products/       # Shade metadata endpoint
│       └── analytics/      # Event tracking endpoint
├── lib/
│   ├── mediapipe.ts        # FaceMesh init & landmark parsing
│   ├── lipRenderer.ts      # Canvas 2D / WebGL color overlay
│   └── supabase.ts         # Supabase client
├── public/
│   └── models/             # MediaPipe WASM + model files (CDN-cached)
├── dataset/
│   ├── faces/              # Training images (224×224)
│   ├── annotations/        # JSON lip landmarks
│   ├── products/           # Shade CSV + swatch images
│   └── test_videos/        # Cross-condition test footage
├── tests/
│   ├── unit/
│   └── e2e/                # Playwright specs
├── .claude/                # Claude AI workspace config
├── CLAUDE.md               # ← file này
├── CLAUDE.local.md         # Personal overrides (gitignored)
└── supabase/
    └── migrations/         # DB migrations
```

---

## Conventions & Rules

### Code
- **TypeScript strict mode** — không dùng `any`, dùng type đầy đủ
- **Server Components mặc định**, chỉ dùng `"use client"` khi cần Web API (camera, canvas)
- **MediaPipe chỉ load ở client** — wrap trong `dynamic(() => import(...), { ssr: false })`
- Component đặt tên PascalCase, file kebab-case: `ar-canvas.tsx` export `ARCanvas`
- API routes trả `{ data, error }` nhất quán, không throw trực tiếp
- Tất cả màu son lưu dạng HEX + opacity: `{ hex: "#C0392B", opacity: 0.75, finish: "glossy" }`

### Performance targets (bắt buộc đạt trước khi merge)
| Metric | Target |
|---|---|
| Face detection latency | < 1000ms |
| AR rendering FPS | ≥ 24 FPS |
| Lip detection accuracy | ≥ 90% |
| Time to Interactive | < 4000ms |
| Mobile success rate | ≥ 80% |

### Database (Supabase)
- Migration files đặt trong `supabase/migrations/`, format: `YYYYMMDDHHMMSS_description.sql`
- Không viết raw SQL trong component — dùng Supabase client qua `lib/supabase.ts`
- RLS (Row Level Security) bật mặc định trên mọi bảng user data

### Commit messages
```
feat: add color comparison side-by-side UI
fix: lip landmark drift on low-light frames
perf: reduce WebGL shader compile time
test: add Playwright cross-browser suite
```

---

## Tính năng cốt lõi (theo thứ tự ưu tiên)

1. **Real-time AR overlay** — camera → FaceMesh → render màu son lên môi
2. **Color palette** — 16 màu Water Tint, click để đổi màu ngay lập tức
3. **Side-by-side compare** — so sánh 2–3 màu cùng lúc
4. **Capture & share** — chụp ảnh kết quả, share lên MXH
5. **Add to cart** — one-click mua màu đang thử
6. **Fallback: upload ảnh tĩnh** — khi camera không được phép
7. **Analytics dashboard** — màu phổ biến, conversion, engagement

---

## No-Go Words / Anti-patterns

- ❌ KHÔNG dùng `localStorage` cho user preference quan trọng → dùng Supabase
- ❌ KHÔNG load MediaPipe model trên server (Node.js không có WebGL)
- ❌ KHÔNG hardcode màu HEX trong component → luôn lấy từ Supabase `products` table
- ❌ KHÔNG merge code chưa pass performance benchmark
- ❌ KHÔNG dùng `console.log` trong production code → dùng logger util

---

## Supabase Schema (tóm tắt)

```sql
-- Bảng sản phẩm và màu son
products (id, name, hex, opacity, finish, collection, price, image_url)

-- Analytics events
try_on_events (id, session_id, product_id, event_type, created_at)
-- event_type: 'shade_selected' | 'photo_captured' | 'add_to_cart' | 'share'

-- User sessions (anonymous)
sessions (id, device_type, browser, skin_tone_estimate, created_at)
```

---

## Env Variables cần thiết

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MEDIAPIPE_CDN=https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh
VERCEL_ANALYTICS_ID=
```

---

## Liên hệ dự án

- Đối tác: Lemonade Cosmetics — lemonade.vn
- Nhóm: Nhóm 4 thành viên
- Sprint: 4 ngày
- Năm học: 2025–2026
