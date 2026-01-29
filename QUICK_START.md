# 🚀 Quick Start Guide - TineJobs

## ⚡ Cách chạy nhanh nhất

### 1. Setup Backend (Terminal 1)

```bash
cd server
npm install
```

**Tạo file `.env` trong thư mục `server/`:**

Tạo file mới tên `.env` và copy nội dung sau vào:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinejobs
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
```

**Chạy backend:**
```bash
npm run dev
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

---

### 2. Setup Frontend (Terminal 2 - Mở terminal mới)

```bash
cd client
npm install
npm start
```

✅ Frontend sẽ tự động mở tại: `http://localhost:3000`

---

## 📝 Lưu ý quan trọng

### MongoDB Setup

**Option 1: MongoDB Local**
- Cài đặt MongoDB trên máy
- Chạy MongoDB service
- Sử dụng: `mongodb://localhost:27017/tinejobs`

**Option 2: MongoDB Atlas (Khuyến nghị)**
1. Đăng ký tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Thay `MONGODB_URI` trong `.env` bằng connection string từ Atlas
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/tinejobs?retryWrites=true&w=majority`

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "MongoDB connection failed"
- Kiểm tra MongoDB đang chạy (nếu dùng local)
- Kiểm tra connection string trong `.env`
- Nếu dùng Atlas, kiểm tra IP whitelist (cho phép 0.0.0.0/0 để test)

### Lỗi: "Port already in use"
- Đổi PORT trong file `.env` của server
- Hoặc kill process đang dùng port đó:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Lỗi: "react-scripts not found"
```bash
cd client
npm install react-scripts --save-dev
```

---

## ✅ Checklist trước khi chạy

- [ ] Đã cài Node.js (v14+)
- [ ] Đã cài MongoDB (local) hoặc có MongoDB Atlas account
- [ ] Đã tạo file `.env` trong thư mục `server/`
- [ ] Đã chạy `npm install` trong cả `server/` và `client/`
- [ ] MongoDB đang chạy (nếu dùng local)

---

## 🎯 Test ứng dụng

1. Mở `http://localhost:3000`
2. Đăng ký tài khoản mới (chọn role: Applicant hoặc Employer)
3. Đăng nhập
4. Nếu là Applicant: Browse jobs và apply
5. Nếu là Employer: Tạo job mới từ Dashboard

---

## 📞 Cần giúp đỡ?

Xem file `SETUP.md` để biết hướng dẫn chi tiết hơn.

