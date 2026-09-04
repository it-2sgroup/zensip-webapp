-- ============================================================
-- CHUẨN HOÁ TRẠNG THÁI ĐƠN + HÀM DOANH THU THEO NGÀY
-- Project: SOVA (jjarzdxyarwobruzdqbg)
--
-- Cạm bẫy đã phát hiện 04/09/2026: trạng thái đơn TikTok lẫn lộn
-- tiếng Việt và tiếng Anh do đổi ngôn ngữ API giữa các lần đồng bộ:
--   'Đã hoàn tất' (192.993 đơn, 19,68 tỷ)  ↔  'COMPLETED' (181.994 đơn, 17,70 tỷ)
--   'Đã hủy'      (27.008 đơn,  2,92 tỷ)   ↔  'CANCELLED' (19.990 đơn,  1,98 tỷ)
-- Lọc status='COMPLETED' một mình sẽ MẤT 19,68 tỷ doanh thu.
-- Shopee không bị lỗi này (order_status thuần tiếng Anh).
--
-- Toàn bộ 10 giá trị status thật của tiktok_orders và 9 giá trị
-- order_status thật của shopee_orders đã được liệt kê đầy đủ bên
-- dưói (không suy đoán) — xác nhận bằng GROUP BY trực tiếp trên DB.
--
-- ⚠️ CHƯA APPLY.
-- ============================================================

create or replace function public.zensip_normalize_tiktok_status(raw text)
returns text
language sql
immutable
as $$
  select case raw
    when 'Đã hoàn tất'        then 'completed'
    when 'COMPLETED'          then 'completed'
    when 'Đã hủy'             then 'cancelled'
    when 'CANCELLED'          then 'cancelled'
    when 'IN_TRANSIT'         then 'in_transit'
    when 'Đã vận chuyển'      then 'in_transit'
    when 'AWAITING_COLLECTION' then 'awaiting_collection'
    when 'AWAITING_SHIPMENT'  then 'awaiting_shipment'
    when 'DELIVERED'          then 'delivered'
    when 'UNPAID'             then 'unpaid'
    else 'unknown'
  end;
$$;

create or replace function public.zensip_normalize_shopee_status(raw text)
returns text
language sql
immutable
as $$
  select case raw
    when 'COMPLETED'          then 'completed'
    when 'CANCELLED'          then 'cancelled'
    when 'IN_CANCEL'          then 'cancelled'
    when 'SHIPPED'            then 'in_transit'
    when 'TO_CONFIRM_RECEIVE' then 'delivered'
    when 'PROCESSED'          then 'awaiting_shipment'
    when 'READY_TO_SHIP'      then 'awaiting_shipment'
    when 'TO_RETURN'          then 'returning'
    when 'UNPAID'             then 'unpaid'
    else 'unknown'
  end;
$$;

-- Hàm doanh thu theo ngày, gộp 2 sàn, ĐÃ chuẩn hoá trạng thái.
-- Mặc định chỉ tính đơn 'completed' — đổi p_include_all=true để
-- xem cả đơn chưa hoàn tất (dùng cho báo cáo vận hành, không dùng
-- cho số "doanh thu" chính thức).
create or replace function public.zensip_daily_revenue(
  p_brand_id uuid,
  p_from date,
  p_to date,
  p_include_all boolean default false
)
returns table (
  day date,
  platform text,
  order_count bigint,
  revenue numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (t.created_at_tiktok at time zone 'Asia/Ho_Chi_Minh')::date as day,
    'tiktok'::text as platform,
    count(*) as order_count,
    sum(t.total_amount) as revenue
  from tiktok_orders t
  where t.brand_id = p_brand_id
    and t.created_at_tiktok >= p_from
    and t.created_at_tiktok < p_to + 1
    and (p_include_all or public.zensip_normalize_tiktok_status(t.status) = 'completed')
  group by 1

  union all

  select
    (s.create_time at time zone 'Asia/Ho_Chi_Minh')::date as day,
    'shopee'::text as platform,
    count(*) as order_count,
    sum(s.total_amount) as revenue
  from shopee_orders s
  where s.brand_id = p_brand_id
    and s.create_time >= p_from
    and s.create_time < p_to + 1
    and (p_include_all or public.zensip_normalize_shopee_status(s.order_status) = 'completed')
  group by 1;
$$;

-- Cách gọi từ Next.js (Supabase JS): supabase.rpc('zensip_daily_revenue', {...})
--
-- select * from public.zensip_daily_revenue(
--   '00000000-0000-0000-0000-000000000010'::uuid, -- SAIZA
--   '2026-08-01'::date, '2026-08-31'::date
-- );
--
-- Quyền: hàm SECURITY DEFINER nên chạy với quyền người tạo (thường
-- là postgres), bỏ qua RLS của tiktok_orders/shopee_orders. Cân nhắc
-- thêm kiểm tra quyền trong thân hàm nếu sau này có nhiều brand và
-- không phải ai đăng nhập cũng được xem hết — hiện tại (đăng nhập =
-- xem tất cả) nên chưa cần.
