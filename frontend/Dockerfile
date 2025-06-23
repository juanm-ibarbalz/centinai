# 1) build
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm install
RUN VITE_API_URL=$VITE_API_URL npm run build

# 2) production
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app

COPY --from=build /app/dist ./dist

EXPOSE $PORT

CMD ["sh", "-c", "serve -s dist -l $PORT"]