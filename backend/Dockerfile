FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
EXPOSE $PORT

CMD ["sh", "-c", "npm start"]