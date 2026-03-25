#!/usr/bin/env node
/**
 * GLITCHED.GG — GitHub Webhook Listener
 *
 * Listens on port 9000 for GitHub push events.
 * Validates HMAC-SHA256 signature, then runs deploy.sh.
 *
 * Managed by PM2: pm2 start scripts/deploy/webhook-listener.js --name glitched-deploy
 */
const http = require('http');
const crypto = require('crypto');
const { execFile } = require('child_process');
const fs = require('fs');

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'e79d7715c65eb0bcac0cb4e670b86c19487dc1dee3066526e9364c3bd58907a2';
const DEPLOY_SCRIPT = '/opt/glitched/scripts/deploy/deploy.sh';
const DEPLOY_LOCK = '/tmp/glitched-deploy.lock';
const REPO_BRANCH = 'main';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync('/var/log/glitched-webhook.log', line + '\n');
}

function verifySignature(payload, signature) {
  if (!signature) return false;
  const sig = signature.replace('sha256=', '');
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(hmac, 'hex'));
  } catch {
    return false;
  }
}

function isDeploying() {
  try {
    if (!fs.existsSync(DEPLOY_LOCK)) return false;
    const stat = fs.statSync(DEPLOY_LOCK);
    // Stale lock (older than 10 minutes) — remove it
    if (Date.now() - stat.mtimeMs > 10 * 60 * 1000) {
      fs.unlinkSync(DEPLOY_LOCK);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function runDeploy() {
  if (isDeploying()) {
    log('Deploy already in progress — skipping');
    return;
  }

  fs.writeFileSync(DEPLOY_LOCK, String(process.pid));
  log('Starting deploy...');

  execFile('bash', [DEPLOY_SCRIPT], { timeout: 5 * 60 * 1000 }, (err, stdout, stderr) => {
    try { fs.unlinkSync(DEPLOY_LOCK); } catch {}

    if (err) {
      log(`Deploy FAILED: ${err.message}`);
      if (stderr) log(`stderr: ${stderr.slice(-500)}`);
      return;
    }
    log('Deploy completed successfully');
    if (stdout) {
      const lastLines = stdout.trim().split('\n').slice(-5).join('\n');
      log(`Output: ${lastLines}`);
    }
  });
}

const server = http.createServer((req, res) => {
  // Health check
  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'glitched-deploy-webhook', deploying: isDeploying() }));
    return;
  }

  // Only accept POST to /webhook or /
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    // Verify GitHub signature
    const signature = req.headers['x-hub-signature-256'];
    if (!verifySignature(body, signature)) {
      log(`Rejected: invalid signature from ${req.socket.remoteAddress}`);
      res.writeHead(401);
      res.end('Invalid signature');
      return;
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400);
      res.end('Invalid JSON');
      return;
    }

    // Only deploy on push to main
    const event = req.headers['x-github-event'];
    if (event === 'ping') {
      log('Received ping from GitHub — webhook is connected');
      res.writeHead(200);
      res.end('pong');
      return;
    }

    if (event !== 'push') {
      log(`Ignored event: ${event}`);
      res.writeHead(200);
      res.end('Ignored');
      return;
    }

    const branch = (payload.ref || '').replace('refs/heads/', '');
    if (branch !== REPO_BRANCH) {
      log(`Ignored push to branch: ${branch}`);
      res.writeHead(200);
      res.end('Ignored (not main)');
      return;
    }

    const pusher = payload.pusher?.name || 'unknown';
    const commitMsg = payload.head_commit?.message?.split('\n')[0] || 'no message';
    const commitSha = (payload.after || '').slice(0, 7);
    log(`Push received: ${commitSha} by ${pusher} — "${commitMsg}"`);

    // Respond immediately, deploy async
    res.writeHead(200);
    res.end('Deploy triggered');

    // Small delay to avoid deploying our own push
    setTimeout(() => runDeploy(), 2000);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  log(`Webhook listener started on 127.0.0.1:${PORT}`);
});

process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
});
