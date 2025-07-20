import { Dialog, DialogTrigger } from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'

import { Order } from '@/app/dashboard/orders/page'

import { OrderDetails } from './OrderDetails'
import { Button } from './ui/button'
import { TableCell, TableRow } from './ui/table'

interface OrderTableRowProps {
  order?: Order
  isLoading?: boolean
}

export function OrderTableRow({ order, isLoading }: OrderTableRowProps) {
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
      </TableRow>
    )
  }

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

          {order && <OrderDetails order={order} />}
        </Dialog>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium">
        {order?.id}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(order?.createdAt ?? '').toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              order?.status === 'PENDING'
                ? 'bg-yellow-400'
                : order?.status === 'ACCEPTED'
                  ? 'bg-green-400'
                  : 'bg-red-400'
            }`}
          />
          <span className="font-medium text-muted-foreground">
            {order?.status}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        R$ {order?.totalValue.toFixed(2).replace('.', ',')}
      </TableCell>
      <TableCell className="font-medium">{order?.userName}</TableCell>
    </TableRow>
  )
}
