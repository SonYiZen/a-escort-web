"use client";

/**
 * 上架新增頁面：表單填寫後 INSERT 進 Supabase girls 表
 * 路徑：app/admin/new/page.tsx
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { GirlInsert } from "@/lib/girls";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [imageUrl, setImageUrl] = useState("/girls/girl-1.svg");
  const [isHot, setIsHot] = useState(false);

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
    if (!imageUrl.trim()) return setError("請輸入圖片網址");

    setIsSubmitting(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error("尚未設定 Supabase 環境變數，無法上架。");
      }
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
        image_url: imageUrl.trim(),
        price_range: budget,
        is_hot: isHot,
        gallery: [imageUrl.trim()],
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

          <Field label="圖片網址 *">
            <input
              className={inputClass}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/girls/girl-1.svg 或 https://…"
            />
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={isHot}
              onChange={(e) => setIsHot(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            設為熱門推薦（卡片顯示 🔥 徽章）
          </label>

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
            {isSubmitting ? "上架中…" : "確認上架 ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}
