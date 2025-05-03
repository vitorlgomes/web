'use client'

import React from 'react'

import { Product } from '@/app/dashboard/products/page'

type Props = {
  products: Product[]
  currencySymbol?: string // Símbolo da moeda (padrão R$)
}

const ProductRowMobile = ({ products, currencySymbol = 'R$' }: Props) => {
  return (
    <>
      {products?.map((item, index) => {
        const price = item.price.toFixed(2)

        return (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-lg">
            <div className="mb-4 flex justify-between">
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-700">
                <span>
                  <span className="text-gray-500">({item.category.name})</span>
                </span>
                <span>
                  {currencySymbol} {price.replace('.', ',')}
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
        )
      })}
    </>
  )
}

export default ProductRowMobile
