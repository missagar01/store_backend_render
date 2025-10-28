#!/usr/bin/env bash
set -e
ROOT="$(pwd)"
INSTALL_DIR="$ROOT/oracle"

# If already present, skip
if [ -d "$INSTALL_DIR/instantclient_21_10" ]; then
  echo "Oracle Instant Client already installed in $INSTALL_DIR"
  exit 0
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# If you checked instantclient zip into repo, unzip it:
if [ -f instantclient-basiclite-linux.x64.zip ]; then
  echo "Unzipping instant client from repo..."
  unzip -o instantclient-basiclite-linux.x64.zip
else
  # Fallback: attempt to download (may require working link)
  echo "No local zip found. Attempting download — this may fail if Oracle requires login."
  curl -L -o instantclient-basiclite-linux.x64.zip "PUT_ORACLE_INSTANT_CLIENT_URL_HERE"
  unzip -o instantclient-basiclite-linux.x64.zip
fi

# Create symlink if necessary
if [ -d instantclient_21_10 ]; then
  echo "Instant client extracted."
else
  # if folder has a different name, attempt to find a folder
  ls -la
fi

# Make sure node-oracledb can find it at runtime by writing env export to .env.build (optional)
echo "LD_LIBRARY_PATH=$INSTALL_DIR/instantclient_21_10" > "$ROOT/.oracle_env"

echo "✅ Installed Oracle Instant Client to $INSTALL_DIR"
