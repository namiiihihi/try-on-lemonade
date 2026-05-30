# /ar-debug — Debug AR Try-On issues

Help debug the AR face detection and lip rendering pipeline:

1. Check `lib/mediapipe.ts` for FaceMesh initialization errors
2. Check `app/try-on/components/FaceDetector.tsx` for landmark parsing
3. Check `lib/lipRenderer.ts` for WebGL/Canvas overlay logic
4. Common issues to look for:
   - WASM model not loading (check `public/models/` or CDN URL)
   - Camera permission denied (check edge case handler)
   - Low FPS (check requestAnimationFrame loop, canvas size)
   - Lip landmarks drifting (check landmark indices 61–291 for lips)
   - Color accuracy (check HEX → RGBA conversion + opacity blending)

Report findings and suggest specific fixes with code snippets.
