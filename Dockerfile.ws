FROM node:20-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY server ./server
COPY src/lib ./src/lib
COPY src/services ./src/services
COPY tsconfig.json ./
RUN npx tsc --noEmit || true
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production
CMD ["node", "-r", "ts-node/register", "server/index.ts"]
