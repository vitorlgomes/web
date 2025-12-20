"use client";

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

interface ProductVariation {
  id: number;
  name: string;
  additionalPrice?: number;
  quantity?: number;
  group?: string;
}

interface Product {
  id: number;
  name: string;
  quantity: number;
  productVariations?: ProductVariation[];
}

interface Order {
  id: number;
  totalValue: number;
  createdAt: string;
  status: string;
  products: Product[];
}

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const computedTotal = order.products.reduce((acc, product) => {
    const [, productPrice] = product.name.split(":R$");
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pedido: {order.id}</DialogTitle>
        <DialogDescription>
          Detalhes do pedido realizado em{" "}
          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
        </DialogDescription>
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
            const [productName, productPrice] = product.name.split(":R$");
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
                return (
                  <TableRow key={`product-${product.id}-var-${variation.id}`}>
                    <TableCell className="pl-6 text-sm">
                      — {variation.name}
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
