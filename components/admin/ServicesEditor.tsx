"use client";

/**
 * 後台共用：服務內容編輯器（可增刪列）
 * 路徑：components/admin/ServicesEditor.tsx
 */

import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/60";

export default function ServicesEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    if (!draft.trim()) return;
    onChange([...value, draft.trim()]);
    setDraft("");
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateItem(index: number, text: string) {
    onChange(value.map((item, i) => (i === index ? text : item)));
  }

  return (
    <div className="space-y-2.5">
      {value.length === 0 && (
        <p className="text-xs text-zinc-500">尚未新增服務，前台將隱藏此區塊。</p>
      )}
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-[11px] font-black text-black"
            aria-hidden="true"
          >
            ✓
          </span>
          <input
            className={`${inputClass} flex-1`}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder="服務項目（例：精油SPA）"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label={`刪除第 ${index + 1} 個服務`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          className={`${inputClass} flex-1`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="＋ 新增服務項目，Enter 快速加入"
        />
        <button
          type="button"
          onClick={addItem}
          className="h-9 shrink-0 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 text-sm font-bold text-black active:scale-95"
        >
          新增
        </button>
      </div>
    </div>
  );
}
