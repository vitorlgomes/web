'use client'

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Product {
  id: number
  name: string
  quantity: number
}

interface Order {
  id: number
  totalValue: number
  createdAt: string
  status: string
  products: Product[]
}

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const totalValue = order.products.reduce(
    (acc, product) =>
      acc +
      product.quantity *
        parseFloat(product.name.split(':R$')[1].replace(',', '.')),
    0,
  )

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pedido: {order.id}</DialogTitle>
        <DialogDescription>
          Detalhes do pedido realizado em{' '}
          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
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
          {order.products.map((product, index) => {
            const [productName, productPrice] = product.name.split(':R$')
            const price = parseFloat(productPrice.replace(',', '.'))
            return (
              <TableRow key={index}>
                <TableCell>{productName}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell className="p-2">
                  R$ {price.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell>
                  R$ {(price * product.quantity).toFixed(2).replace('.', ',')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell>R$ {totalValue.toFixed(2).replace('.', ',')}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DialogContent>
  )
}
