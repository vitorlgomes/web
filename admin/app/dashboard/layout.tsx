'use client'

import React from 'react'

import { Sidebar } from '@/components/Sidebar'
import { Context } from '@/lib/context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <Context.Provider value={{ isOpen, setIsOpen }}>
      <div className="flex h-screen gap-6 bg-[#FCFBF7]">
        <Sidebar />
        <main className="m-2 flex w-full flex-col gap-6 overflow-y-auto rounded-lg border border-[#DAE5DA] bg-white p-8 md:m-4 lg:m-8">
          {children}
        </main>
      </div>
    </Context.Provider>
  )
}
