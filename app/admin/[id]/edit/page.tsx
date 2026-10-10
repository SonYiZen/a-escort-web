"use client";

/**
 * 編輯佳人：載入既有資料 → 修改後 UPDATE（含三區塊）
 * 路徑：app/admin/[id]/edit/page.tsx
 */

import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { fetchAdminGirlRow, type GirlRow } from "@/lib/girls";
import type { PricingPlan } from "@/types";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/60";

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

interface EditPageProps {
  params: Promise<{ id: string }>;
}

function EditSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0B0F19] text-white">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
      <p className="text-sm text-zinc-400">載入資料中…</p>
    </div>
  );
}

/** 外層：同步殼，params 解析延到 Suspense 內層 */
export default function AdminEdit({ params }: EditPageProps) {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <AdminEditInner params={params} />
    </Suspense>
  );
}

/** 內層：實際表單（含 use(params) + 資料載入） */
function AdminEditInner({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [row, setRow] = useState<GirlRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [nationality, setNationality] = useState("");
  const [budget, setBudget] = useState("");
  const [price, setPrice] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [cup, setCup] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [pricing, setPricing] = useState<PricingDraft[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewDraft>({
    existingUrls: [],
    files: [],
    previews: [],
  });

  // 載入既有資料並填入表單
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!isSupabaseConfigured()) throw new Error("尚未設定環境變數。");
        const data = await fetchAdminGirlRow(id);
        if (cancelled) return;
        if (!data) {
          setLoadError("找不到這筆資料，可能已被刪除。");
          return;
        }
        setRow(data);
        setName(data.name ?? "");
        setRegion(data.region ?? "");
        setNationality(data.nationality ?? "");
        setBudget(data.price_range ?? "");
        setPrice(String(data.price ?? ""));
        setAge(String(data.age ?? ""));
        setHeight(String(data.height ?? ""));
        setWeight(String(data.weight ?? ""));
        setCup(data.cup ?? "");
        setIsHot(Boolean(data.is_hot));
        setIsActive(Boolean(data.is_active));
        setExistingImageUrl(data.image_url ?? "");
        setPricing(
          (data.pricing ?? []).map((p) => ({
            label: p.label,
            price: String(p.price),
          })),
        );
        setServices([...(data.services ?? [])]);
        setReviews({
          existingUrls: [...(data.reviews ?? [])],
          files: [],
          previews: [],
        });
        setLoaded(true);
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : "載入失敗");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleMainFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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
    if (!row) return;

    const priceNum = Number(price);
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);
    if (!name.trim()) return setError("請輸入名字");
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      return setError("價格需為正整數");
    if (!Number.isFinite(ageNum) || ageNum < 18)
      return setError("年齡需為 18 以上整數");

    setIsSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      if (mediaFile) {
        setProgress("上傳主視覺中…");
        const uploaded = await uploadGirlMedia(mediaFile);
        imageUrl = uploaded.publicUrl;
      }

      const reviewUrls = [...reviews.existingUrls];
      if (reviews.files.length > 0) {
        setProgress(`上傳客評截圖中（0/${reviews.files.length}）…`);
        for (let i = 0; i < reviews.files.length; i++) {
          const { publicUrl } = await uploadReviewImage(reviews.files[i]);
          reviewUrls.push(publicUrl);
          setProgress(`上傳客評截圖中（${i + 1}/${reviews.files.length}）…`);
        }
      }

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

      setProgress("寫入資料庫中…");
      const { error: updateError } = await supabase
        .from("girls")
        .update({
          name: name.trim(),
          region,
          nationality,
          price: Math.round(priceNum),
          // 價位顯示由價格自動產生（例：3500 → 3.5K/1s）
          price_label: `${(priceNum / 1000).toFixed(1)}K/1s`,
          age: Math.round(ageNum),
          height: Math.round(heightNum) || 160,
          weight: Math.round(weightNum) || 45,
          cup: cup.trim() || "C",
          image_url: imageUrl,
          price_range: budget,
          is_hot: isHot,
          is_active: isActive,
          gallery: [imageUrl],
          pricing: pricingPlans,
          services: serviceList,
          reviews: reviewUrls,
        })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      alert(`「${name.trim()}」已更新！`);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setIsSubmitting(false);
      setProgress(null);
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white">
        <div className="mx-auto w-full max-w-md px-4 py-6">
          <Link href="/admin" className="text-xs text-zinc-500">
            ← 返回列表
          </Link>
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
            {loadError}
          </p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0B0F19] text-white">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
        <p className="text-sm text-zinc-400">載入資料中…</p>
      </div>
    );
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
            編輯佳人 · {row?.name}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="名字 *">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <Field label="價格（整數 NT$） *">
            <input
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="3500"
            />
          </Field>

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

          <Field label="主視覺（不選則沿用舊圖）">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              onChange={handleMainFileChange}
              className="w-full rounded-xl border border-dashed border-amber-400/40 bg-black/40 px-3.5 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-300 file:to-yellow-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
            />
          </Field>
          {(mediaPreview || existingImageUrl) && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {mediaFile?.type.startsWith("video/") ? (
                <video
                  src={mediaPreview ?? undefined}
                  controls
                  playsInline
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaPreview ?? existingImageUrl}
                  alt="主視覺預覽"
                  className="max-h-64 w-full object-contain"
                />
              )}
              <p className="px-3 py-2 text-[11px] text-zinc-500">
                {mediaFile ? `新圖：${mediaFile.name}` : "目前使用既有圖片"}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 基礎消費方案
            </h3>
            <PricingEditor value={pricing} onChange={setPricing} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 服務內容
            </h3>
            <ServicesEditor value={services} onChange={setServices} />
          </div>

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

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="h-4 w-4 accent-amber-400"
              />
              熱門推薦 🔥
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
              上架中
            </label>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-300 via-sky-400 to-sky-300 py-3.5 text-base font-black text-black shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (progress ?? "更新中…") : "儲存變更 💾"}
          </button>
        </form>
      </div>
    </div>
  );
}
