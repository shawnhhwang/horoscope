# ==========================================
# 萬象天儀 (CelestialDao) 全端一體化 Docker 映像檔
# 整合 Vue 3 前端、Node.js Express API、Prisma ORM 與 SQLite
# 單一服務啟動，單一對外連接埠: 5499
# ==========================================

# 階段 1: 基礎依賴與 pnpm 環境
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@12.14.0

# 階段 2: 原始碼編譯構建 (全端一體化)
FROM base AS builder
WORKDIR /app

# 複製 monorepo 配置與各模組 package.json 以善用 Docker 快取
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json .npmrc ./
COPY packages/astro-core/package.json ./packages/astro-core/
COPY packages/database/package.json ./packages/database/
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# 安裝依賴 (允許原生腳本並嚴格遵照鎖定檔)
RUN pnpm approve-builds --all && pnpm install --frozen-lockfile

# 複製各模組源碼
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
COPY apps/server/ ./apps/server/

# 生成 Prisma Client 並編譯各套件與前端
WORKDIR /app/packages/database
RUN pnpm db:generate && pnpm build

WORKDIR /app/packages/astro-core
RUN pnpm build

WORKDIR /app/apps/web
RUN pnpm build

WORKDIR /app/apps/server
RUN pnpm build

# 階段 3: 精簡生產運行環境 (Runner - 單一服務 5499)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5499

# 建立非 root 安全用戶
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 celestial
USER celestial

# 拷貝編譯成果與依賴 (含前端 SPA 靜態資源)
COPY --from=builder --chown=celestial:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=celestial:nodejs /app/packages ./packages
COPY --from=builder --chown=celestial:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=celestial:nodejs /app/apps/server/package.json ./package.json
COPY --from=builder --chown=celestial:nodejs /app/apps/web/dist ./public

EXPOSE 5499

CMD ["node", "dist/main.js"]
