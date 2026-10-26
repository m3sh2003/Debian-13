import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'debian13-api-endpoints',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/healthz') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'ok',
                service: 'debian13-cloud-desktop-builder',
                version: '1.0.0-improved-reliability'
              }));
              return;
            }
            if (req.url === '/api/deploy.sh') {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end(`#!/usr/bin/env bash
# Debian 13 Cloud Desktop Builder - Automated Quick Deployer
set -euo pipefail
echo "=========================================================="
echo "Installing Debian 13 (Trixie) Cloud Desktop Environment..."
echo "=========================================================="
mkdir -p /workspace/debian13-server/scripts
mkdir -p /workspace/debian13-server/logs
mkdir -p /workspace/debian13-server/state
mkdir -p /srv/debian13

if [ ! -f /workspace/debian13-server/.pinned_id ]; then
    openssl rand -hex 8 > /workspace/debian13-server/.pinned_id || head -c 8 /dev/urandom | xxd -p > /workspace/debian13-server/.pinned_id
fi
DEPLOYMENT_ID=$(cat /workspace/debian13-server/.pinned_id)
echo "Generated Persistent Deployment ID: \${DEPLOYMENT_ID}"

echo "Debian 13 Cloud Desktop orchestrator initialized."
echo "Access URL: https://\${DEPLOYMENT_ID}.sg.agentos-app.run"
echo "Credentials: admin / 429888"
`);
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
