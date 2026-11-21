# ==========================================
# 萬象天儀 (CelestialDao) 全端一體化 Docker 映像檔
# 整合 Vue 3 前端、Node.js Express API、Prisma ORM 與 SQLite
# 單一服務啟動，單一對外連接埠: 5499
# ==========================================

# 階段 1: 基礎依賴與 pnpm 環境 (包含 Alpine 必備之 OpenSSL 與 libc 相容庫)
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g pnpm@12.14.0

# 階段 2: 原始碼編譯構建 (全端一體化)
FROM base AS builder
WORKDIR /app

# 複製 monorepo 配置與各模組 package.json 以善用 Docker 快取層
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json .npmrc ./
COPY packages/astro-core/package.json ./packages/astro-core/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY apps/admin/package.json ./apps/admin/

# 安裝依賴 (允許原生腳本並嚴格遵照鎖定檔)
RUN pnpm approve-builds --all && pnpm install --frozen-lockfile

# 複製各模組源碼
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
COPY apps/server/ ./apps/server/
COPY apps/admin/ ./apps/admin/

# 生成 Prisma Client、初始化乾淨的 SQLite 結構與預設種子資料，並編譯各套件與前端 SPA
WORKDIR /app/packages/database
RUN DATABASE_URL="file:/app/packages/database/prisma/dev.db" pnpm db:generate && \
    DATABASE_URL="file:/app/packages/database/prisma/dev.db" pnpm db:push && \
    DATABASE_URL="file:/app/packages/database/prisma/dev.db" pnpm db:seed && \
    pnpm build

WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/packages/astro-core
RUN pnpm build

WORKDIR /app/apps/web
RUN pnpm build

WORKDIR /app/apps/server
RUN pnpm build

# 將 @celestial/server 獨立打包部署至 /app/deployed (僅含生產依賴與編譯成果)
WORKDIR /app
RUN pnpm --filter @celestial/server --prod deploy /app/deployed
# 拷貝 builder 階段已生成的完整 Prisma Client (含 query engine 二進制) 至 deployed 依賴環境中，並清理重複的 .db 與本地 .env
RUN cp -r /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/* /app/deployed/node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/ && \
    rm -f /app/deployed/.env /app/deployed/node_modules/.pnpm/@celestial+database*/node_modules/@celestial/database/prisma/*.db*

# 階段 3: 精簡生產運行環境 (Runner - 單一服務 5499)
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5499
ENV DATABASE_URL="file:/app/packages/database/prisma/dev.db"
ENV SEED_TEMPLATE_DB_PATH="/app/seed-template.db"

# 建立非 root 安全用戶
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 celestial

# 拷貝獨立生產部署成果、預置資料庫種子模板 (防空 Volume 覆蓋) 與前端 SPA 靜態資源至 public
COPY --from=builder --chown=celestial:nodejs /app/deployed ./
COPY --from=builder --chown=celestial:nodejs /app/packages/database/prisma/dev.db ./seed-template.db
COPY --from=builder --chown=celestial:nodejs /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder --chown=celestial:nodejs /app/apps/web/dist ./public

# 確保 SQLite 資料庫與自動備份目錄具備非 root 寫入權限
RUN mkdir -p /app/packages/database/prisma/backups && chown -R celestial:nodejs /app/packages/database/prisma /app/seed-template.db

USER celestial

EXPOSE 5499

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5499/health || exit 1

CMD ["node", "dist/main.js"]
