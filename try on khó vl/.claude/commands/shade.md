# /shade — Manage lipstick shades

Manage the Mirror Mirror Water Tint color database:

1. Show current shades: query Supabase `products` table
2. Add new shade: insert with `{ name, hex, opacity, finish, collection, price }`
3. Update shade: modify existing record
4. Export palette: generate JSON/CSV for frontend use

Validate before inserting:
- HEX must be valid 6-digit code (e.g. #C0392B)
- Opacity between 0.5–0.9 for realistic lip look
- Finish must be "glossy" | "matte" | "satin"
