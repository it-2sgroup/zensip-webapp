"use client";

import { useState } from "react";
import { Button, Card, CardHeader, TextField, cx } from "@/components/ui/primitives";
import { StatTile } from "@/components/ui/StatTile";
import { CHART_COLORS } from "@/components/charts/core/Parts";
import { fmtCompact, fmtInt, fmtPct } from "@/lib/format";
import type { VideoMeta } from "@/lib/tiktok";
import type { VideoAnalysis } from "@/lib/video-analysis";

interface Result {
  meta: VideoMeta;
  commentCount: number;
  analysis: VideoAnalysis;
}

export default function PhanTichVideoPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/phan-tich-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi khi phân tích.");
        return;
      }
      setResult(data as Result);
    } catch {
      setError("Không kết nối được máy chủ. Kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.022em] text-[var(--color-ink)]">
          Phân tích video
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Dán link video TikTok, hệ thống chấm điểm và gợi ý cải thiện
        </p>
      </div>

      <Card className="mb-4">
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <TextField
              type="url"
              inputMode="url"
              placeholder="https://www.tiktok.com/@tenkenh/video/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="flex-1"
              aria-label="Link video TikTok"
            />
            <Button type="submit" disabled={loading || !url.trim()} className="shrink-0 px-5">
              {loading ? "Đang phân tích…" : "Phân tích"}
            </Button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-[9px] border border-[var(--color-critical)]/25 bg-[var(--color-critical)]/7 px-3 py-2 text-[12.5px] text-[var(--color-critical)]"
            >
              {error}
            </p>
          )}
        </form>

        {loading && (
          <div className="mt-4 space-y-2 border-t border-[var(--color-line)] pt-4">
            {["Đang lấy dữ liệu video…", "Đang đọc bình luận…", "Đang phân tích…"].map(
              (t, i) => (
                <div key={t} className="flex items-center gap-2.5">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-brand)]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                  <span className="text-[12.5px] text-[var(--color-muted)]">{t}</span>
                </div>
              ),
            )}
          </div>
        )}
      </Card>

      {result && <Report result={result} />}

      {!result && !loading && (
        <p className="rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-3 text-[12px] leading-relaxed text-[var(--color-muted)]">
          <strong className="font-medium text-[var(--color-ink-2)]">Lưu ý về phạm vi:</strong>{" "}
          Công cụ này phân tích dựa trên tiêu đề, hashtag, chỉ số tương tác và bình luận —{" "}
          <strong className="font-medium">không đọc được lời thoại trong video</strong>. Bản
          cũ trên tools.sismo.vn bóc được phụ đề nhờ chạy yt-dlp trên máy chủ riêng; Vercel
          không chạy được chương trình đó. Cần chấm điểm kịch bản nói thì phải giữ máy chủ
          riêng cho phần này.
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function Report({ result }: { result: Result }) {
  const { meta, analysis, commentCount } = result;
  const rate = (n: number) => (meta.playCount > 0 ? (n / meta.playCount) * 100 : 0);

  const scoreTone =
    analysis.diem_tong >= 70
      ? CHART_COLORS.good
      : analysis.diem_tong >= 45
        ? CHART_COLORS.warning
        : CHART_COLORS.critical;

  return (
    <div className="space-y-4" style={{ animation: "zs-fade-up 300ms ease-out both" }}>
      {/* Điểm tổng — con số dẫn dắt cả báo cáo */}
      <div className="overflow-hidden rounded-[15px] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
          {meta.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.cover}
              alt=""
              className="h-[104px] w-[78px] shrink-0 rounded-[10px] border border-[var(--color-line)] object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[14px] font-medium leading-snug text-[var(--color-ink)]">
              {meta.title || "(video không có tiêu đề)"}
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-muted)]">
              @{meta.author}
              {meta.authorNickname && ` · ${meta.authorNickname}`} · {meta.durationSec} giây
            </p>
            {meta.hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {meta.hashtags.slice(0, 8).map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-[var(--color-line-strong)] px-2 py-[2px] text-[11px] text-[var(--color-ink-2)]"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11.5px] text-[var(--color-muted)]">Điểm tổng</p>
            <p
              className="text-[42px] font-semibold leading-none tracking-[-0.03em]"
              style={{ color: scoreTone }}
            >
              {analysis.diem_tong}
              <span className="text-[18px] font-medium text-[var(--color-muted)]">/100</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Lượt xem" value={fmtCompact(meta.playCount)} />
        <StatTile label="Thích" value={fmtCompact(meta.diggCount)} hint={fmtPct(rate(meta.diggCount), 2)} />
        <StatTile label="Bình luận" value={fmtCompact(meta.commentCount)} hint={fmtPct(rate(meta.commentCount), 2)} />
        <StatTile label="Chia sẻ" value={fmtCompact(meta.shareCount)} hint={fmtPct(rate(meta.shareCount), 2)} />
        <StatTile label="Lưu" value={fmtCompact(meta.collectCount)} hint={fmtPct(rate(meta.collectCount), 2)} />
      </div>

      <Card>
        <CardHeader title="Mở đầu video" hint="Khả năng giữ chân trong vài giây đầu" />
        <div className="flex items-start gap-4">
          <div className="shrink-0 text-center">
            <p
              className="text-[30px] font-semibold leading-none tracking-[-0.02em]"
              style={{
                color:
                  analysis.hook.diem >= 7
                    ? CHART_COLORS.good
                    : analysis.hook.diem >= 4
                      ? CHART_COLORS.warning
                      : CHART_COLORS.critical,
              }}
            >
              {analysis.hook.diem}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">/10</p>
          </div>
          <p className="flex-1 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
            {analysis.hook.nhan_xet}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <PointList
          title="Làm tốt"
          items={analysis.diem_manh}
          color={CHART_COLORS.good}
          mark="✓"
        />
        <PointList
          title="Cần cải thiện"
          items={analysis.diem_yeu}
          color={CHART_COLORS.critical}
          mark="!"
        />
      </div>

      <Card>
        <CardHeader title="Việc nên làm ở video sau" hint="Sắp theo mức ưu tiên" />
        <ol className="space-y-2.5">
          {analysis.goi_y.map((g, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={cx(
                  "mt-[1px] shrink-0 rounded-full border px-2 py-[2px] text-[10.5px] font-semibold uppercase tracking-[0.03em]",
                  g.uu_tien === "cao"
                    ? "border-[var(--color-critical)]/30 bg-[var(--color-critical)]/8 text-[var(--color-critical)]"
                    : g.uu_tien === "trung binh"
                      ? "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-[#8a6100] dark:text-[var(--color-warning)]"
                      : "border-[var(--color-line-strong)] bg-[var(--color-surface-2)] text-[var(--color-muted)]",
                )}
              >
                {g.uu_tien}
              </span>
              <span className="text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
                {g.noi_dung}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardHeader
          title="Phản ứng người xem"
          hint={
            commentCount > 0
              ? `Đọc ${commentCount} bình luận lấy được`
              : "Không lấy được bình luận cho video này"
          }
        />
        <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
          {analysis.phan_ung_khan_gia.tom_tat}
        </p>

        {analysis.phan_ung_khan_gia.trich_dan.length > 0 && (
          <ul className="mt-4 space-y-3 border-t border-[var(--color-line)] pt-4">
            {analysis.phan_ung_khan_gia.trich_dan.map((t, i) => (
              <li key={i}>
                <blockquote className="border-l-2 border-[var(--color-s1)] pl-3 text-[13px] italic leading-relaxed text-[var(--color-ink)]">
                  “{t.noi_dung}”
                </blockquote>
                <p className="mt-1 pl-3 text-[12px] text-[var(--color-muted)]">
                  → {t.y_nghia}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Kết luận" />
        <p className="text-[13.5px] leading-relaxed text-[var(--color-ink)]">
          {analysis.ket_luan}
        </p>
      </Card>

      <p className="text-[11.5px] leading-relaxed text-[var(--color-muted)]">
        Phân tích dựa trên tiêu đề, hashtag, chỉ số tương tác và{" "}
        {commentCount > 0 ? `${fmtInt(commentCount)} bình luận` : "không có bình luận"} —
        không bao gồm lời thoại trong video.
      </p>
    </div>
  );
}

function PointList({
  title,
  items,
  color,
  mark,
}: {
  title: string;
  items: string[];
  color: string;
  mark: string;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-[3px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
              style={{ background: color }}
            >
              {mark}
            </span>
            <span className="text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
              {it}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
