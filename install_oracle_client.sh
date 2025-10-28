#!/usr/bin/env bash
set -e

echo "📦 Installing Oracle Instant Client locally..."

mkdir -p ./oracle
cd ./oracle

# Example for Instant Client Basic Lite
curl -O https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linux.x64-21.10.0.0.0dbru.zip
unzip -o instantclient-basiclite-linux.x64-21.10.0.0.0dbru.zip

# Add to PATH and LD_LIBRARY_PATH
export LD_LIBRARY_PATH=$(pwd)/instantclient_21_10:$LD_LIBRARY_PATH
export PATH=$(pwd)/instantclient_21_10:$PATH

echo "✅ Oracle client installed locally in ./oracle"
