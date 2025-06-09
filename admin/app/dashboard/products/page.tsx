"use client";

import debounce from "lodash.debounce";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import useSWR from "swr";

import withAuth from "@/app/hooks/withAuth";
import { Pagination } from "@/components/Pagination";
import ProductRowMobile from "@/components/ProductRowMobile";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetcher } from "../../hooks/fetcher";
import { SessionProps } from "../orders/page";
import { Category } from "../categories/page";

export type Product = {
  id: number;
  name: string;
  category: { name: string };
  outOfStock: boolean;
  price: number;
  quantity: number;
};

function ProductsPage(props: SessionProps) {
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });
  const [categorySelected, setCategorySelected] = React.useState<
    number | undefined
  >(undefined);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const perPage = 10;

  let productsURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?shopId=1&page=${pageIndex}&limit=${perPage}`;

  if (categorySelected) productsURL += `&categoryId=${categorySelected}`;

  if (debouncedValue) productsURL += `&name=${debouncedValue}`;

  const debouncedSearch = debounce((value: string) => {
    setDebouncedValue(value);
  }, 500);

  const { data: products } = useSWR(
    () =>
      (debouncedValue && debouncedValue !== searchValue) || !props.shopId
        ? null
        : productsURL,
    fetcher,
    {
      onSuccess: () => setLoadingProducts(false),
      onError: () => setLoadingProducts(false),
    },
  );

  const { data: categories } = useSWR(
    props.shopId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories?shopId=${props.shopId}`
      : null,
    fetcher,
  );

  useEffect(() => {
    if (products) {
      setHasNextPage(products.length === perPage);
      setLoadingProducts(false);
    }
  }, [products]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <header className="flex items-center justify-between self-stretch">
        <h1 className="font-nohemi text-2xl font-medium">Produtos</h1>
        <Link href={"/dashboard/products/create"}>
          <Button className="font-inter" size="sm" variant="default">
            Adicionar Produto
          </Button>
        </Link>
      </header>

      <SearchBar
        state={{
          setValue: setSearchValue,
          value: searchValue,
          setDebouncedValue: debouncedSearch,
        }}
      />

      <div className="rounded-md border">
        <div className="flex items-center gap-4 p-2">
          <Button
            onClick={() => setCategorySelected(undefined)}
            size="sm"
            variant="ghost"
            className={`rounded-full ${!categorySelected ? "bg-[#005930]/20 p-2 font-semibold text-[#005930]" : ""}`}
          >
            Todas os produtos
          </Button>
          <div className="w-100 flex overflow-auto">
            {categories?.map((category: Category) => {
              return (
                <Button
                  onClick={() => setCategorySelected(category.id)}
                  size="sm"
                  variant="ghost"
                  className={`rounded-full ${categorySelected === category.id ? "bg-[#005930]/20 p-2 font-semibold text-[#005930]" : ""}`}
                >
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
        {loadingProducts ? (
          <>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[100px] rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px] rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[120px] rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[50px] rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[70px] rounded" />
                </TableCell>
              </TableRow>
            ))}
          </>
        ) : (
          <>
            {!mounted ? null : !isMobile ? (
              <Table>
                <TableHeader className="bg-[#F1F7F2]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nome</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Em Estoque</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product: Product, i: number) => {
                    return (
                      <TableRow key={product.id} className="hover:bg-[#f1f7f2]">
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-[#005930]/20 p-2 font-semibold text-[#005930]">
                            Mais vendido
                          </span>
                        </TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>
                          {product.outOfStock ? "Não" : "Sim"}
                        </TableCell>
                        <TableCell>
                          {product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <ProductRowMobile products={products} />
            )}
          </>
        )}
      </div>
      <Pagination
        pageIndex={pageIndex}
        hasNextPage={hasNextPage}
        onPageChange={(newPage) => setPageIndex(newPage)}
      />
    </>
  );
}

export default withAuth(ProductsPage);
