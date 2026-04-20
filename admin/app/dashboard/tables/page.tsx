"use client";

import axios from "axios";
import { Plus, RefreshCw, ShoppingBag } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { fetcher } from "@/app/hooks/fetcher";
import withAuth from "@/app/hooks/withAuth";
import { BackofficeOrderModal } from "@/components/BackofficeOrderModal";
import { TableCircle } from "@/components/TableCircle";
import { TableDetails } from "@/components/TableDetails";
import { Dialog } from "@/components/ui/dialog";
import { Category, Product } from "@/types/product";

import { SessionProps } from "../layout";

export interface TableOrder {
  id: number;
  totalValue: number;
  createdAt: string;
  status: string;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  tabId: number | null;
  userName: string | null;
  userPhone: string | null;
  type: "qr_code" | "backoffice";
  products: {
    id: number;
    name: string;
    quantity: number;
    comments: string | null;
    productVariations: {
      id: number;
      name: string;
      additionalPrice: number;
      group: string;
    }[];
  }[];
}

export interface TableData {
  tableNumber: number;
  totalValue: number;
  orderCount: number;
  lastOrderAt: string;
  oldestPendingOrderAt: string | null;
  tabId: number | null;
  tabStatus: "OPEN" | "CLOSED" | null;
  orders: TableOrder[];
}

export type TableStatus = "recent" | "moderate" | "urgent" | "occupied" | "empty";

