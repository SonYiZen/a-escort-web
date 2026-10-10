"use client";

/**
 * 後台共用：主視覺上傳器（照片最多 6 張、影片最多 1 個）
 * 路徑：components/admin/MainMediaUploader.tsx
 *
 * 兩種狀態：existingUrls（已上架網址，可刪除）＋ draft（本次新增待上傳）。
 * 上傳動作延到表單提交時統一執行，此元件只管選擇、配額與預覽。
 */

import {
  MAX_MAIN_IMAGES,
  MAX_MAIN_VIDEOS,
  type MainMediaDraft,
} from "@/lib/media";

const inputClass =
  "w-full rounded-xl border border-dashed border-amber-400/40 bg-black/40 px-3.5 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-300 file:to-yellow-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black";

export default function MainMediaUploader({
  existingUrls,
  onRemoveExisting,
  draft,
  onChange,
  onError,
}: {
  /** 已上架的主視覺網址（編輯用，新增時為空） */
  existingUrls: string[];
  onRemoveExisting: (index: number) => void;
  draft: MainMediaDraft;
  onChange: (next: MainMediaDraft) => void;
  onError: (message: string) => void;
}) {
  const imageCount = draft.images.length;
  const hasVideo = draft.video !== null;

  /** 照片多選：只收圖片，超過 6 張則截斷並提示 */
  function handleImagesSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const total = event.target.files ? event.target.files.length : 0;
    const files = Array.from(event.target.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length < total) {
      onError("照片區只能選擇圖片，影片請用下方的影片欄位上傳。");
    }
    const room = MAX_MAIN_IMAGES - imageCount;
    if (files.length > room) {
      onError(`照片最多 ${MAX_MAIN_IMAGES} 張，已自動保留前 ${room} 張。`);
    }
    const accepted = files.slice(0, Math.max(room, 0));
    const previews = accepted.map((f) => URL.createObjectURL(f));
    onChange({
      ...draft,
      images: [...draft.images, ...accepted],
      imagePreviews: [...draft.imagePreviews, ...previews],
    });
    event.target.value = "";
  }

  /** 影片單選：只收 1 個，重選則取代 */
  function handleVideoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      onError("影片欄位只能選擇影片（MP4/WebM/MOV）。");
      return;
    }
    if (hasVideo) {
      onError(`影片最多 ${MAX_MAIN_VIDEOS} 個，新選擇的已取代舊的。`);
      if (draft.videoPreview) URL.revokeObjectURL(draft.videoPreview);
    }
    onChange({
      ...draft,
      video: file,
      videoPreview: URL.createObjectURL(file),
    });
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(draft.imagePreviews[index]);
    onChange({
      ...draft,
      images: draft.images.filter((_, i) => i !== index),
      imagePreviews: draft.imagePreviews.filter((_, i) => i !== index),
    });
  }

  function removeVideo() {
    if (draft.videoPreview) URL.revokeObjectURL(draft.videoPreview);
    onChange({ ...draft, video: null, videoPreview: null });
  }

  return (
    <div className="space-y-4">
      {existingUrls.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] text-zinc-500">
            已上架（{existingUrls.length}）· 第一張為封面
          </p>
          <div className="grid grid-cols-3 gap-2">
            {existingUrls.map((url, index) => (
              <div
                key={`existing-${url}-${index}`}
                className="relative overflow-hidden rounded-xl border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`已上架主視覺 ${index + 1}`}
                  className="h-28 w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    封面
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveExisting(index)}
                  aria-label={`刪除已上架主視覺 ${index + 1}`}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-red-300 hover:bg-black/90"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-[11px] text-zinc-500">
          照片（{imageCount}/{MAX_MAIN_IMAGES}）· 第一張為封面
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImagesSelect}
          className={inputClass}
        />
        {draft.imagePreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {draft.imagePreviews.map((preview, index) => (
              <div
                key={`new-img-${preview}-${index}`}
                className="relative overflow-hidden rounded-xl border border-amber-400/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`待上傳照片 ${index + 1}`}
                  className="h-28 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`移除待上傳照片 ${index + 1}`}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-red-300 hover:bg-black/90"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[11px] text-zinc-500">
          影片（{hasVideo ? 1 : 0}/{MAX_MAIN_VIDEOS}）
        </p>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoSelect}
          className={inputClass}
        />
        {draft.video && draft.videoPreview && (
          <div className="relative mt-2 overflow-hidden rounded-xl border border-amber-400/40 bg-black/40">
            <video
              src={draft.videoPreview}
              controls
              playsInline
              className="max-h-48 w-full object-contain"
            />
            <p className="truncate px-3 py-2 text-[11px] text-zinc-500">
              {draft.video.name} · {(draft.video.size / 1024 / 1024).toFixed(2)}{" "}
              MB
            </p>
            <button
              type="button"
              onClick={removeVideo}
              aria-label="移除待上傳影片"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-red-300 hover:bg-black/90"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-zinc-500">
        圖片上限 10MB（JPG/PNG/WebP/GIF）· 影片上限 50MB（MP4/WebM/MOV）
      </p>
    </div>
  );
}
