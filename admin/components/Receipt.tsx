"use client";

import React, { useState } from "react";

import { Order } from "@/app/dashboard/orders/page";
import { getStatusColor, getStatusLabel } from "@/lib/orderStatus";
import { getTranslatedText } from "@/types/product";

type Props = {
  orders: Order[];
  onOrderUpdated?: () => void;
};

const Receipt = (props: Props) => {
  const { orders, onOrderUpdated } = props;
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [errorOrderId, setErrorOrderId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleMarkAsDelivered = async (order: Order) => {
    if (!confirm("Tem certeza que deseja marcar este pedido como entregue?")) {
      return;
    }

    setLoadingOrderId(order.id);
    setErrorOrderId(null);
    setErrorMessage("");

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
      setErrorOrderId(order.id);
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao marcar pedido como entregue",
      );
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
      return;
    }

    setLoadingOrderId(order.id);
    setErrorOrderId(null);
    setErrorMessage("");

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
      setErrorOrderId(order.id);
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao cancelar pedido",
      );
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <>
      {orders.map((order) => {
        return (
          <div
            key={order.id}
            className="rounded-lg border bg-white p-4 shadow-lg"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                {order.user_phone && (
                  <div>
                    <span className="font-medium text-gray-700">Telefone</span>
                    <div className="text-sm font-medium text-green-600">
                      {order.user_phone}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </div>
                <div className="flex gap-2">
                  {order.status !== "DELIVERED" && order.status !== "CANCELED" && (
                    <button
                      onClick={() => handleMarkAsDelivered(order)}
                      disabled={loadingOrderId === order.id}
                      className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {loadingOrderId === order.id ? "Marcando..." : "Marcar como entregue"}
                    </button>
                  )}
                  {order.status !== "CANCELED" && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      disabled={loadingOrderId === order.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {loadingOrderId === order.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {errorOrderId === order.id && (
              <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}
            <div className="mb-4">
              {order.products.map((item, index) => {
                const productNameText = getTranslatedText(item.name);
                const [productName, productPrice] =
                  productNameText.split(":R$");
                const price = parseFloat(productPrice).toFixed(2);

                return (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.quantity}x {productName}
                    </span>

                    <span>R$ {price.replace(".", ",")}</span>
                  </div>
                );
              })}
            </div>
            <div className="my-4 border-t border-dashed"></div>
            <div className="flex justify-between font-medium text-gray-700">
              <span>Total</span>
              <span>R$ {order.totalValue.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="my-4 border-t border-dashed"></div>
            <div className="mb-2 text-center text-xl text-green-600">
              <span>✳</span>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>{`Pedido ${order.id}`}</p>
              <p>{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Receipt;
