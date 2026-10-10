"use client";

/**
 * 管理員後台首頁：全部佳人列表（含下架），支援上/下架切換與刪除
 * 路徑：app/admin/page.tsx
 *
 * 資料在瀏覽器掛載後才向 Supabase 查詢，建構期不執行，
 * 故無 env 時僅顯示提示，不會炸掉 build。
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { GirlRow } from "@/lib/girls";

export default function AdminHome() {
  const [rows, setRows] = useState<GirlRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  // 掛載後查詢一次：effect 內只「啟動」Promise，setState 發生在回呼中
  useEffect(() => {
    let cancelled = false;

    async function loadRows(): Promise<void> {
      try {
        if (!isSupabaseConfigured()) {
          throw new Error(
            "尚未設定 Supabase 環境變數，請先建立 .env.local 並填入金鑰後重新整理。",
          );
        }
        const response = await Promise.resolve(
          supabase
            .from("girls")
            .select("*")
            .order("created_at", { ascending: false }),
        );
        if (cancelled) return;
        if (response.error) throw new Error(response.error.message);
        setRows((response.data ?? []) as GirlRow[]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "載入失敗");
        setRows([]);
      }
    }

    void loadRows();
    return () => {
      cancelled = true;
    };
  }, []);

  /** 上/下架切換 */
  async function toggleActive(row: GirlRow) {
    setActingId(row.id);
    try {
      const { error: updateError } = await supabase
        .from("girls")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      setRows((prev) =>
        (prev ?? []).map((r) =>
          r.id === row.id ? { ...r, is_active: !r.is_active } : r,
        ),
      );
    } catch (err) {
      alert(`切換失敗：${err instanceof Error ? err.message : "未知錯誤"}`);
    } finally {
      setActingId(null);
    }
  }

  /** 刪除（二次確認） */
  async function removeRow(row: GirlRow) {
    if (!confirm(`確定刪除「${row.name}」？此動作無法復原。`)) return;
    setActingId(row.id);
    try {
      const { error: deleteError } = await supabase
        .from("girls")
        .delete()
        .eq("id", row.id);
      if (deleteError) throw new Error(deleteError.message);
      setRows((prev) => (prev ?? []).filter((r) => r.id !== row.id));
    } catch (err) {
      alert(`刪除失敗：${err instanceof Error ? err.message : "未知錯誤"}`);
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <header className="mb-5 flex items-center justify-between">
          <h1 className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-xl font-black text-transparent">
            後台管理 · 佳人列表
          </h1>
          <Link
            href="/admin/new"
            className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-2.5 text-sm font-bold text-black shadow-lg transition-transform active:scale-95"
          >
            ＋ 上架新增
          </Link>
        </header>

        {rows === null && !error ? (
          <div className="mt-16 flex flex-col items-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
            <p className="text-sm text-zinc-400">載入中…</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm leading-relaxed text-red-300">
            {error}
          </div>
        ) : (rows ?? []).length === 0 ? (
          <div className="mt-16 text-center text-sm text-zinc-500">
            目前沒有資料，
            <Link href="/admin/new" className="text-amber-300 underline">
              前往新增第一筆
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-zinc-500">
              共 {(rows ?? []).length} 筆（含下架中）
            </p>
            <ul className="space-y-3">
              {(rows ?? []).map((row) => {
                const busy = actingId === row.id;
                return (
                  <li
                    key={row.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {row.name}
                          <span className="ml-2 text-[11px] font-normal text-zinc-500">
                            {row.region} · {row.nationality} · {row.price_range}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          {row.price_label} · {row.age}歲 {row.height}cm{" "}
                          {row.cup}罩杯
                        </p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          row.is_active
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-zinc-500/15 text-zinc-400",
                        ].join(" ")}
                      >
                        {row.is_active ? "上架中" : "已下架"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleActive(row)}
                        className="flex-1 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400/20 disabled:opacity-50"
                      >
                        {busy ? "處理中…" : row.is_active ? "⏸ 下架" : "▶ 上架"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeRow(row)}
                        className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {busy ? "處理中…" : "🗑 刪除"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          <Link href="/" className="underline hover:text-zinc-400">
            ← 返回前台首頁
          </Link>
        </p>
      </div>
    </div>
  );
}
