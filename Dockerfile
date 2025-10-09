# dir: ~/quangmin-smart-border/backend/Dockerfile

# --- STAGE 1: Build Stage ---
# Sử dụng một image Node.js phiên bản Alpine (nhỏ gọn) làm môi trường build
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép các file package.json và package-lock.json trước
# Tận dụng cơ chế cache của Docker. Bước này chỉ chạy lại khi các file này thay đổi.
COPY package*.json ./

# Cài đặt tất cả các dependencies, bao gồm cả devDependencies để build
RUN npm install

# Sao chép toàn bộ source code của ứng dụng vào
COPY . .

# Chạy lệnh build để biên dịch TypeScript sang JavaScript
RUN npm run build

# Xóa các devDependencies để giảm kích thước node_modules
# `--omit=dev` là cách làm mới và hiệu quả hơn `npm prune --production`
RUN npm install --omit=dev


# --- STAGE 2: Production Stage ---
# Bắt đầu một image mới, sạch sẽ và nhỏ gọn hơn cho môi trường production
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt CHỈ các dependencies của môi trường production
# (Bước này rất nhanh vì các file đã có trong `node_modules` từ builder)
RUN npm install --omit=dev

# Sao chép kết quả build (thư mục dist) và node_modules từ stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Thư mục uploads chứa CVs, images, v.v. cần được sao chép
# Quan trọng: Nếu bạn muốn dữ liệu upload tồn tại lâu dài, bạn nên sử dụng Docker Volume cho thư mục này.
# Hiện tại, chúng ta sao chép nó để nó có sẵn trong image.
COPY --from=builder /app/uploads ./uploads

# Expose port mà ứng dụng sẽ chạy trên đó
EXPOSE 3000

# Lệnh để khởi động ứng dụng khi container chạy
# Chạy trực tiếp file main.js đã được biên dịch bằng node
CMD ["node", "dist/main"]