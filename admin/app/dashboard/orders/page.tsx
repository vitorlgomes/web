"use client";

import axios from "axios";
import debounce from "lodash.debounce";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";

import withAuth from "@/app/hooks/withAuth";
import { OrderTableRow } from "@/components/OrderTableRow";
import { Pagination } from "@/components/Pagination";
import Receipt from "@/components/Receipt";
import SearchBar from "@/components/SearchBar";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: number;
  name: string;
  quantity: number;
}

export interface Order {
  id: number;
  totalValue: number;
  createdAt: string;
  status: string;
  userName: string;
  products: Product[];
}

export type SessionProps = {
  shopId: number;
};

function OrdersPage(props: SessionProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  const perPage = 10;
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  let ordersURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders?shopId=${props.shopId}`;

  const debouncedSearch = debounce((value: string) => {
    setDebouncedValue(value);
  }, 500);

  if (debouncedValue) ordersURL += `&search=${debouncedValue}`;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await axios.get(ordersURL, {
          params: {
            page: pageIndex,
            limit: perPage,
          },
        });
        setOrders(response.data);
        setHasNextPage(response.data.length === perPage);
      } catch (error) {
        toast.error("Erro ao carregar pedidos");
      } finally {
        setLoadingOrders(false);
      }
    };

    props.shopId && fetchOrders();
  }, [pageIndex, debouncedValue, props.shopId]);

  return (
    <>
      <header className="flex items-center justify-between self-stretch">
        <h1 className="font-nohemi text-2xl font-medium">Pedidos</h1>
      </header>

      <SearchBar
        state={{
          setValue: setSearchValue,
          value: searchValue,
          setDebouncedValue: debouncedSearch,
        }}
      />
      {!isMobile ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F1F7F2]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[64px]"></TableHead>
                <TableHead>ID da Ordem</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total do pedido</TableHead>
                <TableHead>Nome do cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOrders
                ? Array.from({ length: perPage }).map((_, i) => (
                    <OrderTableRow key={i} isLoading />
                  ))
                : orders.map((order) => (
                    <OrderTableRow key={order.id} order={order} />
                  ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Receipt orders={orders} />
      )}
      <Pagination
        pageIndex={pageIndex}
        hasNextPage={hasNextPage}
        onPageChange={(newPage) => setPageIndex(newPage)}
      />
    </>
  );
}

export default withAuth(OrdersPage);
