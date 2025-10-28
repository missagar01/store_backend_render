#!/usr/bin/env bash
set -e

echo "📦 Installing Oracle Instant Client for Render..."

mkdir -p /opt/oracle
cd /opt/oracle

curl -O https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-23.3.0.23.09.zip
unzip instantclient-basic-linux.x64-23.3.0.23.09.zip
rm instantclient-basic-linux.x64-23.3.0.23.09.zip

echo "/opt/oracle/instantclient_23_3" > /etc/ld.so.conf.d/oracle-instantclient.conf
ldconfig

echo "✅ Oracle Instant Client installed successfully!"
