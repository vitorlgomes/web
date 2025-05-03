import * as React from 'react'
import { UseFormRegister } from 'react-hook-form'

import { CreateProductForm } from '@/app/dashboard/products/create/page'

type Props = {
  errors?: any
  key?: string
  label: string
  type: string
  placeholder: string
  style?: React.CSSProperties
  formAttrs: ReturnType<UseFormRegister<CreateProductForm>>
}

const FormInput = React.forwardRef<HTMLInputElement, Props>((props) => {
  return (
    <div
      style={props.style}
      className="inline-flex flex-col items-start justify-start gap-3"
    >
      <label className="text-xs font-medium text-[#0b0c0b]">
        {props.label}
      </label>

      {props.type === 'textarea' ? (
        <textarea
          {...props.formAttrs}
          key={props.key}
          rows={12}
          cols={40}
          placeholder={props.placeholder}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <input
          {...props.formAttrs}
          key={props.key}
          style={{ width: '329px', ...props.style }}
          placeholder={props.placeholder}
          type={props.type}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}

      {props.errors && (
        <span className="block text-xs text-red-500">
          {props.errors.message}
        </span>
      )}
    </div>
  )
})
FormInput.displayName = 'FormInput'

export { FormInput }
