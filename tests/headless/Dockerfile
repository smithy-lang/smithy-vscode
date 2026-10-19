# Linux image for running the extension tests headlessly under xvfb, mirroring CI (.github/workflows/ci.yml).
# Used by tests/headless/run.sh.
FROM node:22-bookworm-slim

# - xvfb: virtual display for the VS Code (Electron) window.
# - dbus: session bus so Electron doesn't log dbus connection errors.
# - The remaining libraries are runtime dependencies of VS Code/Electron on Linux.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        dbus \
        dbus-x11 \
        xauth \
        xvfb \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libdrm2 \
        libgbm1 \
        libgtk-3-0 \
        libnss3 \
        libsecret-1-0 \
        libxkbfile1 \
        libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Electron refuses to run as root without --no-sandbox, so run as the image's unprivileged `node` user.
# Pre-create the directories that run.sh mounts as named volumes so they are owned by `node`.
RUN mkdir -p /workspace/node_modules /workspace/.vscode-test /home/node/.cache /home/node/.npm \
    && chown -R node:node /workspace /home/node

USER node
WORKDIR /workspace
