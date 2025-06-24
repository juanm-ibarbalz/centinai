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
COPY ./entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE $PORT

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:$PORT"]