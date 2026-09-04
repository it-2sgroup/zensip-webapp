-- ============================================================
-- SEED: organizations + brands cho SAIZA / SU Việt Nam
-- Project: SOVA (jjarzdxyarwobruzdqbg)
--
-- Vấn đề: ~25 khoá ngoại brand_id trên toàn hệ thống trỏ tới
-- bảng brands đang RỖNG. Dữ liệu thật (tiktok_orders, shopee_orders,
-- tiktok_ads_gmv_max_daily...) hiện dùng 2 UUID cố định làm brand_id
-- nhưng KHÔNG có bản ghi tương ứng trong brands:
--   00000000-0000-0000-0000-000000000010  → SAIZA
--   00000000-0000-0000-0000-000000000011  → SU Việt Nam
-- (xác nhận qua bảng `shops`, mỗi brand_id trên đã gắn ≥1 shop thật)
--
-- ⚠️ CHƯA APPLY. Hai điểm cần bạn xác nhận trước khi chạy:
--   1. organizations.type là NOT NULL, không có CHECK constraint
--      trong schema hiện tại → không biết tập giá trị hợp lệ.
--      Đoán 'agency' vì SISMO vận hành hộ nhiều brand — SỬA LẠI
--      nếu có quy ước khác.
--   2. Có đúng là chỉ 2 brand này, hay còn brand nào khác đang
--      hoạt động mà mình chưa thấy do bảng orders 100% NULL brand_id?
-- ============================================================

insert into public.organizations (id, name, type)
values
  ('00000000-0000-0000-0000-000000000001', 'SISMO', 'agency')
on conflict (id) do nothing;

insert into public.brands (id, organization_id, name, status)
values
  ('00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'SAIZA', 'active'),
  ('00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'SU Việt Nam', 'active')
on conflict (id) do nothing;

-- Sau khi chạy, kiểm tra lại còn brand_id nào "mồ côi" không:
--
-- select distinct t.brand_id
-- from tiktok_orders t
-- left join brands b on b.id = t.brand_id
-- where b.id is null and t.brand_id is not null;
