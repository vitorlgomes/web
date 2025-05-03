import Image from 'next/image'
import React, { useState } from 'react'
import { UseFormRegister } from 'react-hook-form'

import UploaderIcon from '@/assets/upload.svg'

interface FileInputProps {
  onFileSelect: (file: File) => void
  formAttrs?: ReturnType<UseFormRegister<any>>
  errors: any
}

const FileInputWidget: React.FC<FileInputProps> = (props) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setSelectedFile(URL.createObjectURL(file))
      props.onFileSelect(file)
    }
  }

  return (
    <>
      <label htmlFor="dropzone-file">
        <div className="inline-flex h-[260px] w-[355px] flex-col items-start justify-start gap-6">
          {!selectedFile ? (
            <div className="relative h-[260px] w-[335px] rounded-lg bg-[#d1d1d1]">
              <div className="absolute left-0 top-0 h-[260px] w-[335px] rounded-lg bg-[#d1d1d1]"></div>
              <div className="absolute left-[142px] top-[105px] inline-flex items-center justify-center rounded-[500px] bg-[#fff0e5]/75 px-[0.33px]">
                <div className="inline-flex items-start justify-start gap-1 self-stretch rounded-[500px] p-3">
                  <Image
                    alt="Image uploader"
                    src={UploaderIcon}
                    width={24}
                    height={24}
                  />
                  <input
                    id="dropzone-file"
                    className="hidden"
                    type="file"
                    {...props.formAttrs}
                    onChange={(event) => {
                      handleFileChange(event)
                      props.formAttrs?.onChange(event)
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <Image
                alt="Uploaded image"
                src={selectedFile}
                width={355}
                height={260}
                style={{ maxWidth: 355, maxHeight: 260, objectFit: 'contain' }}
              />
              <div className="mb-4" onClick={() => setSelectedFile(null)}>
                Remover
              </div>
            </div>
          )}
        </div>
      </label>
      {props.errors && (
        <span className="text-xs text-red-500">{props.errors.message}</span>
      )}
    </>
  )
}

export default FileInputWidget
