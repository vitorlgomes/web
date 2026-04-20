import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Search } from "lucide-react";

import { Order } from "@/app/dashboard/orders/page";
import { getStatusDotColor, getStatusLabel } from "@/lib/orderStatus";

import { OrderDetails } from "./OrderDetails";
import { Button } from "./ui/button";
import { TableCell, TableRow } from "./ui/table";

interface OrderTableRowProps {
  order?: Order;
  isLoading?: boolean;
  onOrderUpdated?: () => void;
}

export function OrderTableRow({
  order,
  isLoading,
  onOrderUpdated,
}: OrderTableRowProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell>
          <Button variant="outline" size="xs" disabled>
            <Search className="h-3 w-3" />
          </Button>
        </TableCell>
        <TableCell>
          <div className="h-4 w-24 rounded bg-gray-200" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-40 rounded bg-gray-200" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-20 rounded bg-gray-200" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-16 rounded bg-gray-200" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-24 rounded bg-gray-200" />
        </TableCell>
      </TableRow>
    );
  }

  const typeLabel =
    order?.delivery_type === "dine_in" && order?.table
      ? `Mesa ${order.table}`
      : "Retirada";

  return (
    <TableRow>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="xs">
              <Search className="h-3 w-3" />
              <span className="sr-only">Detalhes do pedido</span>
            </Button>
          </DialogTrigger>

          {order && (
            <OrderDetails order={order} onOrderUpdated={onOrderUpdated} />
          )}
        </Dialog>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium">
        {order?.id}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(order?.createdAt ?? "").toLocaleDateString("pt-BR")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${getStatusDotColor(
              order?.status || "",
            )}`}
          />
          <span className="font-medium text-muted-foreground">
            {getStatusLabel(order?.status || "")}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            order?.delivery_type === "dine_in" && order?.table
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {typeLabel}
        </span>
      </TableCell>
      <TableCell className="font-medium">
        R$ {order?.totalValue.toFixed(2).replace(".", ",")}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {order?.user_phone || "-"}
      </TableCell>
    </TableRow>
  );
}
