#!/bin/bash
set -e

echo "Installing Oracle Instant Client..."

mkdir -p /opt/oracle
cd /opt/oracle

curl -L -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip
unzip instantclient-basiclite.zip
rm instantclient-basiclite.zip

export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_13:$LD_LIBRARY_PATH

echo "Oracle Instant Client installed."
