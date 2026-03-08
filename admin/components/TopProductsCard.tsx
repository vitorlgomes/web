import { TrendingUp } from "lucide-react";

import { CardTitle } from "@/components/ui/card";
import { getTranslatedText } from "@/types/product";

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
            className="flex items-start justify-between border-b pb-4 last:border-none"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#005930] bg-gradient-to-r text-white">
                <TrendingUp size={20} />
              </div>
              <span className="text-base font-medium text-gray-700">
                {getTranslatedText(product.name)}
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
