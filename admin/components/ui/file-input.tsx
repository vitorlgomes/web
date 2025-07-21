import Image from "next/image";
import React, { useState } from "react";
import { UseFormRegister } from "react-hook-form";

import UploaderIcon from "@/assets/upload.svg";

interface FileInputProps {
  onFileSelect: (file: File) => void;
  formAttrs?: ReturnType<UseFormRegister<any>>;
  errors: any;
  existingImageUrl?: string;
}

const FileInputWidget: React.FC<FileInputProps> = (props) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showExistingImage, setShowExistingImage] = useState<boolean>(
    !!props.existingImageUrl,
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      setShowExistingImage(false);
      props.onFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setShowExistingImage(false);
    // Reset the file input
    if (props.formAttrs?.name) {
      const input = document.getElementById(
        "dropzone-file",
      ) as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  return (
    <>
      <label htmlFor="dropzone-file">
        <div className="inline-flex h-[260px] w-[355px] flex-col items-start justify-start gap-6">
          {!selectedFile && !showExistingImage ? (
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
                      handleFileChange(event);
                      props.formAttrs?.onChange(event);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <Image
                alt="Product image preview"
                src={selectedFile || props.existingImageUrl || ""}
                width={235}
                height={190}
                style={{
                  maxWidth: 355,
                  maxHeight: 260,
                  objectFit: "contain",
                }}
              />
              <button
                type="button"
                className="mb-4 cursor-pointer text-sm text-red-600 hover:text-red-800"
                onClick={handleRemoveImage}
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>
      </label>
      {props.errors && (
        <span className="text-xs text-red-500">{props.errors.message}</span>
      )}
    </>
  );
};

export default FileInputWidget;
