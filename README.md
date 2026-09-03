# Zensip

Hệ thống nội bộ quản lý dữ liệu thương mại điện tử và công cụ vận hành TikTok Shop.
Triển khai trên Vercel, tên miền `zensip.vn`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Recharts · Supabase

## Module

| Module | Đường dẫn | Trạng thái |
|---|---|---|
| Tính lợi nhuận TikTok Shop | `/tinh-loi-nhuan` | ✅ Hoạt động đầy đủ (công thức + biểu phí thật) |
| Dashboard TMĐT | `/dashboard` | 🟡 Giao diện xong, đang dùng dữ liệu mẫu |
| Phân tích video | `/phan-tich-video` | ⏸ Chưa làm |
| Đăng nhập / phân quyền | `/login` | 🟡 Giao diện xong, chưa nối Supabase Auth |

## Chạy thử

```bash
npm install
npm run dev
```

## Ghi chú kỹ thuật

- **Bảng phí** `lib/fee-tree.json` — 30 ngành cấp 1, 230 cấp 2, **2.039 cấp 3**,
  mỗi lá là `[phí shop thường %, phí shop Mall %]`. Nguồn: TikTok Shop VN Seller
  University. Trích ngược từ công cụ cũ đang chạy tại `sismo.vn/tools/`.
- **Công thức lợi nhuận** `lib/profit.ts` — giữ nguyên từng phép tính của bản cũ
  để số ra khớp, có kiểm chứng bằng ca thử tính tay.
- **Màu biểu đồ** đã chạy qua bộ kiểm tra an toàn mù màu (CVD) trên đúng nền
  sáng `#ffffff` và nền tối `#141417` mà app dùng. Không đổi thứ tự slot màu —
  thứ tự chính là cơ chế đảm bảo an toàn.
- Giao diện tối là bộ màu **chọn riêng**, không phải đảo ngược tự động.
