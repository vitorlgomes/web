"use client";

import {
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Package,
  Phone,
  Plus,
  QrCode,
  User,
  UserCog,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TableData, TableOrder } from "@/app/dashboard/tables/page";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableDetailsProps {
  table: TableData | null;
  tableNumber: number;
  onOrderUpdated: () => void;
  onClose: () => void;
  onNewOrder: () => void;
}

interface OrderGroup {
  phone: string | null;
  userName: string | null;
  orders: TableOrder[];
  totalValue: number;
  hasPending: boolean;
}

export function TableDetails({
  table,
  tableNumber,
  onOrderUpdated,
  onClose,
  onNewOrder,
}: TableDetailsProps) {
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group orders by user phone, with pending orders first
  const orderGroups = useMemo<OrderGroup[]>(() => {
    if (!table) return [];

    const groupMap = new Map<string, OrderGroup>();

    // Sort orders: PENDING first, then by createdAt descending
    const sortedOrders = [...table.orders].sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    sortedOrders.forEach((order) => {
      const key = order.userPhone || "unknown";

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          phone: order.userPhone,
          userName: order.userName,
          orders: [],
          totalValue: 0,
          hasPending: false,
        });
      }

      const group = groupMap.get(key)!;
      group.orders.push(order);
      group.totalValue += order.totalValue;
      if (order.status === "PENDING") group.hasPending = true;
      if (order.userName && !group.userName) {
        group.userName = order.userName;
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => {
      // Groups with pending orders first
      if (a.hasPending && !b.hasPending) return -1;
      if (!a.hasPending && b.hasPending) return 1;
      // Then known phones
      if (a.phone && !b.phone) return -1;
      if (!a.phone && b.phone) return 1;
      return b.totalValue - a.totalValue;
    });
  }, [table]);

  // Initialize expanded groups - expand those with pending orders
  useEffect(() => {
    const initialExpanded = new Set<string>();
    orderGroups.forEach((group, index) => {
      const key = group.phone || `unknown-${index}`;
      if (group.hasPending) {
        initialExpanded.add(key);
      }
    });
    // If no pending, expand first group
    if (initialExpanded.size === 0 && orderGroups.length > 0) {
      initialExpanded.add(orderGroups[0].phone || "unknown-0");
    }
    setExpandedGroups(initialExpanded);
  }, [orderGroups]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleMarkAsDelivered = async (order: TableOrder) => {
    if (!confirm(`Marcar pedido #${order.id} como entregue?`)) return;

    setLoadingOrderId(order.id);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${order.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "DELIVERED" }),
        }
      );

      if (!response.ok) throw new Error("Erro ao marcar pedido como entregue");
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar pedido");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (order: TableOrder) => {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return;

    setLoadingOrderId(order.id);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${order.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "CANCELED",
            cancellationReason: "Cancelado pelo administrador",
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao cancelar pedido");
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleDeliverAll = async () => {
    if (!table) return;
    const pendingOrders = table.orders.filter((o) => o.status === "PENDING");
    if (pendingOrders.length === 0) return;

    if (
      !confirm(`Marcar todos os ${pendingOrders.length} pedidos pendentes como entregues?`)
    )
      return;

    setError(null);

    try {
      for (const order of pendingOrders) {
        setLoadingOrderId(order.id);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${order.id}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "DELIVERED" }),
          }
        );
        if (!response.ok) throw new Error(`Erro ao marcar pedido #${order.id}`);
      }
      onOrderUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar pedidos");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTypeBadge = (type: string) => {
    if (type === "qr_code") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
          <QrCode className="h-2.5 w-2.5" />
          QR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
        <UserCog className="h-2.5 w-2.5" />
        Manual
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
            <Clock className="h-2.5 w-2.5" />
            Pendente
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Entregue
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <Ban className="h-2.5 w-2.5" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const isEmpty = !table || table.orders.length === 0;
  const pendingCount = table?.orders.filter((o) => o.status === "PENDING").length || 0;
  const deliveredCount = table?.orders.filter((o) => o.status === "DELIVERED").length || 0;

  return (
    <DialogContent className="max-h-[85vh] max-w-xl overflow-hidden p-0 shadow-2xl">
      {/* Header */}
      <div className="relative border-b border-[#DAE5DA] bg-[#F1F7F2] px-5 py-4">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)]" />
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B0C0B] font-nohemi text-xl font-bold text-white shadow-md">
                {tableNumber}
              </div>
              <div>
                <DialogTitle className="font-nohemi text-lg font-semibold text-[#0B0C0B]">
                  Mesa {tableNumber}
                </DialogTitle>
                <DialogDescription className="mt-0.5 flex items-center gap-1.5 text-xs">
                  {isEmpty ? (
                    <span className="text-gray-500">Nenhum pedido</span>
                  ) : (
                    <>
                      <span className="text-gray-600">{table.orderCount} pedidos</span>
                      {pendingCount > 0 && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {deliveredCount > 0 && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          {deliveredCount} entregue{deliveredCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Total
              </div>
              <div className="font-nohemi text-xl font-bold text-[#0B0C0B]">
                R$ {(table?.totalValue || 0).toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>
        </DialogHeader>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-5 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </div>
      )}

      {/* Content */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center px-5 py-10">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="font-nohemi text-base font-medium text-gray-700">
            Mesa sem pedidos
          </h3>
          <p className="mt-1 text-center text-xs text-gray-500">
            Esta mesa não possui pedidos no momento.
          </p>
          <button
            onClick={onNewOrder}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#0B0C0B] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Criar Pedido
          </button>
        </div>
      ) : (
        <>
          {/* Orders List - Collapsible Groups */}
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {orderGroups.map((group, groupIndex) => {
                const groupKey = group.phone || `unknown-${groupIndex}`;
                const isExpanded = expandedGroups.has(groupKey);
                const groupPendingCount = group.orders.filter(
                  (o) => o.status === "PENDING"
                ).length;

                return (
                  <div key={groupKey} className="bg-white">
                    {/* Group Header - Clickable */}
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="group flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {group.phone ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B0C0B] text-white shadow-sm">
                            <Phone className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-white">
                            <User className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {group.phone || "Cliente não identificado"}
                            </span>
                            {group.userName && (
                              <span className="text-xs text-gray-400">
                                {group.userName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>
                              {group.orders.length} pedido
                              {group.orders.length !== 1 ? "s" : ""}
                            </span>
                            {groupPendingCount > 0 && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-amber-600">
                                  {groupPendingCount} pendente
                                  {groupPendingCount !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            R$ {group.totalValue.toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Orders - Collapsible */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-2 px-5 pb-4">
                        {group.orders.map((order) => {
                          const isPending = order.status === "PENDING";
                          const isCanceled = order.status === "CANCELED";

                          return (
                            <div
                              key={order.id}
                              className={`group/card rounded-lg border p-3 transition-all ${
                                isPending
                                  ? "border-amber-200 bg-amber-50/50"
                                  : isCanceled
                                  ? "border-gray-200 bg-gray-50 opacity-50"
                                  : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                              }`}
                            >
                              {/* Order Header Row */}
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-nohemi text-sm font-bold ${
                                      isPending ? "text-amber-700" : "text-gray-600"
                                    }`}
                                  >
                                    #{order.id}
                                  </span>
                                  {getOrderTypeBadge(order.type)}
                                  {getStatusBadge(order.status)}
                                </div>
                                <span className="text-[11px] text-gray-400">
                                  {formatDateTime(order.createdAt)}
                                </span>
                              </div>

                              {/* Products - Compact */}
                              <div className="mb-2 space-y-1">
                                {order.products.map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <span className="text-xs text-gray-400">×{product.quantity}</span>
                                      <span>{product.name}</span>
                                    </div>
                                    {product.comments && (
                                      <span className="max-w-[120px] truncate text-[10px] italic text-gray-400">
                                        {product.comments}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Footer - Price & Actions */}
                              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                <span className="font-nohemi text-sm font-semibold text-gray-900">
                                  R$ {order.totalValue.toFixed(2).replace(".", ",")}
                                </span>
                                {isPending && (
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleMarkAsDelivered(order)}
                                      disabled={loadingOrderId === order.id}
                                      className="flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:bg-gray-300"
                                    >
                                      <Check className="h-3 w-3" />
                                      {loadingOrderId === order.id ? "..." : "Entregar"}
                                    </button>
                                    <button
                                      onClick={() => handleCancelOrder(order)}
                                      disabled={loadingOrderId === order.id}
                                      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-500 transition-all hover:bg-gray-50 active:scale-95 disabled:bg-gray-100"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                Fechar
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onNewOrder}
                  className="flex items-center gap-1.5 rounded-lg border border-[#0B0C0B] bg-white px-3 py-2 text-sm font-medium text-[#0B0C0B] transition-all hover:bg-gray-50 active:scale-[0.98]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo Pedido
                </button>
                {pendingCount > 0 && (
                  <button
                    onClick={handleDeliverAll}
                    disabled={loadingOrderId !== null}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0B0C0B] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-400"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Entregar Todos
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  );
}
