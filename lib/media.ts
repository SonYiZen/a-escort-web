/**
 * Supabase Storage 上傳輔助：girl-media 儲存桶
 * 路徑：lib/media.ts
 */

import { supabase } from "@/lib/supabase";

/** 儲存桶名稱（與 supabase/schema.sql 第 5 節一致） */
export const GIRL_MEDIA_BUCKET = "girl-media";

/** 允許的圖片類型 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** 允許的影片類型 */
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/** 單檔上限：圖片 10MB、影片 50MB */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export type MediaKind = "image" | "video";

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

/** 依 MIME 判斷是圖片或影片，並做類型＋大小檢查 */
export function validateMediaFile(file: File): {
  kind: MediaKind;
} {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error("只支援圖片（JPG/PNG/WebP/GIF）或影片（MP4/WebM/MOV）。");
  }
  const kind: MediaKind = isVideo ? "video" : "image";
  const limit = kind === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > limit) {
    const limitLabel = kind === "video" ? "50MB" : "10MB";
    throw new Error(`檔案過大（上限 ${limitLabel}），請壓縮後再上傳。`);
  }
  if (file.size === 0) {
    throw new Error("檔案是空的，請重新選擇。");
  }
  return { kind };
}

/** 依網址副檔名判斷是否為影片（前台顯示用） */
export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")
  );
}

/**
 * 上傳檔案到 girl-media，回傳公開網址與媒體類型
 * 流程：upload() → getPublicUrl()，呼叫端再把網址寫入 girls 表
 */
export async function uploadGirlMedia(file: File): Promise<{
  publicUrl: string;
  kind: MediaKind;
  path: string;
}> {
  const { kind } = validateMediaFile(file);

  // 路徑：girls/<timestamp>-<random>.<ext>，避免檔名碰撞
  const ext = getExtension(file.name);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `girls/${unique}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(GIRL_MEDIA_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) {
    // 常見：bucket 不存在 → 請先執行 schema.sql 第 5 節
    if (uploadError.message.includes("Bucket not found")) {
      throw new Error(
        "找不到 girl-media 儲存桶，請先到 Supabase SQL Editor 執行 supabase/schema.sql 第 5 節。",
      );
    }
    throw new Error(`上傳失敗：${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(GIRL_MEDIA_BUCKET)
    .getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("上傳成功但取不到公開網址，請檢查 bucket 是否設為公開。");
  }

  return { publicUrl: data.publicUrl, kind, path };
}

/** 主視覺配額：照片最多 6 張、影片最多 1 個 */
export const MAX_MAIN_IMAGES = 6;
export const MAX_MAIN_VIDEOS = 1;

/** 主視覺待上傳檔案（含本機預覽） */
export interface MainMediaDraft {
  images: File[];
  imagePreviews: string[];
  video: File | null;
  videoPreview: string | null;
}

export const EMPTY_MAIN_MEDIA: MainMediaDraft = {
  images: [],
  imagePreviews: [],
  video: null,
  videoPreview: null,
};

/**
 * 逐張上傳主視覺，回傳網址清單（照片在前、影片在後）
 * onProgress(current, total) 用於按鈕顯示進度
 */
export async function uploadMainMedia(
  draft: MainMediaDraft,
  onProgress?: (current: number, total: number) => void,
): Promise<string[]> {
  const total = draft.images.length + (draft.video ? 1 : 0);
  const urls: string[] = [];
  let done = 0;

  for (const file of draft.images) {
    const { publicUrl } = await uploadGirlMedia(file);
    urls.push(publicUrl);
    done += 1;
    onProgress?.(done, total);
  }
  if (draft.video) {
    const { publicUrl } = await uploadGirlMedia(draft.video);
    urls.push(publicUrl);
    done += 1;
    onProgress?.(done, total);
  }
  return urls;
}

/** 客評截圖專用：只允許圖片（JPG/PNG/WebP/GIF），上限 10MB */
export async function uploadReviewImage(file: File): Promise<{
  publicUrl: string;
  path: string;
}> {
  const { kind } = validateMediaFile(file);
  if (kind !== "image") {
    throw new Error("客評截圖只能上傳圖片（JPG/PNG/WebP/GIF）。");
  }
  const { publicUrl, path } = await uploadGirlMedia(file);
  return { publicUrl, path };
}

/** 數字價格 → "$3,200" 顯示文字 */
export function formatPriceLabel(price: number): string {
  return `$${Math.round(price).toLocaleString("en-US")}`;
}
