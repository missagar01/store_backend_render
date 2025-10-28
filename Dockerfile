FROM node:22

RUN apt-get update && apt-get install -y libaio1 unzip curl

WORKDIR /app
COPY . .

RUN bash ./install_oracle_client.sh
RUN npm install

CMD ["npm", "start"]
