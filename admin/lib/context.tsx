'use client'

import React, { Dispatch, SetStateAction } from 'react'

type State = {
  isOpen: boolean
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

export const Context = React.createContext<State>({
  isOpen: false,
})
