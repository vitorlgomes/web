"use client";

import { Loader2 } from "lucide-react";
import React from "react";
import { useMediaQuery } from "react-responsive";
import useSWR from "swr";

import DashboardCard from "@/components/DashboardCard";
import CustomGraph from "@/components/Graph";
import { TopProductsCard } from "@/components/TopProductsCard";
import { Context } from "@/lib/context";

import { fetcher } from "../hooks/fetcher";
import withAuth from "../hooks/withAuth";

export type RevenueData = {
  date: string;
  revenue: number;
  isToday: boolean;
};

type Response = {
  revenueByDay: RevenueData[];
  totalOrdersByToday: number;
  totalOrdersPending: number;
  avarageTimeForOrdersFromTheWeek: number;
  top3MostSoldProducts: Array<{ name: string; sales: number }>;
};

function DashboardPage() {
  const { data: dashboardSummary, isValidating } = useSWR<Response>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/data`,
    fetcher,
  );
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });
  const { isOpen, setIsOpen } = React.useContext(Context);

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!isMobile ? (
        <h1 className="font-nohemi text-2xl font-medium">Dashboard</h1>
      ) : (
        <div className="flex flex-row justify-between">
          <h1 className="mb-8 font-nohemi text-2xl font-medium">Dashboard</h1>
          <div
            onClick={() => setIsOpen && setIsOpen(!isOpen)}
            className="flex-end"
          >
            Menu
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Pedidos ativos"
          value={dashboardSummary?.totalOrdersPending ?? 0}
          live={true}
          type="int"
        />
        <DashboardCard
          title="Receita no dia"
          icon="institutional"
          value={
            dashboardSummary?.revenueByDay?.find((item) => item.isToday)
              ?.revenue || 0
          }
          type="currency"
        />
        <DashboardCard
          icon="order"
          title="Número de pedidos no dia"
          value={dashboardSummary?.totalOrdersByToday || 0}
          type="int"
        />
        <DashboardCard
          icon="time"
          title="Tempo médio de pedidos em minutos"
          value={
            dashboardSummary?.avarageTimeForOrdersFromTheWeek || "Não definido"
          }
          type={
            dashboardSummary?.avarageTimeForOrdersFromTheWeek ? "int" : "text"
          }
        />
      </div>

      <div className="space-between md:flex-column flex lg:flex-row">
        <div className="mr-3 w-2/3 sm:w-full md:w-full">
          <CustomGraph
            data={dashboardSummary?.revenueByDay ?? []}
            title="Faturamento no Período"
          />
        </div>
        <div className="md:w-full lg:w-1/3">
          <TopProductsCard
            products={dashboardSummary?.top3MostSoldProducts || []}
          />
        </div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);