const TABLE_COUNT_OPTIONS = [10, 20, 30] as const;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function MesasPage(props: SessionProps) {
  const [tableCount, setTableCount] = useState<10 | 20 | 30>(20);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isNewOrderWithoutTable, setIsNewOrderWithoutTable] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const tablesURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tables?shopId=${props.shopId}`;

  const { data: categories } = useSWR<Category[]>(
    props.shopId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories?shopId=${props.shopId}`
      : null,
    fetcher
  );

  const { data: products } = useSWR<Product[]>(
    props.shopId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?shopId=${props.shopId}&limit=100`
      : null,
    fetcher
  );

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleTableClick = useCallback((table: TableData | null, tableNumber: number) => {
    setSelectedTable(table);
    setSelectedTableNumber(tableNumber);
    setIsModalOpen(true);
  }, []);

  const handleOrderUpdated = useCallback(() => {
    toast.success("Pedido atualizado com sucesso");
    handleRefresh();
  }, [handleRefresh]);

  const handleOpenOrderModal = useCallback(() => {
    setIsNewOrderWithoutTable(false);
    setIsOrderModalOpen(true);
  }, []);

  const handleOpenNewOrderWithoutTable = useCallback(() => {
    setIsNewOrderWithoutTable(true);
    setSelectedTableNumber(null);
    setIsOrderModalOpen(true);
  }, []);

  const handleOrderCreated = useCallback(() => {
    toast.success("Pedido criado com sucesso");
    handleRefresh();
    setIsOrderModalOpen(false);
  }, [handleRefresh]);

  useEffect(() => {
    const fetchTables = async (isInitialLoad: boolean) => {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await axios.get(tablesURL);
        setTables(response.data);
        setLastUpdate(new Date());
      } catch (error) {
        toast.error("Erro ao carregar mesas");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    if (props.shopId) {
      const isInitialLoad = tables.length === 0 && loading;
      fetchTables(isInitialLoad);
    }
  }, [props.shopId, refreshTrigger, tablesURL]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTableNumber == null) return;
    const fresh = tables.find((t) => t.tableNumber === selectedTableNumber) || null;
    setSelectedTable(fresh);
  }, [tables, selectedTableNumber]);

  const getTimeStatus = useCallback((table: TableData | null): TableStatus => {
    if (!table || table.orderCount === 0) return "empty";

    const now = new Date();

    if (table.oldestPendingOrderAt) {
      const oldestPending = new Date(table.oldestPendingOrderAt);
      const diffMinutes = (now.getTime() - oldestPending.getTime()) / (1000 * 60);

      if (diffMinutes < 10) return "recent";
      if (diffMinutes < 20) return "moderate";
      return "urgent";
    }

    const hasRecentActiveOrder = table.orders.some((o) => {
      if (o.status === "CANCELED") return false;
      return now.getTime() - new Date(o.createdAt).getTime() < TWO_HOURS_MS;
    });
    if (hasRecentActiveOrder) return "occupied";

    return "empty";
  }, []);

  const tableDataMap = useMemo(() => {
    const map = new Map<number, TableData>();
    tables.forEach((table) => {
      map.set(table.tableNumber, table);
    });
    return map;
  }, [tables]);

  const allTables = useMemo(() => {
    return Array.from({ length: tableCount }, (_, i) => {
      const tableNumber = i + 1;
      const tableData = tableDataMap.get(tableNumber);
      return {
        tableNumber,
        data: tableData || null,
        status: getTimeStatus(tableData || null),
      };
    });
  }, [tableCount, tableDataMap, getTimeStatus]);

  const statusCounts = useMemo(() => {
    return {
      recent: allTables.filter((t) => t.status === "recent").length,
      moderate: allTables.filter((t) => t.status === "moderate").length,
      urgent: allTables.filter((t) => t.status === "urgent").length,
      empty: allTables.filter((t) => t.status === "empty").length,
    };
  }, [allTables]);

  // Calculate meaningful metrics
  const metrics = useMemo(() => {
    const now = new Date();

    // Tables with pending orders - need attention
    const needsAttention = tables.filter(t =>
      t.orders.some(o => o.status === "PENDING")
    ).length;

    // Tables with non-canceled orders in last 2 hours
    const occupied = tables.filter(t =>
      t.orders.some(o => {
        if (o.status === "CANCELED") return false;
        return (now.getTime() - new Date(o.createdAt).getTime()) < TWO_HOURS_MS;
      })
    ).length;

    // Free tables
    const free = tableCount - occupied;

    // Total pending orders
    const pendingOrders = tables.reduce((acc, t) =>
      acc + t.orders.filter(o => o.status === "PENDING").length, 0
    );

    return { needsAttention, occupied, free, pendingOrders };
  }, [tables, tableCount]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-nohemi text-3xl font-semibold tracking-tight text-[#0B0C0B]">
              Mesas
            </h1>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                Ao vivo
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table Count Selector */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {TABLE_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setTableCount(count)}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  tableCount === count
                    ? "bg-[#0B0C0B] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Needs Attention */}
        <div className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
          metrics.needsAttention > 0
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
            : "border-gray-100 bg-white"
        }`}>
          <div className="flex items-baseline justify-between">
            <span className={`font-nohemi text-3xl font-bold ${
              metrics.needsAttention > 0 ? "text-amber-600" : "text-gray-300"
            }`}>
              {metrics.needsAttention}
            </span>
            {metrics.needsAttention > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {metrics.pendingOrders} pedido{metrics.pendingOrders !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs font-medium ${
            metrics.needsAttention > 0 ? "text-amber-700" : "text-gray-400"
          }`}>
            Precisam atenção
          </p>
          {metrics.needsAttention > 0 && (
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-200/30" />
          )}
        </div>

        {/* Occupied */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <span className={`font-nohemi text-3xl font-bold ${
              metrics.occupied > 0 ? "text-[#0B0C0B]" : "text-gray-300"
            }`}>
              {metrics.occupied}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
              2h
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Ocupadas
          </p>
        </div>

        {/* Free */}
        <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4">
          <span className={`font-nohemi text-3xl font-bold ${
            metrics.free > 0 ? "text-emerald-500" : "text-gray-300"
          }`}>
            {metrics.free}
          </span>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Livres
          </p>
        </div>

        {/* New Order Without Table - CTA Card */}
        <button
          onClick={handleOpenNewOrderWithoutTable}
          className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 text-left transition-all duration-200 hover:border-[#0B0C0B] hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B0C0B] text-white shadow-sm transition-transform group-hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B0C0B]">Novo Pedido</p>
              <p className="text-[10px] text-gray-500">Balcão / Viagem</p>
            </div>
          </div>
          <Plus className="absolute right-3 top-3 h-4 w-4 text-gray-300 transition-colors group-hover:text-[#0B0C0B]" />
        </button>
      </div>

      {/* Status Pills - Time-based */}
      {(statusCounts.recent > 0 || statusCounts.moderate > 0 || statusCounts.urgent > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Tempo de espera:</span>
          {statusCounts.recent > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                {statusCounts.recent} <span className="text-emerald-600">&lt;10min</span>
              </span>
            </div>
          )}
          {statusCounts.moderate > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 ring-1 ring-amber-100">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-amber-700">
                {statusCounts.moderate} <span className="text-amber-600">10-20min</span>
              </span>
            </div>
          )}
          {statusCounts.urgent > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 ring-1 ring-rose-100">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs font-medium text-rose-700">
                {statusCounts.urgent} <span className="text-rose-600">&gt;20min</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tables Grid Container */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-5 shadow-sm">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
            {Array.from({ length: tableCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-gradient-to-br from-gray-100 to-gray-50"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3">
            {allTables.map(({ tableNumber, data, status }, index) => (
              <TableCircle
                key={tableNumber}
                tableNumber={tableNumber}
                table={data}
                status={status}
                onClick={() => handleTableClick(data, tableNumber)}
                animationDelay={index * 20}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-[11px]">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex-1">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Pedido pendente · tempo desde o mais antigo
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Até 10 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>10 a 20 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Mais de 20 min</span>
              </div>
            </div>
          </div>
          <div className="hidden h-full w-px bg-gray-100 sm:block" />
          <div className="flex-1">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Sem pedidos pendentes
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span>Ocupada (teve pedido nas últimas 2h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-gray-200 bg-white" />
                <span>Livre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedTableNumber && (
          <TableDetails
            table={selectedTable}
            tableNumber={selectedTableNumber}
            tables={tables}
            totalTables={tableCount}
            onOrderUpdated={handleOrderUpdated}
            onClose={() => setIsModalOpen(false)}
            onNewOrder={handleOpenOrderModal}
          />
        )}
      </Dialog>

      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <BackofficeOrderModal
          tableNumber={selectedTableNumber}
          shopId={props.shopId}
          categories={categories || []}
          products={products || []}
          onOrderCreated={handleOrderCreated}
          onClose={() => setIsOrderModalOpen(false)}
          allowNoTable={isNewOrderWithoutTable}
        />
      </Dialog>
    </div>
  );
}

export default withAuth(MesasPage);
