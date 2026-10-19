#!/usr/bin/env bash
# Runs the extension tests in a Linux container under xvfb, so no VS Code window opens on the host.
#
# Uses Finch if available, otherwise Docker. Override with CONTAINER_CLI=<cli>.
# Pass VSCODE_TEST_VERSION (e.g. 1.114.0) to test against a specific VS Code version.
#
# Platform-specific files are kept in named volumes rather than the host checkout:
# - node_modules: native bindings (e.g. rolldown) differ between macOS and Linux.
# - .vscode-test: the downloaded Linux VS Code build and test user data, including the
#   extension's global storage where coursier is downloaded.
# - ~/.cache: coursier's cache of the JVM and smithy-language-server.
# - ~/.npm: npm's download cache, to speed up `npm ci`.
# Remove them with: <cli> volume rm smithy-vscode-test-node-modules smithy-vscode-test-vscode \
#   smithy-vscode-test-cache smithy-vscode-test-npm
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
image="smithy-vscode-test:latest"

cli="${CONTAINER_CLI:-}"
if [ -z "$cli" ]; then
    for candidate in finch docker; do
        if command -v "$candidate" >/dev/null 2>&1; then
            cli="$candidate"
            break
        fi
    done
fi
if [ -z "$cli" ]; then
    echo "Neither finch nor docker was found. Install one, or set CONTAINER_CLI." >&2
    exit 1
fi

"$cli" build --quiet -t "$image" "$repo_root/tests/headless"

tty_args=()
if [ -t 0 ] && [ -t 1 ]; then
    tty_args=(-it)
fi

# ${arr[@]+...} avoids an "unbound variable" error for empty arrays under `set -u` in bash 3.2 (macOS).
"$cli" run --rm --init ${tty_args[@]+"${tty_args[@]}"} \
    -v "$repo_root:/workspace" \
    -v smithy-vscode-test-node-modules:/workspace/node_modules \
    -v smithy-vscode-test-vscode:/workspace/.vscode-test \
    -v smithy-vscode-test-cache:/home/node/.cache \
    -v smithy-vscode-test-npm:/home/node/.npm \
    -e VSCODE_TEST_VERSION="${VSCODE_TEST_VERSION:-stable}" \
    "$image" \
    bash -c 'npm ci --no-audit --no-fund &&
        # The container has no system bus, so point Electron at the session bus to avoid logging connection errors.
        dbus-run-session -- bash -c "DBUS_SYSTEM_BUS_ADDRESS=\$DBUS_SESSION_BUS_ADDRESS xvfb-run -a npm run test-extension"'
