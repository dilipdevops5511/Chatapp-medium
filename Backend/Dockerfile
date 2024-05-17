FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @aws-sdk/client-secrets-manager
COPY . .
EXPOSE 5000

CMD ["npm","start"]
