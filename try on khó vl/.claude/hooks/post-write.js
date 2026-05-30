#!/usr/bin/env node
/**
 * post-write hook — runs after Write/Edit tool calls
 * Auto-runs TypeScript check on .ts/.tsx files
 */

const input = JSON.parse(process.stdin.read() || '{}');
const filePath = input?.tool_input?.file_path || '';

// Only check TypeScript files
if (filePath.match(/\.(ts|tsx)$/) && !filePath.includes('node_modules')) {
  const { execSync } = require('child_process');
  try {
    execSync('npx tsc --noEmit --incremental 2>&1 | head -20', {
      stdio: 'pipe',
      timeout: 15000
    });
    console.log(`✅ TypeScript OK: ${filePath}`);
  } catch (e) {
    console.warn(`⚠️  TypeScript warnings after editing ${filePath}`);
    console.warn(e.stdout?.toString().slice(0, 500));
  }
}

process.exit(0);
