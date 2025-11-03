# Dockerfile

FROM node:22-bullseye

# install dependencies
RUN apt-get update && apt-get install -y libaio1 unzip curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY install_oracle_client.sh ./
RUN chmod +x install_oracle_client.sh

RUN npm ci --production

COPY . .

EXPOSE 3004
CMD ["npm", "start"]
