FROM node:22-bullseye

# Install system deps for oracle and unzip
RUN apt-get update && apt-get install -y libaio1 unzip curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci --production

# Copy rest of app
COPY . .

# Install Oracle Instant Client into /usr/local/oracle (writable in container)
RUN mkdir -p /usr/local/oracle \
    && cd /usr/local/oracle \
    && if [ -f /app/oracle/instantclient-basiclite-linux.x64.zip ]; then \
         unzip -o /app/oracle/instantclient-basiclite-linux.x64.zip ; \
       else \
         echo "instant client zip not found in repo: /app/oracle/instantclient-basiclite-linux.x64.zip"; \
         exit 1; \
       fi

ENV LD_LIBRARY_PATH=/usr/local/oracle/instantclient_21_10:$LD_LIBRARY_PATH
ENV OCI_LIB_DIR=/usr/local/oracle/instantclient_21_10

EXPOSE 3000
CMD ["npm", "start"]
