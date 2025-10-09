# dir: ~/quangminh-smart-border/backend/Dockerfile

# --- STAGE 1: Build Stage ---
# SỬA Ở ĐÂY: Nâng cấp lên Node.js 20
FROM node:20-alpine AS builder

WORKDIR /app

# Chỉ sao chép các file quản lý dependency
COPY package.json package-lock.json ./

# Cài đặt tất cả dependencies để build
RUN npm install

# Sao chép toàn bộ source code
COPY src ./src
# Sao chép các file cấu hình build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Chạy lệnh build
RUN npm run build

# --- STAGE 2: Production Stage ---
# SỬA Ở ĐÂY: Nâng cấp lên Node.js 20
FROM node:20-alpine

WORKDIR /app

# Chỉ sao chép các file quản lý dependency
COPY package.json package-lock.json ./

# Cài đặt CHỈ các dependencies của production
RUN npm install --omit=dev

# Sao chép kết quả build từ stage builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["node", "dist/main"]