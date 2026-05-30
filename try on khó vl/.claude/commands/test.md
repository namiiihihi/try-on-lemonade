# /test — Run full test suite

Run the project test suite in this order:

1. **Unit tests**: `npm run test:unit`
2. **Type check**: `npx tsc --noEmit`
3. **Lint**: `npm run lint`
4. **E2E (Playwright)**: `npx playwright test --reporter=line`

After each step, report: ✅ Pass / ❌ Fail with error count.

If any test fails, show the first 3 error messages and suggest a fix.

Performance benchmarks to check manually:
- Face detection latency < 1000ms
- AR rendering ≥ 24 FPS
- TTI < 4000ms
