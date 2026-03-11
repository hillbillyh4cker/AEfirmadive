# AEfirmadive

**AEfirmadive** is a modern, high-density web interface designed to mimic the streamlined workflow and analytical depth of tools like **FirmADYNE** and **FirmAE**—with the added power of **Gemini AI Cognitive Reasoning**. 

Built for security researchers, this tool provides a visually tactical, dark-themed operational dashboard to upload firmware binaries, natively extract parameters via `strings` and `binwalk`, and correlate the findings instantaneously mapping vulnerabilities and boot structures using Google's Generative AI.

![AEfirmadive GUI](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000)

## Features
- **Native Static Extraction**: Hooks directly into your system's `binwalk` and `strings` utilities to carve firmware payloads and squashfs signatures seamlessly in the background.
- **Cognitive SecOps Reporting**: Pushes extraction outputs through a secure, localized connection to multiple AI models (**Gemini 2.5 Flash**, **OpenAI GPT-4o**, or **Anthropic Claude 3.5 Sonnet**), yielding beautifully formatted Markdown reports identifying credentials, legacy vulnerabilities, and potential dynamic emulation targets.
- **No-Distraction Interface**: Built with raw CSS flex-box modules. No messy animations. A pure HUD crafted specifically for maximum data legibility.

## Quick Start (Docker)

The fastest and safest way to run AEfirmadive is via Docker, which guarantees that `binwalk` and `strings` dependencies are pre-configured in their isolated sandbox.

```bash
# Clone the repository
git clone https://github.com/yourusername/aefirmadive.git
cd aefirmadive

# Build and start via Docker Compose
docker-compose up -d --build
```
*Access the console at http://localhost:3000*

If you do not have Docker Compose installed, you can orchestrate it manually:
```bash
docker build -t aefirmadive .
docker run -p 3000:3000 aefirmadive
```

## Manual Install (Bare Metal)

If you prefer to run the Next.js application natively on your host machine, you must ensure the backend OS-level dependencies are installed first.

### 1. Install Dependencies (Debian/Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y binwalk binutils
```

### 2. Install Node Packages
```bash
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```

## Configuration (AI Provider Keys)

For security purposes, AEfirmadive does **not** hardcode API keys or require `.env` files for basic operation. 
To enable the Cognitive Report mapping:
1. Open the UI at `http://localhost:3000`.
2. Click **CONFIG** in the top-right corner.
3. Select your provider (**Gemini**, **OpenAI**, or **Anthropic**).
4. Paste your API key from the respective provider platform.
5. Hit **SECURE SAVE**. The key is held cleanly in your browser's local storage and passed securely via the server proxy route.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Lucide Icons, React-Markdown.
- **Backend/API**: Next.js Node Routes, `child_process` (Native Bash bindings).
- **Styling**: Pure CSS + Standardized `Inter`/`IBM Plex Mono` variables.
- **AI**: `@google/generative-ai`, `openai`, and `@anthropic-ai/sdk` SDKs.
