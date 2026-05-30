# /deploy — Deploy to Vercel

Deploy the project to Vercel preview/production:

1. Run `npm run build` — if fails, fix errors before continuing
2. Run `npx tsc --noEmit` — block deploy if TypeScript errors exist
3. Check `supabase/migrations/` for unapplied migrations
4. Run `vercel --prod` (or `vercel` for preview)
5. After deploy, show the preview URL
6. Run smoke test: check `/api/products` endpoint returns 200

Ask me to confirm before pushing to production (`--prod`).
