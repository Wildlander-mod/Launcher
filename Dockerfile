# This Dockerfile is designed to be used to facilitate e2e tests using Playwright
# It can be used to run consistent screenshot UI tests across OS

# Using a Python base image because the current node-sass version requires Python
# Once node-sass is removed, all Python requirements can be removed and the playwright base image can be used
# FROM mcr.microsoft.com/playwright:v1.52.0
FROM --platform=linux/amd64 mcr.microsoft.com/playwright/python

ARG APP_USER=app
ARG APP_HOME=/home/${APP_USER}

# Create app user and set up home directory
RUN groupadd -r ${APP_USER} && \
    useradd -r -g ${APP_USER} -m -d ${APP_HOME} ${APP_USER} && \
    mkdir -p ${APP_HOME}/.npm && \
    chown -R ${APP_USER}:${APP_USER} ${APP_HOME}

# Install Node.js 16.x directly
# Install xvfb to support virtual display for Electron
RUN apt-get update && \
    apt-get install -y curl gnupg xvfb build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR ${APP_HOME}

USER ${APP_USER}

# Install app dependencies
COPY --chown=${APP_USER}:${APP_USER} package*.json ./
RUN npm ci

# Copy the rest of the application
COPY --chown=${APP_USER}:${APP_USER} ./ ./

# Ubuntu has a security feature that prevents electron from running if the Chrome sandbox is not owned by root.
# Because this is a test file, ensure that is owned by root and continue
# https://github.com/electron/electron/issues/42510
USER root
RUN chown root ./node_modules/electron/dist/chrome-sandbox && \
    chmod 4755 ./node_modules/electron/dist/chrome-sandbox
USER ${APP_USER}

RUN npx electron-vite build && npx electron-builder --dir