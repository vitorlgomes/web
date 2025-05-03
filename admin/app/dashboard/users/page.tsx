import SearchBar from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function UsersPage() {
  return (
    <>
      <header className="flex items-center justify-between self-stretch">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <Button size="sm" variant="default">
          Adicionar Usuário
        </Button>
      </header>

      <SearchBar />

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F1F7F2]">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Categoria 3</TableHead>
              <TableHead>Categoria 4</TableHead>
              <TableHead>Categoria 5</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => {
              return (
                <TableRow key={i} className="hover:bg-[#f1f7f2]">
                  <TableCell>Nome da Pessoa</TableCell>
                  <TableCell>nomedapessoa@gmail.com</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Categoria</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
