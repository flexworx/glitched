FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY src/services/websocket ./src/services/websocket
COPY src/lib ./src/lib
COPY tsconfig.json ./
RUN npx tsc --noEmit || true
EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production
CMD ["node", "-r", "ts-node/register", "src/services/websocket/server.ts"]
