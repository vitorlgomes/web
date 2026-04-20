"use client";

import { ArrowRightLeft, X } from "lucide-react";
import { useMemo, useState } from "react";

import { TableData } from "@/app/dashboard/tables/page";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TableSlotState = "free" | "occupied" | "blocked" | "current";

interface MoveTableSheetProps {
  title: string;
  subtitle: string;
  currentTable: number;
  tables: TableData[];
  totalTables: number;
  onConfirm: (target: number) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function MoveTableSheet({
  title,
  subtitle,
  currentTable,
  tables,
  totalTables,
  onConfirm,
  onClose,
  isSubmitting = false,
}: MoveTableSheetProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const slots = useMemo(() => {
    const map = new Map<number, TableData>();
    tables.forEach((t) => map.set(t.tableNumber, t));

    return Array.from({ length: totalTables }, (_, i) => {
      const number = i + 1;
      const data = map.get(number);
      let state: TableSlotState = "free";

      if (number === currentTable) state = "current";
      else if (data?.tabStatus === "OPEN") state = "blocked";
      else if (data && data.orderCount > 0) state = "occupied";

      return { number, state, data };
    });
  }, [tables, totalTables, currentTable]);

  const handleConfirm = async () => {
    if (selected == null) return;
    await onConfirm(selected);
  };

  return (
    <DialogContent className="max-w-2xl overflow-hidden p-0">
      <DialogHeader className="border-b border-gray-100 px-5 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {subtitle}
        </div>
        <DialogTitle className="text-base font-semibold text-gray-900">
          {title}
        </DialogTitle>
      </DialogHeader>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-gray-300" />
            <span className="text-gray-500">Livre</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-gray-500">Ocupada</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-gray-500">Bloqueada (conta aberta)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300 ring-1 ring-gray-300" />
            <span className="text-gray-500">Atual</span>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {slots.map(({ number, state }) => {
            const isSelected = selected === number;
            const disabled = state === "current" || state === "blocked";

            const base =
              "relative aspect-square rounded-xl border text-sm font-semibold transition-all";
            let styles = "";

            if (state === "current") {
              styles =
                "border-gray-300 bg-gray-100 text-gray-400 ring-2 ring-gray-400 ring-offset-1 cursor-not-allowed";
            } else if (state === "blocked") {
              styles =
                "border-rose-200 bg-rose-50 text-rose-600 opacity-70 cursor-not-allowed";
            } else if (state === "occupied") {
              styles = isSelected
                ? "border-[#0B0C0B] bg-amber-50 text-amber-700 ring-2 ring-[#0B0C0B]"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400";
            } else {
              styles = isSelected
                ? "border-[#0B0C0B] bg-white text-gray-900 ring-2 ring-[#0B0C0B]"
                : "border-gray-200 bg-white text-gray-700 hover:border-[#0B0C0B] hover:shadow-sm";
            }

            return (
              <button
                key={number}
                disabled={disabled}
                onClick={() => setSelected(number)}
                title={
                  state === "blocked"
                    ? `Mesa ${number} já tem conta aberta`
                    : state === "current"
                      ? "Mesa atual"
                      : undefined
                }
                className={`${base} ${styles}`}
              >
                {number}
                {state === "current" && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-gray-600 px-1 text-[9px] font-bold text-white">
                    atual
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
          Cancelar
        </button>
        <button
          disabled={selected == null || isSubmitting}
          onClick={handleConfirm}
          className="flex items-center gap-1.5 rounded-lg bg-[#0B0C0B] px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          {isSubmitting
            ? "Movendo..."
            : selected != null
              ? `Mover para Mesa ${selected}`
              : "Selecione uma mesa"}
        </button>
      </div>
    </DialogContent>
  );
}
