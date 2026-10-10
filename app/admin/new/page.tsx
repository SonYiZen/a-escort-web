"use client";

/**
 * 上架新增頁面：選擇本機圖片/影片 → 上傳至 girl-media → 取公開網址 → INSERT
 * 路徑：app/admin/new/page.tsx
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import PricingEditor, {
  type PricingDraft,
} from "@/components/admin/PricingEditor";
import ReviewsUploader, {
  type ReviewDraft,
} from "@/components/admin/ReviewsUploader";
import ServicesEditor from "@/components/admin/ServicesEditor";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  formatPriceLabel,
  uploadGirlMedia,
  uploadReviewImage,
} from "@/lib/media";
import type { GirlInsert } from "@/lib/girls";
import type { PricingPlan } from "@/types";

const REGIONS = ["新竹市", "竹北市", "竹東", "竹南"];
const NATIONALITIES = ["本島台妹", "溫柔越妹", "白皙泰妹", "熱情菲妹"];
const BUDGETS = ["3K↓", "3K - 4K", "4K - 6K", "6K以上"];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold tracking-wider text-amber-200/80">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/60";

export default function AdminNew() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [region, setRegion] = useState(REGIONS[1]);
  const [nationality, setNationality] = useState(NATIONALITIES[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [price, setPrice] = useState("3500");
  const [priceLabel, setPriceLabel] = useState("3.5K/1s");
  const [age, setAge] = useState("23");
  const [height, setHeight] = useState("163");
  const [weight, setWeight] = useState("48");
  const [cup, setCup] = useState("D");
  // 本機選擇的檔案（取代原本的 imageUrl 手填輸入框）
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isHot, setIsHot] = useState(false);

  // 基礎消費方案（預設三列，可增刪）
  const [pricing, setPricing] = useState<PricingDraft[]>([
    { label: "一節/50min/1S", price: "3200" },
    { label: "兩節/100min/2S", price: "6400" },
    { label: "三節送一節/200min/NS", price: "9600" },
  ]);
  // 服務內容（動態清單）
  const [services, setServices] = useState<string[]>([]);
  // 客評截圖（僅圖片）
  const [reviews, setReviews] = useState<ReviewDraft>({
    existingUrls: [],
    files: [],
    previews: [],
  });

  /** 選擇檔案：只取第一個，並產生本機預覽 */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setMediaFile(file);
    setMediaPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);
    if (!name.trim()) return setError("請輸入名字");
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      return setError("價格需為正整數");
    if (!Number.isFinite(ageNum) || ageNum < 18)
      return setError("年齡需為 18 以上整數");
    if (!mediaFile) return setError("請選擇要上傳的圖片或影片");

    setIsSubmitting(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error("尚未設定 Supabase 環境變數，無法上架。");
      }

      // 步驟 1：先上傳主視覺檔案到 girl-media
      setUploadProgress("上傳主視覺中…");
      const { publicUrl } = await uploadGirlMedia(mediaFile);

      // 步驟 2：逐張上傳客評截圖（僅圖片）
      let reviewUrls: string[] = [];
      if (reviews.files.length > 0) {
        setUploadProgress(`上傳客評截圖中（0/${reviews.files.length}）…`);
        reviewUrls = [];
        for (let i = 0; i < reviews.files.length; i++) {
          const { publicUrl: reviewUrl } = await uploadReviewImage(
            reviews.files[i],
          );
          reviewUrls.push(reviewUrl);
          setUploadProgress(
            `上傳客評截圖中（${i + 1}/${reviews.files.length}）…`,
          );
        }
      }

      // 步驟 3：整理基礎消費與服務內容（過濾空白列）
      const pricingPlans: PricingPlan[] = pricing
        .filter((p) => p.label.trim() !== "")
        .map((p) => {
          const priceValue = Math.round(Number(p.price)) || 0;
          return {
            label: p.label.trim(),
            price: priceValue,
            priceLabel: formatPriceLabel(priceValue),
          };
        });
      const serviceList = services
        .map((s) => s.trim())
        .filter((s) => s !== "");

      // 步驟 4：拿公開網址 + 身材數據一起寫入 girls 表
      setUploadProgress("寫入資料庫中…");
      const payload: GirlInsert = {
        name: name.trim(),
        region,
        nationality,
        price: Math.round(priceNum),
        price_label: priceLabel.trim() || `${(priceNum / 1000).toFixed(1)}K/1s`,
        age: Math.round(ageNum),
        height: Math.round(heightNum) || 160,
        weight: Math.round(weightNum) || 45,
        cup: cup.trim() || "C",
        image_url: publicUrl,
        price_range: budget,
        is_hot: isHot,
        gallery: [publicUrl],
        pricing: pricingPlans,
        services: serviceList,
        reviews: reviewUrls,
        is_active: true,
      };
      const { error: insertError } = await supabase
        .from("girls")
        .insert(payload);
      if (insertError) throw new Error(insertError.message);
      alert(`「${payload.name}」已上架！`);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上架失敗");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <header className="mb-5">
          <Link
            href="/admin"
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← 返回列表
          </Link>
          <h1 className="mt-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-xl font-black text-transparent">
            上架新增佳人
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="名字 *">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：閃亮亮"
              maxLength={20}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="地區 *">
              <select
                className={inputClass}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-[#0B0F19]">
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="國籍 *">
              <select
                className={inputClass}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              >
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n} className="bg-[#0B0F19]">
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="預算級距 *">
              <select
                className={inputClass}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                {BUDGETS.map((b) => (
                  <option key={b} value={b} className="bg-[#0B0F19]">
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="價格（整數 NT$） *">
              <input
                className={inputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="numeric"
                placeholder="3500"
              />
            </Field>
            <Field label="價位顯示（例 3.5K/1s）">
              <input
                className={inputClass}
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                placeholder="3.5K/1s"
              />
            </Field>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Field label="年齡 *">
              <input
                className={inputClass}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="身高cm">
              <input
                className={inputClass}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="體重kg">
              <input
                className={inputClass}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="罩杯">
              <input
                className={inputClass}
                value={cup}
                onChange={(e) => setCup(e.target.value)}
                maxLength={3}
              />
            </Field>
          </div>

          <Field label="主視覺檔案（圖片 / 影片） *">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-dashed border-amber-400/40 bg-black/40 px-3.5 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-300 file:to-yellow-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
            />
            <p className="mt-1.5 text-[11px] text-zinc-500">
              圖片上限 5MB（JPG/PNG/WebP/GIF），影片上限 50MB（MP4/WebM/MOV）
            </p>
          </Field>

          {/* 本機預覽：圖片用 img，影片用 video */}
          {mediaPreview && mediaFile && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {mediaFile.type.startsWith("video/") ? (
                <video
                  src={mediaPreview}
                  controls
                  playsInline
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaPreview}
                  alt="上傳預覽"
                  className="max-h-64 w-full object-contain"
                />
              )}
              <p className="truncate px-3 py-2 text-[11px] text-zinc-500">
                {mediaFile.name} · {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <label className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={isHot}
              onChange={(e) => setIsHot(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            設為熱門推薦（卡片顯示 🔥 徽章）
          </label>

          {/* 基礎消費方案 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 基礎消費方案
            </h3>
            <PricingEditor value={pricing} onChange={setPricing} />
          </div>

          {/* 服務內容 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 服務內容
            </h3>
            <ServicesEditor value={services} onChange={setServices} />
          </div>

          {/* 客評截圖（僅圖片） */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 客評截圖
            </h3>
            <ReviewsUploader
              value={reviews}
              onChange={setReviews}
              onError={setError}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 py-3.5 text-base font-black text-black shadow-[0_0_24px_rgba(251,191,36,0.4)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (uploadProgress ?? "上架中…") : "確認上架 ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}
