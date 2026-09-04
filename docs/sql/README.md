# SQL nháp — chưa apply

Các file trong thư mục này viết cho project Supabase **SOVA** (`jjarzdxyarwobruzdqbg`),
nơi chứa dữ liệu bán hàng thật của SAIZA/SU (492K+ đơn TikTok, 128K+ đơn Shopee).

**Cố ý chưa chạy tự động** — đây là thay đổi trên cơ sở dữ liệu sản xuất đang có dữ
liệu kinh doanh thật, cần bạn tự chạy sau khi đọc qua từng file:

1. `0001_fix_dashboard_sync_state_rls.sql` — vá lỗ hổng bảo mật RLS. An toàn, không
   đụng dữ liệu đơn hàng.
2. `0002_seed_brands.sql` — tạo bản ghi `organizations`/`brands` còn thiếu. **Cần bạn
   xác nhận giá trị `organizations.type`** (đang đoán `'agency'`) trước khi chạy.
3. `0003_normalized_revenue.sql` — hàm chuẩn hoá trạng thái đơn (sửa lỗi lẫn tiếng
   Việt/Anh) + hàm tính doanh thu theo ngày dùng cho dashboard. An toàn, chỉ tạo hàm
   mới, không đổi dữ liệu.

Chạy trong **Supabase SQL Editor** của project SOVA, theo đúng thứ tự số. Sau khi
chạy xong, báo lại để mình nối `lib/supabase/saiza-client.ts` gọi `zensip_daily_revenue`
thay cho dữ liệu mẫu.
