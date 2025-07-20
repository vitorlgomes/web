import { Order } from "@/app/dashboard/orders/page";
import React from "react";

type Props = {
  orders: Order[];
};

const Receipt = (props: Props) => {
  const { orders } = props;

  return (
    <>
      {orders.map((order) => {
        return (
          <div className="rounded-lg border bg-white p-4 shadow-lg">
            <div className="mb-4 flex justify-between">
              <span className="font-medium text-gray-700">Cliente</span>
              <span className="font-medium text-green-600">
                {order.userName}
              </span>
            </div>
            <div className="mb-4">
              {order.products.map((item, index) => {
                const [productName, productPrice] = item.name.split(":R$");
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
