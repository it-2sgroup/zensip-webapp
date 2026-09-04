import { NextResponse } from "next/server";
import { fetchComments, fetchVideoMeta, VideoFetchError } from "@/lib/tiktok";
import { AnalysisError, analyzeVideo } from "@/lib/video-analysis";

/**
 * Phân tích một video TikTok: lấy dữ liệu → gọi Claude → trả kết quả có cấu trúc.
 *
 * Chạy trên Node runtime (không phải Edge) vì SDK Anthropic cần Node API.
 * maxDuration 60s: bước gọi mô hình có thể mất vài chục giây với video nhiều
 * bình luận; mặc định 10s của Vercel là không đủ.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let url: string;

  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json(
        { error: "Thiếu link video." },
        { status: 400 },
      );
    }
    url = body.url.trim();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  try {
    const meta = await fetchVideoMeta(url);
    // Bình luận là phần bổ trợ — fetchComments đã tự nuốt lỗi và trả mảng rỗng
    const comments = await fetchComments(url);
    const analysis = await analyzeVideo(meta, comments);

    return NextResponse.json({
      meta,
      commentCount: comments.length,
      analysis,
    });
  } catch (err) {
    if (err instanceof VideoFetchError) {
      const status = err.code === "invalid_url" ? 400 : err.code === "not_found" ? 404 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    if (err instanceof AnalysisError) {
      const status =
        err.code === "rate_limit" ? 429 : err.code === "no_api_key" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    // Không rò rỉ chi tiết lỗi nội bộ ra client
    console.error("[phan-tich-video] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi khi phân tích. Thử lại sau." },
      { status: 500 },
    );
  }
}
