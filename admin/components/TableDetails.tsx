"use client";

import {
  ArrowRightLeft,
  Check,
  ChevronRight,
  CreditCard,
  MoreVertical,
  Package,
  Plus,
  QrCode,
  Receipt,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TableData, TableOrder } from "@/app/dashboard/tables/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MoveTableSheet } from "./MoveTableSheet";

interface TableDetailsProps {
  table: TableData | null;
  tableNumber: number;
  tables: TableData[];
  totalTables: number;
  onOrderUpdated: () => void;
  onClose: () => void;
  onNewOrder: () => void;
}

type MoveTarget =
  | { kind: "tab"; tabId: number }
  | { kind: "order"; order: TableOrder }
  | null;

export function TableDetails({
  table,
  tableNumber,
  tables,
  totalTables,
  onOrderUpdated,
  onClose,
  onNewOrder,
}: TableDetailsProps) {
  const [activeTab, setActiveTab] = useState<"pedidos" | "conta">("pedidos");
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<MoveTarget>(null);
  const [moving, setMoving] = useState(false);
  const [closingTab, setClosingTab] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const pendingOrders = table?.orders.filter((o) => o.status === "PENDING") ?? [];
  const deliveredOrders =
    table?.orders.filter((o) => o.status === "DELIVERED") ?? [];
  const canceledOrders =
    table?.orders.filter((o) => o.status === "CANCELED") ?? [];

  const pendingCount = pendingOrders.length;
  const deliveredCount = deliveredOrders.length;
  const canceledCount = canceledOrders.length;

  const deliveredTotal = deliveredOrders.reduce((s, o) => s + o.totalValue, 0);
  const canceledTotal = canceledOrders.reduce((s, o) => s + o.totalValue, 0);
  const unpaidOrders =
    table?.orders.filter(
      (o) => o.status !== "CANCELED" && o.paymentStatus === "UNPAID",
    ) ?? [];
  const unpaidTotal = unpaidOrders.reduce((s, o) => s + o.totalValue, 0);

  const hasOpenTab = table?.tabStatus === "OPEN" && table?.tabId != null;

  const tabOrders =
    hasOpenTab && table
      ? table.orders.filter((o) => o.tabId === table.tabId)
      : [];
  const tabPending = tabOrders.filter((o) => o.status === "PENDING");
  const tabDelivered = tabOrders.filter((o) => o.status === "DELIVERED");
  const tabCanceled = tabOrders.filter((o) => o.status === "CANCELED");
  const tabPendingTotal = tabPending.reduce((s, o) => s + o.totalValue, 0);
  const tabDeliveredTotal = tabDelivered.reduce((s, o) => s + o.totalValue, 0);
  const tabCanceledTotal = tabCanceled.reduce((s, o) => s + o.totalValue, 0);
  const tabActiveCount = tabPending.length + tabDelivered.length;
  const canCloseTab = hasOpenTab && tabPending.length === 0;

  const apiCall = async (
    url: string,
    method: "PATCH",
    body?: unknown,
  ): Promise<Response> => {
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const handleMarkAsDelivered = async (order: TableOrder) => {
    setLoadingOrderId(order.id);
    setError(null);
    try {
      const res = await apiCall(`/order/${order.id}/status`, "PATCH", {
        status: "DELIVERED",
      });
      if (!res.ok) throw new Error("Erro ao marcar como entregue");
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (order: TableOrder) => {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return;
    setLoadingOrderId(order.id);
    setError(null);
    try {
      const res = await apiCall(`/order/${order.id}/status`, "PATCH", {
        status: "CANCELED",
        cancellationReason: "Cancelado pelo administrador",
      });
      if (!res.ok) throw new Error("Erro ao cancelar pedido");
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleDeliverAll = async () => {
    if (pendingOrders.length === 0) return;
    setError(null);
    try {
      for (const order of pendingOrders) {
        setLoadingOrderId(order.id);
        const res = await apiCall(`/order/${order.id}/status`, "PATCH", {
          status: "DELIVERED",
        });
        if (!res.ok) throw new Error(`Erro ao marcar pedido #${order.id}`);
      }
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCloseTab = async () => {
    if (!table?.tabId) return;
    if (
      !confirm(
        "Fechar a conta desta mesa? Todos os pedidos serão marcados como pagos.",
      )
    )
      return;
    setClosingTab(true);
    setError(null);
    try {
      const res = await apiCall(`/tabs/${table.tabId}/close`, "PATCH");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao fechar conta");
      }
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setClosingTab(false);
    }
  };

  const handleMoveConfirm = async (target: number) => {
    if (!moveTarget) return;
    setMoving(true);
    setError(null);
    try {
      const url =
        moveTarget.kind === "tab"
          ? `/tabs/${moveTarget.tabId}/move`
          : `/order/${moveTarget.order.id}/move`;
      const res = await apiCall(url, "PATCH", { table: target });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao mover");
      }
      setMoveTarget(null);
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setMoving(false);
    }
  };

  const formatMoney = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `há ${m}min`;
    const h = Math.floor(m / 60);
    return `há ${h}h ${m % 60}min`;
  };

  const typeBadge = (type: string) =>
    type === "qr_code" ? (
      <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
        <QrCode className="h-2.5 w-2.5" />
        QR
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 ring-1 ring-violet-100">
        <UserCog className="h-2.5 w-2.5" />
        Manual
      </span>
    );

  const paymentBadge = (paymentStatus: string) => {
    if (paymentStatus === "PAID")
      return (
        <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700 ring-1 ring-teal-100">
          <CreditCard className="h-2.5 w-2.5" />
          Pago
        </span>
      );
    if (paymentStatus === "REFUNDED")
      return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500 ring-1 ring-gray-200">
          Estornado
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-600 ring-1 ring-rose-100">
        <CreditCard className="h-2.5 w-2.5" />
        A pagar
      </span>
    );
  };

  const renderOrderRow = (order: TableOrder) => (
    <details
      key={order.id}
      className="group rounded-lg border border-gray-100 bg-gray-50/60 open:bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 hover:bg-gray-50">
        <div className="flex flex-wrap items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 transition-transform group-open:rotate-90" />
          <span className="font-mono text-xs font-semibold text-gray-700">
            #{order.id}
          </span>
          {typeBadge(order.type)}
          {paymentBadge(order.paymentStatus)}
          {order.tabId && (
            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
              <Receipt className="h-2.5 w-2.5" />
              Conta #{order.tabId}
            </span>
          )}
        </div>
        <span className="whitespace-nowrap text-xs font-semibold text-gray-700">
          {formatMoney(order.totalValue)}
        </span>
      </summary>
      {order.products.length > 0 && (
        <div className="space-y-1 border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
          {order.products.map((p) => {
            const variationText = (p.productVariations || [])
              .map((v) => v.name)
              .join(", ");
            const details = [variationText, p.comments]
              .filter(Boolean)
              .join(" · ");
            return (
              <div key={p.id} className="flex items-start justify-between gap-2">
                <span>
                  <span className="text-gray-400">×{p.quantity}</span>{" "}
                  {p.name.split(":R$")[0]}
                </span>
                {details && (
                  <span className="max-w-[180px] truncate italic text-gray-400">
                    {details}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </details>
  );

  const isEmpty = !table || table.orders.length === 0;

  return (
    <>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-0">
        {/* HEADER */}
        <div className="relative border-b border-gray-100 bg-gradient-to-b from-[#F6F9F6] to-white px-5 pt-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2 pr-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B0C0B] font-nohemi text-xl font-bold text-white shadow-sm">
                  {tableNumber}
                </div>
                <div>
                  <DialogTitle className="font-nohemi text-base font-semibold text-[#0B0C0B]">
                    Mesa {tableNumber}
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {hasOpenTab ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 ring-1 ring-blue-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Conta #{table!.tabId}
                        </span>
                        {table && (
                          <span className="text-gray-400">
                            {timeAgo(
                              table.oldestPendingOrderAt ?? table.lastOrderAt,
                            )}
                          </span>
                        )}
                      </>
                    ) : isEmpty ? (
                      <span className="text-gray-500">Nenhum pedido</span>
                    ) : (
                      <span className="text-gray-500">
                        {table!.orderCount} pedido
                        {table!.orderCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    {unpaidTotal > 0 ? "A pagar" : "Total"}
                  </div>
                  <div
                    className={`font-nohemi text-xl font-bold ${
                      unpaidTotal > 0 ? "text-rose-600" : "text-[#0B0C0B]"
                    }`}
                  >
                    {formatMoney(unpaidTotal > 0 ? unpaidTotal : table?.totalValue ?? 0)}
                  </div>
                </div>
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 active:scale-95"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNewOrder();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                        Novo pedido
                      </button>
                      {hasOpenTab && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setMoveTarget({
                              kind: "tab",
                              tabId: table!.tabId!,
                            });
                          }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          Mover conta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {!isEmpty && (
            <div className="mt-4 flex gap-5 px-1">
              <button
                onClick={() => setActiveTab("pedidos")}
                className={`pb-2.5 text-sm transition ${
                  activeTab === "pedidos"
                    ? "border-b-2 border-[#0B0C0B] font-semibold text-gray-900"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pedidos
                {pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
              {hasOpenTab && (
                <button
                  onClick={() => setActiveTab("conta")}
                  className={`pb-2.5 text-sm transition ${
                    activeTab === "conta"
                      ? "border-b-2 border-[#0B0C0B] font-semibold text-gray-900"
                      : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Conta
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-5 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}

        {/* CONTENT */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center px-5 py-10">
            <div className="mb-3 rounded-full bg-gray-100 p-3">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-nohemi text-base font-medium text-gray-700">
              Mesa sem pedidos
            </h3>
            <button
              onClick={onNewOrder}
              className="mt-5 flex items-center gap-2 rounded-lg bg-[#0B0C0B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Criar Pedido
            </button>
          </div>
        ) : activeTab === "pedidos" ? (
          <div className="flex-1 overflow-y-auto">
            {/* Priority: pending */}
            {pendingCount > 0 && (
              <div className="border-b border-amber-100 bg-amber-50/40 px-5 py-4">
                <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  Próxima ação · {pendingCount} pendente
                  {pendingCount !== 1 ? "s" : ""}
                </h3>
                <div className="space-y-2">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-amber-200 bg-white p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-gray-900">
                            #{order.id}
                          </span>
                          {typeBadge(order.type)}
                          {paymentBadge(order.paymentStatus)}
                          {order.tabId && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                              <Receipt className="h-2.5 w-2.5" />
                              Conta #{order.tabId}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {timeAgo(order.createdAt)}
                        </span>
                      </div>
                      <div className="mb-3 space-y-1 text-sm text-gray-700">
                        {order.products.map((p) => {
                          const variationText = (p.productVariations || [])
                            .map((v) => v.name)
                            .join(", ");
                          const details = [variationText, p.comments]
                            .filter(Boolean)
                            .join(" · ");
                          return (
                            <div key={p.id} className="flex items-start justify-between gap-2">
                              <span>
                                <span className="text-gray-400">×{p.quantity}</span>{" "}
                                {p.name.split(":R$")[0]}
                              </span>
                              {details && (
                                <span className="max-w-[180px] truncate text-[10px] italic text-gray-400">
                                  {details}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 flex items-center justify-between border-t border-amber-100 pt-3">
                        <span className="font-semibold text-gray-900">
                          {formatMoney(order.totalValue)}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMarkAsDelivered(order)}
                            disabled={loadingOrderId === order.id}
                            className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-white transition hover:bg-emerald-600 active:scale-95 disabled:bg-gray-300"
                          >
                            <Check className="h-4 w-4" />
                            {loadingOrderId === order.id ? "..." : "Entregar"}
                          </button>
                          <button
                            onClick={() =>
                              setMoveTarget({ kind: "order", order })
                            }
                            disabled={loadingOrderId === order.id}
                            title="Mover para outra mesa"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 active:scale-95"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={loadingOrderId === order.id}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 active:scale-95"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivered collapsed */}
            {deliveredCount > 0 && (
              <details className="group border-b border-gray-100" open={pendingCount === 0}>
                <summary className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 transition-transform group-open:rotate-90" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Entregues
                    </span>
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700">
                      {deliveredCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      {formatMoney(deliveredTotal)}
                    </span>
                    {(() => {
                      const deliveredUnpaid = deliveredOrders.filter(
                        (o) => o.paymentStatus === "UNPAID",
                      ).length;
                      return deliveredUnpaid > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-600 ring-1 ring-rose-100">
                          {deliveredUnpaid} a pagar
                        </span>
                      ) : null;
                    })()}
                  </div>
                </summary>
                <div className="space-y-1.5 px-5 pb-3">
                  {deliveredOrders.map((o) => renderOrderRow(o))}
                </div>
              </details>
            )}

            {/* Canceled collapsed */}
            {canceledCount > 0 && (
              <details className="group border-b border-gray-100">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 transition-transform group-open:rotate-90" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Cancelados
                    </span>
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">
                      {canceledCount}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 line-through">
                    {formatMoney(canceledTotal)}
                  </span>
                </summary>
                <div className="space-y-1.5 px-5 pb-3">
                  {canceledOrders.map((o) => renderOrderRow(o))}
                </div>
              </details>
            )}
          </div>
        ) : (
          /* CONTA pane */
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Conta #{table!.tabId}
                </span>
                {table && (
                  <span className="text-[11px] text-gray-500">
                    {timeAgo(table.oldestPendingOrderAt ?? table.lastOrderAt)}
                  </span>
                )}
              </div>
              <div className="font-nohemi text-3xl font-bold text-gray-900">
                {formatMoney(tabDeliveredTotal + tabPendingTotal)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {tabActiveCount} pedido{tabActiveCount !== 1 ? "s" : ""} ·{" "}
                {tabPending.length} pendente{tabPending.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="mb-4 space-y-1.5">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Subtotal entregue</span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(tabDeliveredTotal)}
                </span>
              </div>
              {tabPendingTotal > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                  <span className="text-amber-700">Subtotal pendente</span>
                  <span className="font-semibold text-amber-800">
                    {formatMoney(tabPendingTotal)}
                  </span>
                </div>
              )}
              {tabCanceledTotal > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm line-through">
                  <span className="text-gray-400">Cancelados</span>
                  <span className="text-gray-400">
                    {formatMoney(tabCanceledTotal)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCloseTab}
                disabled={!canCloseTab || closingTab}
                title={
                  !canCloseTab
                    ? "Entregue todos os pedidos pendentes antes de fechar"
                    : undefined
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0C0B] py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Receipt className="h-4 w-4" />
                {closingTab
                  ? "Fechando..."
                  : canCloseTab
                    ? "Fechar Conta"
                    : `Fechar Conta · ${pendingCount} pendente${pendingCount !== 1 ? "s" : ""}`}
              </button>
              <button
                onClick={() =>
                  setMoveTarget({ kind: "tab", tabId: table!.tabId! })
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Mover Conta para outra mesa
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {!isEmpty && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
            <div className="flex flex-1 justify-end">
              {pendingCount > 0 ? (
                <button
                  onClick={handleDeliverAll}
                  disabled={loadingOrderId !== null}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B0C0B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-400"
                >
                  <Check className="h-4 w-4" />
                  Entregar Todos ({pendingCount})
                </button>
              ) : hasOpenTab ? (
                <button
                  onClick={handleCloseTab}
                  disabled={closingTab}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B0C0B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-400"
                >
                  <Receipt className="h-4 w-4" />
                  {closingTab ? "Fechando..." : "Fechar Conta"}
                </button>
              ) : (
                <button
                  onClick={onNewOrder}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B0C0B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Novo Pedido
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Move sheet */}
      <Dialog
        open={moveTarget !== null}
        onOpenChange={(open) => !open && setMoveTarget(null)}
      >
        {moveTarget && (
          <MoveTableSheet
            title={
              moveTarget.kind === "tab"
                ? `Mover conta #${moveTarget.tabId}`
                : `Mover pedido #${moveTarget.order.id}`
            }
            subtitle={`De Mesa ${tableNumber} para...`}
            currentTable={tableNumber}
            tables={tables}
            totalTables={totalTables}
            onConfirm={handleMoveConfirm}
            onClose={() => setMoveTarget(null)}
            isSubmitting={moving}
          />
        )}
      </Dialog>
    </>
  );
}
