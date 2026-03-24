const fs = require('fs');
const path = require('path');

// Parse .env.local into an object
function loadEnvFile(filePath) {
  const env = {};
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx);
      let val = trimmed.slice(eqIdx + 1);
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch (e) { /* ignore */ }
  return env;
}

const envVars = loadEnvFile(path.join(__dirname, '.env.local'));

module.exports = {
  apps: [
    {
      name: 'glitched-web',
      script: '.next/standalone/server.js',
      cwd: '/opt/glitched',
      exec_mode: 'fork',
      env: {
        ...envVars,
        NODE_ENV: 'production',
        PORT: 3003,
        HOSTNAME: '127.0.0.1',
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'glitched-ws',
      script: 'npx',
      args: 'ts-node --project server/tsconfig.json server/index.ts',
      cwd: '/opt/glitched',
      exec_mode: 'fork',
      env: {
        ...envVars,
        NODE_ENV: 'production',
        WS_PORT: 3004,
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'glitched-engine',
      script: 'npx',
      args: 'ts-node --project engine/tsconfig.json engine/index.ts',
      cwd: '/opt/glitched',
      exec_mode: 'fork',
      env: {
        ...envVars,
        NODE_ENV: 'production',
        ENGINE_PORT: 3005,
      },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
