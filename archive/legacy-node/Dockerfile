FROM node:20-alpine

WORKDIR /app/railway-api

COPY railway-api/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

WORKDIR /app
COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_ROOT=/app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e 'const port = process.env.PORT || 3000; fetch(`http://127.0.0.1:${port}/health`).then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))'

USER node

WORKDIR /app/railway-api

CMD ["npm", "start"]
