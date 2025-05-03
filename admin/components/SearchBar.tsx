'use client'

import { Dispatch, SetStateAction } from 'react'

import { Input } from '@/components/ui/input'

type SearchState = {
  value?: string
  setValue?: Dispatch<SetStateAction<string>>
  setDebouncedValue?: (value: string) => unknown
}

type Props = {
  state?: SearchState
}

export default function SearchBar(props: Props) {
  const { state } = props

  return (
    <div className="w-6/6 relative max-w-lg md:w-5/6 lg:w-3/6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="text"
        onChange={(e) => {
          state?.setValue && state.setValue(e.target.value)

          return (
            state?.setDebouncedValue && state.setDebouncedValue(e.target.value)
          )
        }}
        placeholder="Pesquisar itens específicos"
        className="w-full bg-[#F1F7F2] pl-10 opacity-100"
      />
    </div>
  )
}
