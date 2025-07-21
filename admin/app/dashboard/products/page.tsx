"use client";

import debounce from "lodash.debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Product } from "@/types/product";

import { fetcher } from "../../hooks/fetcher";
import { SessionProps } from "../orders/page";

function ProductsPage(props: SessionProps) {
  const router = useRouter();
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });
  const [categorySelected, setCategorySelected] = React.useState(undefined);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [hasNextPage] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const perPage = 10;

  let productsURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?shopId=1&page=${pageIndex}&limit=${perPage}`;

  if (categorySelected) productsURL += `&categoryId=${categorySelected}`;

  if (debouncedValue) productsURL += `&name=${debouncedValue}`;

  const debouncedSearch = debounce((value: string) => {
    setDebouncedValue(value);
  }, 500);

  const { data: products, isValidating: loadingProductsData } = useSWR(
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
    setLoadingProducts(loadingProductsData);
  }, [loadingProductsData]);

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
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-4 p-2">
            <Button
              onClick={() => setCategorySelected(undefined)}
              size="sm"
              variant="ghost"
              className={`whitespace-nowrap rounded-full ${!categorySelected ? "bg-[#005930]/20 p-2 font-semibold text-[#005930]" : ""}`}
            >
              Todas os produtos
            </Button>
            {categories?.map((category: any) => {
              return (
                <Button
                  key={category.id}
                  onClick={() => setCategorySelected(category.id)}
                  size="sm"
                  variant="ghost"
                  className={`whitespace-nowrap rounded-full ${categorySelected === category.id ? "bg-[#005930]/20 p-2 font-semibold text-[#005930]" : ""}`}
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
            {!isMobile ? (
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
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-[#f1f7f2]"
                        onClick={() =>
                          router.push(`/dashboard/products/${product.id}`)
                        }
                      >
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
              <ProductRowMobile
                products={products}
                onProductClick={(productId) =>
                  router.push(`/dashboard/products/${productId}`)
                }
              />
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
