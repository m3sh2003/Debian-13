import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health endpoint
  app.get('/healthz', (req, res) => {
    res.json({
      status: 'ok',
      service: 'debian13-cloud-desktop-builder',
      version: '1.0.0-improved-reliability'
    });
  });

  // API endpoint for raw deploy script
  app.get('/api/deploy.sh', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`#!/usr/bin/env bash
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
  });

  // Gemini Multi-Turn Chatbot API
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, model, role } = req.body;
      const selectedModel = model || 'gemini-3.8-flash';

      let systemInstruction = 
        "You are the Debian 13 (Trixie) Cloud Desktop Engineering Assistant. You have expert knowledge of Debian chroot isolation (/srv/debian13), TigerVNC (:1 on port 5901), websockify (:6081), FastAPI gateway (:6080) with HTTP Basic Authentication (admin / 429888), PipeWire/PulseAudio audio sinks, and self-healing watchdog daemons. Maintain context across conversation turns, write clean idempotent bash scripts using set -euo pipefail, and guide the user through cloud desktop configuration and troubleshooting.";

      if (role === 'architect') {
        systemInstruction += " Role: Senior Linux Virtualization Architect. Focus on kernel pseudo-filesystems (/proc, /sys, /dev, /dev/pts), real entropy devices, and dynamic UID/GID security.";
      } else if (role === 'chaos') {
        systemInstruction += " Role: Autonomous Watchdog & Chaos Engineering Expert. Focus on automated process recovery, SIGKILL survival, state persistence in restart_counters.json, and health probes.";
      } else if (role === 'novnc') {
        systemInstruction += " Role: Remote Desktop & Streaming Protocol Specialist. Focus on RFB protocol, TigerVNC geometry, WebSocket tunneling via websockify, and low-latency WebAudio streaming.";
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          text: `[Debian 13 Systems Assistant]: I am ready to help you orchestrate, debug, and configure your Debian 13 Cloud Desktop environment. To enable live Gemini responses, ensure your GEMINI_API_KEY secret is configured in Settings > Secrets. In the meantime, you can inspect /workspace/debian13-server/scripts/boot.sh or run the 8-stage boot simulation!`,
          model: selectedModel
        });
      }

      // Convert conversation history into GenAI format
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            });
          }
        }
      }

      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: message || '' }]
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      res.json({
        text: response.text || 'No response generated.',
        model: selectedModel
      });
    } catch (err: any) {
      console.error('Gemini Chat API Error:', err);
      res.status(500).json({
        error: err.message || 'An error occurred while communicating with Gemini.'
      });
    }
  });

  // Mount Vite development middlewares
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Debian13-Server] Express + Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
