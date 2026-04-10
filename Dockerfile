# This Dockerfile is designed to be used to facilitate e2e tests using Playwright
# It can be used to run consistent screenshot UI tests across OS

FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.59.1

# Install xvfb for virtual display (Electron)
RUN apt-get update && apt-get install -y xvfb

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./ ./

# Ubuntu security: chrome-sandbox requires the SUID bit to run
# https://github.com/electron/electron/issues/42510
RUN chmod 4755 ./node_modules/electron/dist/chrome-sandbox

RUN npx electron-vite build && npx electron-builder --dir
