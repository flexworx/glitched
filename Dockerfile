# ============================================================
# GLITCHED.GG — Main Web Service Dockerfile
# Uses pre-built Next.js standalone output (built on host)
# ============================================================

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY public ./public

# Copy standalone build (pre-built on host via npm run build)
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

# Copy Prisma client
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma ./node_modules/@prisma

# Copy data files
COPY data ./data
COPY prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
