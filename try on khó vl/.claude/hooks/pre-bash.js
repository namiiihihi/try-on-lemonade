#!/usr/bin/env node
/**
 * pre-bash hook — runs before every Bash tool call
 * Guardrails: block dangerous commands, log all bash usage
 */

const input = JSON.parse(process.stdin.read() || '{}');
const cmd = input?.tool_input?.command || '';

const BLOCKED = [
  /rm\s+-rf\s+\//,
  /DROP\s+TABLE/i,
  /curl.*\|\s*bash/,
  /eval\s*\(/,
];

for (const pattern of BLOCKED) {
  if (pattern.test(cmd)) {
    console.error(JSON.stringify({
      decision: 'block',
      reason: `🚫 Blocked dangerous command pattern: ${pattern}`
    }));
    process.exit(0);
  }
}

// Log to audit file
const fs = require('fs');
const log = `[${new Date().toISOString()}] ${cmd}\n`;
fs.appendFileSync('.claude/hooks/.bash-audit.log', log);

// Allow
process.exit(0);
