"use client";

import { TableData, TableStatus } from "@/app/dashboard/tables/page";

interface TableCircleProps {
  tableNumber: number;
  table: TableData | null;
  status: TableStatus;
  onClick: () => void;
  animationDelay?: number;
}

export function TableCircle({
  tableNumber,
  table,
  status,
  onClick,
  animationDelay = 0,
}: TableCircleProps) {
  const statusConfig = {
    recent: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-500",
      text: "text-white",
      shadow: "shadow-emerald-200",
      ring: "ring-emerald-300/50",
      badge: "bg-white text-emerald-600 shadow-sm",
      timeBg: "bg-emerald-600/90 text-white",
    },
    moderate: {
      bg: "bg-gradient-to-br from-amber-400 to-amber-500",
      text: "text-white",
      shadow: "shadow-amber-200",
      ring: "ring-amber-300/50",
      badge: "bg-white text-amber-600 shadow-sm",
      timeBg: "bg-amber-600/90 text-white",
    },
    urgent: {
      bg: "bg-gradient-to-br from-rose-400 to-rose-500",
      text: "text-white",
      shadow: "shadow-rose-200",
      ring: "ring-rose-300/50",
      badge: "bg-white text-rose-600 shadow-sm",
      timeBg: "bg-rose-600/90 text-white",
    },
    occupied: {
      bg: "bg-gradient-to-br from-blue-400 to-blue-500",
      text: "text-white",
      shadow: "shadow-blue-200",
      ring: "ring-blue-300/50",
      badge: "bg-white text-blue-600 shadow-sm",
      timeBg: "bg-blue-600/90 text-white",
    },
    empty: {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100",
      text: "text-gray-400",
      shadow: "shadow-gray-100",
      ring: "ring-gray-200/50",
      badge: "bg-gray-200 text-gray-500",
      timeBg: "bg-gray-200 text-gray-500",
    },
  };

  const config = statusConfig[status];
  const isEmpty = status === "empty";

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    return `${Math.floor(diffMins / 60)}h`;
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex aspect-square items-center justify-center rounded-xl
        ${config.bg} ${config.shadow}
        shadow-md ring-1 ${config.ring}
        transition-all duration-200 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        ${!isEmpty ? "hover:ring-2" : "hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-150"}
      `}
      style={{
        animation: `tableReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}ms both`,
      }}
    >
      {/* Subtle inner glow for active tables */}
      {!isEmpty && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      {/* Table Number */}
      <span className={`relative font-nohemi text-xl font-bold ${config.text} drop-shadow-sm`}>
        {tableNumber}
      </span>

      {/* Order count badge */}
      {!isEmpty && table && (
        <div
          className={`
            absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center
            rounded-full ${config.badge}
            text-[10px] font-bold
            ring-2 ring-white
            transition-transform group-hover:scale-110
          `}
        >
          {table.orderCount}
        </div>
      )}

      {/* Time indicator pill */}
      {!isEmpty && table && (
        <div
          className={`
            absolute -bottom-1.5 left-1/2 -translate-x-1/2
            rounded-full ${config.timeBg}
            px-2 py-0.5
            text-[9px] font-semibold
            shadow-sm ring-2 ring-white
            transition-transform group-hover:scale-105
          `}
        >
          {formatTime(table.oldestPendingOrderAt || table.lastOrderAt)}
        </div>
      )}

      <style jsx>{`
        @keyframes tableReveal {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </button>
  );
}
