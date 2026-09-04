import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { VideoComment, VideoMeta } from "./tiktok";

/**
 * Phân tích video TikTok bằng Claude.
 *
 * Model mặc định là claude-opus-4-8 theo khuyến nghị của Anthropic — KHÔNG tự hạ
 * cấp để tiết kiệm chi phí, đó là quyết định của bạn. Công cụ cũ chạy Haiku;
 * muốn giữ vậy thì đặt ANTHROPIC_MODEL=claude-haiku-4-5 trong biến môi trường.
 */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/** Ràng buộc đầu ra để luôn nhận JSON đúng cấu trúc, không phải văn xuôi */
const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    diem_tong: {
      type: "integer",
      description: "Điểm tổng thể của video, thang 0-100",
    },
    hook: {
      type: "object",
      properties: {
        diem: { type: "integer", description: "Điểm mở đầu, thang 0-10" },
        nhan_xet: {
          type: "string",
          description: "Nhận xét về khả năng giữ chân trong 3 giây đầu",
        },
      },
      required: ["diem", "nhan_xet"],
      additionalProperties: false,
    },
    diem_manh: {
      type: "array",
      items: { type: "string" },
      description: "2-4 điểm làm tốt, mỗi ý một câu ngắn",
    },
    diem_yeu: {
      type: "array",
      items: { type: "string" },
      description: "2-4 điểm cần cải thiện, mỗi ý một câu ngắn",
    },
    goi_y: {
      type: "array",
      items: {
        type: "object",
        properties: {
          uu_tien: { type: "string", enum: ["cao", "trung binh", "thap"] },
          noi_dung: {
            type: "string",
            description: "Việc cụ thể nên làm ở video sau",
          },
        },
        required: ["uu_tien", "noi_dung"],
        additionalProperties: false,
      },
      description: "3-5 gợi ý hành động, sắp theo mức ưu tiên",
    },
    phan_ung_khan_gia: {
      type: "object",
      properties: {
        tom_tat: {
          type: "string",
          description:
            "Tóm tắt phản ứng qua bình luận. Nếu không có bình luận thì ghi rõ là không có dữ liệu.",
        },
        trich_dan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              noi_dung: { type: "string" },
              y_nghia: {
                type: "string",
                description: "Bình luận này cho biết điều gì về khách hàng",
              },
            },
            required: ["noi_dung", "y_nghia"],
            additionalProperties: false,
          },
          description: "0-4 bình luận đáng chú ý. Để mảng rỗng nếu không có bình luận.",
        },
      },
      required: ["tom_tat", "trich_dan"],
      additionalProperties: false,
    },
    ket_luan: {
      type: "string",
      description: "Một đoạn ngắn: video này nên nhân bản hay nên bỏ, vì sao",
    },
  },
  required: [
    "diem_tong",
    "hook",
    "diem_manh",
    "diem_yeu",
    "goi_y",
    "phan_ung_khan_gia",
    "ket_luan",
  ],
  additionalProperties: false,
} as const;

