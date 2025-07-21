"use client";

import React from "react";

import { Product } from "@/types/product";

type Props = {
  products: Product[];
  currencySymbol?: string; // Símbolo da moeda (padrão R$)
  onProductClick?: (productId: number) => void;
};

const ProductRowMobile = ({
  products,
  currencySymbol = "R$",
  onProductClick,
}: Props) => {
  return (
    <>
      {products?.map((item, index) => {
        const price = item.price.toFixed(2);

        return (
          <div
            key={index}
            className="cursor-pointer rounded-lg border bg-white p-4 shadow-lg transition-colors hover:bg-[#f1f7f2]"
            onClick={() => onProductClick?.(item.id)}
          >
            <div className="mb-4 flex justify-between">
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-700">
                <span>
                  <span className="text-gray-500">({item.category.name})</span>
                </span>
                <span>
                  {currencySymbol} {price.replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Se o item estiver fora de estoque, exibe um aviso */}
            {item.outOfStock && (
              <div className="mt-1 text-xs text-red-600">
                <span>Produto fora de estoque</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default ProductRowMobile;
