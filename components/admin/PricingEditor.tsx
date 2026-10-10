"use client";

/**
 * 後台共用：基礎消費方案編輯器（可增刪列）
 * 路徑：components/admin/PricingEditor.tsx
 */

import { useState } from "react";

export interface PricingDraft {
  label: string;
  price: string;
}

const rowClass = "flex items-center gap-2";

const inputClass =
  "rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/60";

export default function PricingEditor({
  value,
  onChange,
}: {
  value: PricingDraft[];
  onChange: (next: PricingDraft[]) => void;
}) {
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPrice, setDraftPrice] = useState("");

  function addRow() {
    if (!draftLabel.trim()) return;
    const priceNum = Number(draftPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return;
    onChange([
      ...value,
      { label: draftLabel.trim(), price: String(Math.round(priceNum)) },
    ]);
    setDraftLabel("");
    setDraftPrice("");
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateRow(
    index: number,
    patch: Partial<PricingDraft>,
  ) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-2.5">
      {value.length === 0 && (
        <p className="text-xs text-zinc-500">尚未新增方案，前台將隱藏此區塊。</p>
      )}
      {value.map((row, index) => (
        <div key={index} className={rowClass}>
          <input
            className={`${inputClass} flex-1`}
            value={row.label}
            onChange={(e) => updateRow(index, { label: e.target.value })}
            placeholder="方案名稱（例：一節/50min/1S）"
          />
          <input
            className={`${inputClass} w-28`}
            value={row.price}
            onChange={(e) => updateRow(index, { price: e.target.value })}
            inputMode="numeric"
            placeholder="3200"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            aria-label={`刪除第 ${index + 1} 個方案`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          >
            ✕
          </button>
        </div>
      ))}
      <div className={rowClass}>
        <input
          className={`${inputClass} flex-1`}
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder="＋ 方案名稱"
        />
        <input
          className={`${inputClass} w-28`}
          value={draftPrice}
          onChange={(e) => setDraftPrice(e.target.value)}
          inputMode="numeric"
          placeholder="價格"
        />
        <button
          type="button"
          onClick={addRow}
          className="h-9 shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 text-sm font-bold text-black active:scale-95"
        >
          新增
        </button>
      </div>
    </div>
  );
}
