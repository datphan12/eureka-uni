# 🎓 Eureka Uni

> Nền tảng học trực tuyến với **NestJS (Backend)** và **ReactJS (Frontend)**.  
> Cung cấp môi trường học tập, thảo luận và tương tác thời gian thực.

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-Backend-red?logo=nestjs" />
  <img src="https://img.shields.io/badge/React-Frontend-blue?logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/TailwindCSS-UI-06B6D4?logo=tailwindcss" />
</p>

## 🛠️ Công nghệ sử dụng

-   **Backend:**
    -   NestJS
    -   TypeORM
    -   PostgreSQL
    -   JWT Authentication
    -   Redis
    -
-   **Frontend:**
    -   ReactJS (Vite)
    -   TailwindCSS
    -   Zustand (state management)

## ⚙️ Cài đặt & chạy dự án

### 1. Clone dự án

```bash
git clone https://github.com/datphan12/eureka-uni
cd eureka-uni
```

### 2. Backend (NestJS)

```bash
cd be
npm install
npm run start:dev
```

### 3. Frontend (ReactJS)

```bash
cd fe
npm install
npm run dev
```

## 🌱 Biến môi trường

Cấu hình biến môi trường cho cả 2 dự án dự vào .env.example

## 🌐 API Endpoints

### 🔐 Authentication (`/auth`)

```bash
POST   /auth/login                    # Đăng nhập
POST   /auth/sign-up                  # Đăng ký tài khoản
POST   /auth/log-out                  # Đăng xuất
POST   /auth/refresh-token            # Làm mới token
GET    /auth/google                   # Đăng nhập Google
GET    /auth/google/callback          # Callback Google OAuth
GET    /auth/facebook                 # Đăng nhập Facebook
GET    /auth/facebook/callback        # Callback Facebook OAuth
GET    /auth/verify-email             # Xác thực email
GET    /auth/resend-verify-email      # Gửi lại email xác thực
GET    /auth/send-email-reset-password # Gửi email reset mật khẩu
GET    /auth/reset-password           # Reset mật khẩu
```

### 👤 Người Dùng (/nguoidung)

```bash
GET    /nguoidung                     # Lấy danh sách người dùng (phân trang)
GET    /nguoidung/all                 # Lấy tất cả người dùng
GET    /nguoidung/stats               # Thống kê người dùng
GET    /nguoidung/:id                 # Lấy thông tin chi tiết người dùng
GET    /nguoidung/search/course-and-blog # Tìm kiếm khóa học và blog
PATCH  /nguoidung/:id                 # Cập nhật thông tin người dùng
DELETE /nguoidung/:id                 # Xóa người dùng
POST   /nguoidung                     # Tạo người dùng mới
POST   /nguoidung/restore/:id         # Khôi phục người dùng đã xóa
POST   /nguoidung/email               # Gửi email
POST   /nguoidung/change-password     # Đổi mật khẩu
POST   /nguoidung/change-avatar       # Đổi avatar
POST   /nguoidung/update-info         # Cập nhật thông tin cá nhân
POST   /nguoidung/reset-password      # Reset mật khẩu
```

### 👥 Nhóm Học Tập (/nhom-hoc-tap)

```bash
GET    /nhom-hoc-tap                  # Lấy danh sách nhóm học tập
GET    /nhom-hoc-tap/stats            # Thống kê nhóm học tập
GET    /nhom-hoc-tap/search           # Tìm kiếm nhóm học tập
GET    /nhom-hoc-tap/yeu-cau-tham-gia # Lấy yêu cầu tham gia nhóm
GET    /nhom-hoc-tap/me               # Lấy nhóm của tôi
GET    /nhom-hoc-tap/thanh-vien       # Lấy danh sách thành viên
GET    /nhom-hoc-tap/tin-nhan-nhom    # Lấy tin nhắn trong nhóm
GET    /nhom-hoc-tap/:id              # Lấy thông tin chi tiết nhóm
PATCH  /nhom-hoc-tap/:id              # Cập nhật thông tin nhóm
DELETE /nhom-hoc-tap/thanh-vien       # Xóa thành viên khỏi nhóm
DELETE /nhom-hoc-tap/:id              # Xóa nhóm học tập
POST   /nhom-hoc-tap                  # Tạo nhóm học tập mới
POST   /nhom-hoc-tap/me               # Tham gia nhóm
POST   /nhom-hoc-tap/yeu-cau-tham-gia # Gửi yêu cầu tham gia nhóm
POST   /nhom-hoc-tap/xu-ly-yeu-cau-tham-gia # Xử lý yêu cầu tham gia
POST   /nhom-hoc-tap/me/leave         # Rời khỏi nhóm
```

### 📚 Khóa Học (/khoa-hoc)

```bash
GET    /khoa-hoc                      # Lấy danh sách khóa học
GET    /khoa-hoc/stats                # Thống kê khóa học
GET    /khoa-hoc/nguoi-dung           # Lấy khóa học của người dùng
GET    /khoa-hoc/:id                  # Lấy thông tin chi tiết khóa học
POST   /khoa-hoc/restore/:id          # Khôi phục khóa học đã xóa
PATCH  /khoa-hoc/:id                  # Cập nhật thông tin khóa học
DELETE /khoa-hoc/:id                  # Xóa khóa học
POST   /khoa-hoc                      # Tạo khóa học mới
```

### 🎥 Bài Giảng (/bai-giang)

```bash
GET    /bai-giang                     # Lấy danh sách bài giảng
GET    /bai-giang/ghi-chu             # Lấy ghi chú bài giảng
GET    /bai-giang/binh-luan           # Lấy bình luận bài giảng
GET    /bai-giang/doc                 # Đọc tài liệu bài giảng
POST   /bai-giang                     # Tạo bài giảng mới
POST   /bai-giang/ghi-chu             # Thêm ghi chú
POST   /bai-giang/binh-luan           # Thêm bình luận
POST   /bai-giang/update-lecture      # Cập nhật bài giảng
POST   /bai-giang/doc                 # Thêm tài liệu
DELETE /bai-giang/ghi-chu/:id         # Xóa ghi chú
DELETE /bai-giang/binh-luan/:id       # Xóa bình luận
DELETE /bai-giang/doc/:id             # Xóa tài liệu
DELETE /bai-giang/:id                 # Xóa bài giảng
```

### 📝 Bài Đăng (/bai-dang)

```bash
GET    /bai-dang                      # Lấy danh sách bài đăng
GET    /bai-dang/stats                # Thống kê bài đăng
GET    /bai-dang/nguoi-dung           # Lấy bài đăng của người dùng
GET    /bai-dang/:id                  # Lấy thông tin chi tiết bài đăng
POST   /bai-dang                      # Tạo bài đăng mới
POST   /bai-dang/phan-hoi             # Thêm phản hồi
POST   /bai-dang/like-or-dislike      # Like/dislike bài đăng
PUT    /bai-dang/:id                  # Cập nhật bài đăng
PUT    /bai-dang/:id/status           # Cập nhật trạng thái bài đăng
DELETE /bai-dang/:id                  # Xóa bài đăng
```

### 🤖 AI (/ai)

```bash
GET    /ai/recommend-courses          # Gợi ý khóa học
GET    /ai/recommend-groups           # Gợi ý nhóm học tập
GET    /ai/classify-blogs             # Phân loại blog
```

### 📁 File (/file)

```bash
POST   /file/upload                   # Upload file
DELETE /file/delete                   # Xóa file
```
