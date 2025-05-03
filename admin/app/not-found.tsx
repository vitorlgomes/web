import Image from 'next/image'

import lirioVector from '@/assets/lirio-vector.svg'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FCFBF7] text-center">
      <Image
        src={lirioVector}
        alt="Lirio Logo"
        className="mb-4 h-16 w-16 animate-spin"
      />
      <h1 className="text-4xl font-bold text-gray-800">
        Opss! Página não encontrada.
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Desculpe, a página que você está procurando não existe.
      </p>
      <a
        href="/dashboard"
        className="mt-4 inline-block rounded bg-green-900 px-6 py-2 text-white hover:bg-green-950"
      >
        Página inicial
      </a>
    </div>
  )
}
