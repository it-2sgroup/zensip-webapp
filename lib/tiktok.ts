import "server-only";

/**
 * Lấy dữ liệu video TikTok qua tikwm.
 *
 * Vì sao dùng tikwm chứ không phải yt-dlp như công cụ cũ: yt-dlp là chương trình
 * nhị phân, không chạy được trên Vercel (không cài được binary, không có tiến
 * trình chạy lâu). tikwm là API HTTP thuần nên gọi được từ Route Handler.
 *
 * ĐÁNH ĐỔI PHẢI BIẾT: tikwm KHÔNG trả về phụ đề/lời thoại. Công cụ cũ dùng
 * yt-dlp để lấy phụ đề rồi cho Claude đọc kịch bản. Bản này phân tích dựa trên
 * tiêu đề, hashtag, chỉ số tương tác và bình luận — KHÔNG phải lời thoại trong
 * video. Cần phân tích kịch bản nói thì phải giữ worker yt-dlp trên VPS.
 */

const TIKWM_BASE = "https://www.tikwm.com";
const FETCH_TIMEOUT_MS = 20_000;

export interface VideoMeta {
  id: string;
  title: string;
  author: string;
  authorNickname: string;
  durationSec: number;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  createdAt: string;
  cover: string;
  region: string;
  musicTitle: string | null;
  hashtags: string[];
}

export interface VideoComment {
  text: string;
  likes: number;
}

/** Lỗi có thông điệp đọc được cho người dùng cuối */
export class VideoFetchError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_url"
      | "not_found"
      | "upstream_error"
      | "timeout",
  ) {
    super(message);
    this.name = "VideoFetchError";
  }
}

/** Chấp nhận link tiktok.com, vm.tiktok.com, vt.tiktok.com và link rút gọn */
export function isTikTokUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return /(^|\.)tiktok\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

async function tikwmFetch(path: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${TIKWM_BASE}${path}`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ZensipBot/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new VideoFetchError(
        `Nguồn dữ liệu trả về lỗi ${res.status}.`,
        "upstream_error",
      );
    }
    return await res.json();
  } catch (err) {
    if (err instanceof VideoFetchError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new VideoFetchError(
        "Nguồn dữ liệu phản hồi quá chậm. Thử lại sau.",
        "timeout",
      );
    }
    throw new VideoFetchError("Không kết nối được nguồn dữ liệu.", "upstream_error");
  } finally {
    clearTimeout(timer);
  }
}

/** Rút hashtag từ tiêu đề — TikTok không trả riêng trường này */
function extractHashtags(title: string): string[] {
  return Array.from(title.matchAll(/#([\p{L}\p{N}_]+)/gu)).map((m) => m[1]);
}

export async function fetchVideoMeta(url: string): Promise<VideoMeta> {
  if (!isTikTokUrl(url)) {
    throw new VideoFetchError(
      "Link không phải TikTok. Dán link dạng https://www.tiktok.com/@tenkenh/video/…",
      "invalid_url",
    );
  }

  const json = (await tikwmFetch(
    `/api/?url=${encodeURIComponent(url.trim())}`,
  )) as { code?: number; msg?: string; data?: Record<string, unknown> };

  if (json.code !== 0 || !json.data) {
    throw new VideoFetchError(
      "Không đọc được video này. Có thể video đã bị xoá, để riêng tư, hoặc link sai.",
      "not_found",
    );
  }

  const d = json.data;
  const author = (d.author ?? {}) as Record<string, unknown>;
  const music = (d.music_info ?? {}) as Record<string, unknown>;
  const title = String(d.title ?? "");
  const num = (v: unknown) => (typeof v === "number" ? v : 0);

  return {
    id: String(d.id ?? ""),
    title,
    author: String(author.unique_id ?? ""),
    authorNickname: String(author.nickname ?? ""),
    durationSec: num(d.duration),
    playCount: num(d.play_count),
    diggCount: num(d.digg_count),
    commentCount: num(d.comment_count),
    shareCount: num(d.share_count),
    collectCount: num(d.collect_count),
    createdAt: d.create_time
      ? new Date(num(d.create_time) * 1000).toISOString()
      : "",
    cover: String(d.cover ?? ""),
    region: String(d.region ?? ""),
    musicTitle: music.title ? String(music.title) : null,
    hashtags: extractHashtags(title),
  };
}

export async function fetchComments(
  url: string,
  count = 50,
): Promise<VideoComment[]> {
  try {
    const json = (await tikwmFetch(
      `/api/comment/list?count=${count}&cursor=0&url=${encodeURIComponent(url.trim())}`,
    )) as { code?: number; data?: { comments?: unknown[] } };

    if (json.code !== 0 || !json.data?.comments) return [];

    return json.data.comments
      .map((c) => {
        const o = c as Record<string, unknown>;
        return {
          text: String(o.text ?? "").trim(),
          likes: typeof o.digg_count === "number" ? o.digg_count : 0,
        };
      })
      .filter((c) => c.text.length > 0)
      .sort((a, b) => b.likes - a.likes);
  } catch {
    // Bình luận là phần bổ trợ — thiếu thì vẫn phân tích được, không làm hỏng cả luồng
    return [];
  }
}
