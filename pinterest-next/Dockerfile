FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY .env .env
RUN npx prisma generate

RUN npm install

# Build the app
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Run the app
FROM node:18-alpine AS runner
WORKDIR /app