export interface VideoAnalysis {
  diem_tong: number;
  hook: { diem: number; nhan_xet: string };
  diem_manh: string[];
  diem_yeu: string[];
  goi_y: { uu_tien: "cao" | "trung binh" | "thap"; noi_dung: string }[];
  phan_ung_khan_gia: {
    tom_tat: string;
    trich_dan: { noi_dung: string; y_nghia: string }[];
  };
  ket_luan: string;
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly code: "no_api_key" | "rate_limit" | "api_error" | "refusal" | "bad_output",
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

const SYSTEM_PROMPT = `Bạn là chuyên gia phân tích video bán hàng TikTok Shop tại Việt Nam, làm việc cho agency SISMO.

Nhiệm vụ: đọc dữ liệu một video và chấm điểm khả năng bán hàng của nó, đưa ra góp ý cụ thể để video sau tốt hơn.

Nguyên tắc bắt buộc:
- Viết bằng tiếng Việt, giọng thẳng thắn như đồng nghiệp trao đổi, không khách sáo.
- Chỉ kết luận từ dữ liệu được cung cấp. KHÔNG bịa nội dung lời thoại, cảnh quay, hay sản phẩm nếu dữ liệu không nói tới.
- Bạn KHÔNG xem được hình ảnh và KHÔNG nghe được lời thoại của video. Bạn chỉ có tiêu đề, hashtag, chỉ số tương tác và bình luận. Khi nhận xét điều gì mà dữ liệu không đủ để kết luận, hãy nói rõ là chưa đủ dữ liệu thay vì đoán.
- Góp ý phải cụ thể và làm được ngay, không nói chung chung kiểu "cần hấp dẫn hơn".
- Đánh giá chỉ số theo tương quan, không theo con số tuyệt đối: tỷ lệ thích/lượt xem, bình luận/lượt xem, chia sẻ/lượt xem mới nói lên chất lượng.`;

function buildPrompt(meta: VideoMeta, comments: VideoComment[]): string {
  const pct = (n: number) =>
    meta.playCount > 0 ? `${((n / meta.playCount) * 100).toFixed(2)}%` : "—";

  const commentBlock =
    comments.length > 0
      ? comments
          .slice(0, 40)
          .map((c) => `- (${c.likes} thích) ${c.text}`)
          .join("\n")
      : "(không lấy được bình luận nào cho video này)";

  return `Phân tích video TikTok sau.

## Thông tin video
- Tiêu đề: ${meta.title || "(không có)"}
- Kênh: @${meta.author}${meta.authorNickname ? ` (${meta.authorNickname})` : ""}
- Thời lượng: ${meta.durationSec} giây
- Khu vực: ${meta.region || "không rõ"}
- Nhạc nền: ${meta.musicTitle ?? "không rõ"}
- Hashtag: ${meta.hashtags.length ? meta.hashtags.map((h) => `#${h}`).join(" ") : "(không có)"}

## Chỉ số tương tác
- Lượt xem: ${meta.playCount.toLocaleString("vi-VN")}
- Lượt thích: ${meta.diggCount.toLocaleString("vi-VN")} (${pct(meta.diggCount)} lượt xem)
- Bình luận: ${meta.commentCount.toLocaleString("vi-VN")} (${pct(meta.commentCount)} lượt xem)
- Chia sẻ: ${meta.shareCount.toLocaleString("vi-VN")} (${pct(meta.shareCount)} lượt xem)
- Lưu: ${meta.collectCount.toLocaleString("vi-VN")} (${pct(meta.collectCount)} lượt xem)

## Bình luận người xem (sắp theo lượt thích)
${commentBlock}`;
}

export async function analyzeVideo(
  meta: VideoMeta,
  comments: VideoComment[],
): Promise<VideoAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnalysisError(
      "Chưa cấu hình ANTHROPIC_API_KEY trên máy chủ.",
      "no_api_key",
    );
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      // Thinking thích ứng: để Claude tự quyết định cần suy luận sâu tới đâu.
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
      },
      messages: [{ role: "user", content: buildPrompt(meta, comments) }],
    });

    // Kiểm tra stop_reason TRƯỚC khi đọc content — khi bị từ chối, content rỗng
    if (response.stop_reason === "refusal") {
      throw new AnalysisError(
        "Nội dung video này không phân tích được vì lý do an toàn.",
        "refusal",
      );
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new AnalysisError("Mô hình không trả về kết quả.", "bad_output");
    }

    // output_config.format bảo đảm JSON hợp lệ đúng schema
    return JSON.parse(textBlock.text) as VideoAnalysis;
  } catch (err) {
    if (err instanceof AnalysisError) throw err;

    if (err instanceof Anthropic.RateLimitError) {
      throw new AnalysisError(
        "Hệ thống đang quá tải yêu cầu. Thử lại sau ít phút.",
        "rate_limit",
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AnalysisError("Khoá API không hợp lệ.", "no_api_key");
    }
    if (err instanceof SyntaxError) {
      throw new AnalysisError("Kết quả trả về không đọc được.", "bad_output");
    }
    if (err instanceof Anthropic.APIError) {
      throw new AnalysisError(
        `Lỗi khi gọi mô hình (${err.status ?? "?"}). Thử lại sau.`,
        "api_error",
      );
    }
    throw new AnalysisError("Lỗi không xác định khi phân tích.", "api_error");
  }
}
