"use client";

import DashboardCard from "@/components/DashboardCard";
import { DashboardRevenueChart } from "@/components/DashboardRevenueChart";
import useSWR from "swr";
import withAuth from "../hooks/withAuth";
import { fetcher } from "../hooks/fetcher";
import { useMediaQuery } from "react-responsive";
import { Context } from "./layout";
import React from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import CustomGraph from "@/components/Graph";

type Response = {
  revenueByDay: RevenueData[];
  totalOrdersByToday: number;
  totalOrdersPending: number;
  avarageTimeForOrdersFromTheWeek: number;
  top3MostSoldProducts: Array<{ name: string; sales: number }>;
};

export type RevenueData = {
  date: string;
  revenue: number;
  isToday: boolean;
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
            data={dashboardSummary?.revenueByDay ?? [
              { date: "01/01", revenue: 1200 },
              { date: "02/01", revenue: 1500 },
              { date: "03/01", revenue: 1700 },
              { date: "04/01", revenue: 1400 },
              { date: "05/01", revenue: 1900 },
              { date: "06/01", revenue: 2100 },
              { date: "07/01", revenue: 2300 },
            ]}
            title="Faturamento no Período"
            subtitle="01/01/2025 - 07/01/2025"
          />
        </div>
        <div className="md:w-full lg:w-1/3">
          <TopProductsCard
            products={dashboardSummary?.top3MostSoldProducts || []}
          />
        </div>

        {/* <DashboardPopularProductsChart /> */}
      </div>
    </>
  );
}

type Product = {
  name: string;
  sales: number;
};

type Props = {
  products: Product[];
};

export function TopProductsCard({ products }: Props) {
  return (
    <div className="h-full rounded-lg bg-[#FAF9F6] p-6">
      <CardTitle className="mb-6 font-nohemi text-base font-medium text-gray-800">
        Produtos mais vendidos no mês
      </CardTitle>
      <ul className="space-y-4">
        {products.slice(0, 3).map((product, index) => (
          <li
            key={index}
            className="flex items-center justify-between border-b pb-4 last:border-none"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005930] bg-gradient-to-r text-white">
                <TrendingUp size={20} />
              </div>
              <span className="text-base font-medium text-gray-700">
                {product.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {product.sales} vendas
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withAuth(DashboardPage);
