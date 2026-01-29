# Hướng dẫn Setup và Chạy TineJobs

## Bước 1: Setup Backend

1. **Vào thư mục server:**
```bash
cd server
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Tạo file `.env` trong thư mục `server/` với nội dung:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinejobs
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
```

**Lưu ý:** 
- Nếu bạn dùng MongoDB Atlas, thay `MONGODB_URI` bằng connection string từ Atlas
- Format: `mongodb+srv://username:password@cluster.mongodb.net/tinejobs?retryWrites=true&w=majority`

4. **Chạy server:**
```bash
# Development mode (với nodemon - auto restart)
npm run dev

# Hoặc production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## Bước 2: Setup Frontend

1. **Mở terminal mới, vào thư mục client:**
```bash
cd client
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Chạy frontend:**
```bash
npm start
```

Frontend sẽ tự động mở tại: `http://localhost:3000`

## Bước 3: Kiểm tra

1. Backend đang chạy tại `http://localhost:5000`
2. Frontend đang chạy tại `http://localhost:3000`
3. Truy cập `http://localhost:3000` để xem ứng dụng

## Troubleshooting

### Lỗi MongoDB Connection
- Đảm bảo MongoDB đang chạy (nếu dùng local)
- Kiểm tra connection string trong `.env`
- Nếu dùng MongoDB Atlas, kiểm tra IP whitelist

### Lỗi Port đã được sử dụng
- Thay đổi PORT trong file `.env` của server
- Hoặc kill process đang dùng port đó

### Lỗi npm install
- Xóa `node_modules` và `package-lock.json`
- Chạy lại `npm install`

## Cấu trúc chạy

```
Terminal 1 (Backend):
cd server
npm run dev

Terminal 2 (Frontend):
cd client
npm start
```

