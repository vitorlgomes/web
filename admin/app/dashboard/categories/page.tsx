'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWR from 'swr'
import { z } from 'zod'

import { fetcher } from '@/app/hooks/fetcher'
import withAuth from '@/app/hooks/withAuth'
import { Pagination } from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormInput } from '@/components/ui/form-input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { SessionProps } from '../orders/page'

const createCategorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório'),
})

type CreateCategoryForm = z.infer<typeof createCategorySchema>

interface Category {
  id: number
  name: string
  createdAt: string
  shopId: number
}

function CategoriesPage(props: SessionProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [searchValue, setSearchValue] = React.useState('')
  const [debouncedValue, setDebouncedValue] = React.useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const perPage = 10

  let categoriesURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories?shopId=${props.shopId}&page=${pageIndex}&limit=${perPage}`

  const debouncedSearch = debounce((value: string) => {
    setDebouncedValue(value)
  }, 500)

  if (debouncedValue) categoriesURL += `&name=${debouncedValue}`

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategorySchema),
    mode: 'onChange',
  })

  const { data: categoriesData } = useSWR(
    () =>
      (debouncedValue && debouncedValue !== searchValue) || !props.shopId
        ? null
        : categoriesURL,
    fetcher,
  )

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData)
      setHasNextPage(categoriesData.length === perPage)
    }

    setLoadingCategories(false)
  }, [categoriesData])

  const onSubmit: SubmitHandler<CreateCategoryForm> = async (
    data: CreateCategoryForm,
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/category`,
        {
          ...data,
          shopId: props.shopId,
        },
      )
      setCategories((prevCategories) => [...prevCategories, response.data])
      toast.success('Categoria adicionada com sucesso')
      reset()
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao adicionar categoria')
    }
  }

  return (
    <>
      <header className="flex items-center justify-between self-stretch">
        <h1 className="font-nohemi text-2xl font-medium">Categorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-inter" size="sm" variant="default">
              Adicionar Categoria
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Categoria</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="w-100 mb-4">
                <FormInput
                  label="Nome da Categoria"
                  style={{ width: '100%', display: 'block', marginTop: '1rem' }}
                  type="text"
                  placeholder="Digite o nome da categoria"
                  formAttrs={register('name')}
                  errors={errors.name}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <SearchBar
        state={{
          setValue: setSearchValue,
          value: searchValue,
          setDebouncedValue: debouncedSearch,
        }}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F1F7F2]">
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data de Criação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCategories ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[30px] rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px] rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px] rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-[#f1f7f2]">
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        pageIndex={pageIndex}
        hasNextPage={hasNextPage}
        onPageChange={(newPage) => setPageIndex(newPage)}
      />
    </>
  )
}

export default withAuth(CategoriesPage)
