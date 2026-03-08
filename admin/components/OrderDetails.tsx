"use client";

import { useState } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusColor, getStatusLabel } from "@/lib/orderStatus";
import { getTranslatedText, TranslatedField } from "@/types/product";

interface ProductVariation {
  id: number;
  name: TranslatedField;
  additionalPrice?: number;
  quantity?: number;
  group?: string;
}

interface Product {
  id: number;
  name: TranslatedField;
  quantity: number;
  productVariations?: ProductVariation[];
}

interface Order {
  id: number;
  totalValue: number;
  createdAt: string;
  status: string;
  user_phone?: string;
  products: Product[];
}

interface OrderDetailsProps {
  order: Order;
  onOrderUpdated?: () => void;
}

export function OrderDetails({ order, onOrderUpdated }: OrderDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkAsDelivered = async () => {
    if (!confirm("Tem certeza que deseja marcar este pedido como entregue?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DELIVERED",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao marcar pedido como entregue");
      }

      onOrderUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar pedido como entregue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELED",
            cancellationReason: "Cancelado pelo administrador",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao cancelar pedido");
      }

      onOrderUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar pedido");
    } finally {
      setIsLoading(false);
    }
  };
  const computedTotal = order.products.reduce((acc, product) => {
    const productNameText = getTranslatedText(product.name);
    const [, productPrice] = productNameText.split(":R$");
    const price = parseFloat(productPrice?.replace(",", ".") || "0");
    let subtotal = price * product.quantity;
    if (product.productVariations && product.productVariations.length) {
      subtotal += product.productVariations.reduce(
        (vAcc, variation) =>
          vAcc +
          (variation.additionalPrice || 0) *
            product.quantity *
            (variation.quantity || 1),
        0,
      );
    }
    return acc + subtotal;
  }, 0);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <DialogTitle>Pedido: {order.id}</DialogTitle>
            <DialogDescription>
              Detalhes do pedido realizado em{" "}
              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
            </DialogDescription>
            {order.user_phone && (
              <div className="mt-2 text-sm text-gray-600">
                <span>Telefone: {order.user_phone}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                order.status,
              )}`}
            >
              {getStatusLabel(order.status)}
            </div>
            <div className="flex gap-2">
              {order.status !== "DELIVERED" && order.status !== "CANCELED" && (
                <button
                  onClick={handleMarkAsDelivered}
                  disabled={isLoading}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isLoading ? "Marcando..." : "Marcar como entregue"}
                </button>
              )}
              {order.status !== "CANCELED" && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isLoading}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isLoading ? "Cancelando..." : "Cancelar pedido"}
                </button>
              )}
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </DialogHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.products.map((product) => {
            const productNameText = getTranslatedText(product.name);
            const [productName, productPrice] = productNameText.split(":R$");
            const price = parseFloat(productPrice?.replace(",", ".") || "0");
            return [
              <TableRow key={`product-${product.id}`}>
                <TableCell>{productName}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell className="p-2">
                  R$ {price.toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell>
                  R$ {(price * product.quantity).toFixed(2).replace(".", ",")}
                </TableCell>
              </TableRow>,
              ...(product.productVariations?.map((variation) => {
                const varTotalQty =
                  product.quantity * (variation.quantity || 1);
                const varPrice = variation.additionalPrice || 0;
                const variationNameText = getTranslatedText(variation.name);
                return (
                  <TableRow key={`product-${product.id}-var-${variation.id}`}>
                    <TableCell className="pl-6 text-sm">
                      — {variationNameText}
                    </TableCell>
                    <TableCell className="text-sm">{varTotalQty}</TableCell>
                    <TableCell className="text-sm">
                      + R$ {varPrice.toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell className="text-sm">
                      R$ {(varPrice * varTotalQty).toFixed(2).replace(".", ",")}
                    </TableCell>
                  </TableRow>
                );
              }) || []),
            ];
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell>
              R$ {computedTotal.toFixed(2).replace(".", ",")}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DialogContent>
  );
}
