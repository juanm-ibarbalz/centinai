# 1) build
FROM node:20-alpine AS build
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

# 2) production
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["sh", "-c", "serve -s dist -l $PORT"]