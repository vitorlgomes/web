"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";

import { fetcher } from "@/app/hooks/fetcher";
import withAuth from "@/app/hooks/withAuth";
import { Button, ButtonProps } from "@/components/ui/button";
import FileInputWidget from "@/components/ui/file-input";
import { FormInput } from "@/components/ui/form-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import Title from "@/components/ui/title";

import * as PlusIcon from "../../../../assets/plus-icon.svg";
import { SessionProps } from "../../orders/page";

const MAX_FILE_SIZE = 1000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const updateProductForm = z.object({
  image: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `O tamanho máximo para imagens é de 1MB.`,
    )
    .refine(
      (files) =>
        !files ||
        files?.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    ),
  name: z.string().min(4),
  outOfStock: z.boolean().nullish(),
  description: z.string().min(4),
  categoryId: z.coerce.number(),
  discount: z.coerce.number().nullish().default(0),
  price: z.coerce.number(),
  variants: z
    .array(
      z.object({
        name: z.string().min(4),
        group: z.string().min(4),
        additionalPrice: z.coerce.number().default(0),
        outOfStock: z.boolean(),
      }),
    )
    .nullish(),
});

export type UpdateProductForm = z.infer<typeof updateProductForm>;

const AddButton: React.FC<{
  onClick: () => void;
  type: ButtonProps["type"];
}> = ({ onClick, type }) => {
  return (
    <button
      type={type}
      onClick={() => {
        onClick();
      }}
    >
      <Image src={PlusIcon} alt="Plus sign" width={26} height={26} />
    </button>
  );
};

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button onClick={() => onClick()}>
      <TrashIcon width={13} height={13} />
    </button>
  );
};

function UpdateProductPage(props: SessionProps) {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProductForm>({
    resolver: zodResolver(updateProductForm),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Fetch existing product data
  const { data: product, isLoading: loadingProduct } = useSWR(
    productId && props.shopId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${productId}?shopId=${props.shopId}`
      : null,
    fetcher,
  );

  // Fetch categories
  const { data: categories } = useSWR(
    props.shopId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories?shopId=${props.shopId}`
      : null,
    fetcher,
  );

  // Populate form with existing product data
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        outOfStock: product.outOfStock,
        description: product.description,
        categoryId: product.categoryId,
        discount: product.discount || 0,
        price: product.price,
        variants: product.variants || [],
      });
    }
  }, [product, reset]);

  const onSubmit: SubmitHandler<UpdateProductForm> = async (data) => {
    const { variants, image, ...validData } = data;

    const formData = new FormData();

    // Properly append each field to FormData
    for (const key in validData) {
      const value = (validData as any)[key];
      if (
        Object.prototype.hasOwnProperty.call(validData, key) &&
        value !== undefined &&
        value !== null
      ) {
        formData.append(key, String(value));
      }
    }

    // Remove discount
    formData.delete("discount");

    // Add variants if they exist
    if (variants && variants.length > 0) {
      formData.append("variants", JSON.stringify(variants));
    }

    // Add shopId
    if (props.shopId) {
      formData.append("shopId", String(props.shopId));
    }

    // Only append image if a new one was selected
    if (image && image.length > 0) {
      formData.append("image", image[0]);
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${productId}`,
        formData,
      );
    } catch (error: any) {
      toast.error(
        `Erro ao atualizar o produto: ${error.response?.data?.message || error.message}`,
      );
      return;
    }

    toast.success(`Produto atualizado com sucesso!`);
    return router.push("/dashboard/products");
  };

  if (loadingProduct) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Produto não encontrado
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          O produto que você está tentando editar não foi encontrado.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push("/dashboard/products")}
        >
          Voltar para produtos
        </Button>
      </div>
    );
  }

  return (
    <>
      <Title label="Editar produto" />
      <p className="w-full text-sm font-normal text-[#6d726d] sm:w-[515px]">
        Edite as informações do produto abaixo. Apenas produtos em estoque
        estarão disponíveis na loja. Certifique-se que a imagem possui um
        formato landscape. Ao inserir uma nova imagem, você conseguirá confirmar
        a pré-visualização.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FileInputWidget
          errors={errors.image}
          onFileSelect={() => console.log("Arquivo salvo.")}
          formAttrs={register("image")}
          existingImageUrl={product.image}
        />

        <div className="flex flex-col gap-4 sm:gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <FormInput
                label="Nome do Produto"
                type="text"
                placeholder="Nome do produto"
                formAttrs={register("name")}
                errors={errors.name}
              />
              <Controller
                name={`outOfStock`}
                control={control}
                render={({ field }) => (
                  <div className="block text-xs font-medium text-[#0b0c0b]">
                    <label className="block">Em estoque?</label>
                    <div className="mt-4">
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <FormInput
                label="Desconto"
                type="number"
                placeholder="Desconto"
                formAttrs={register("discount", { valueAsNumber: true })}
                errors={errors.discount}
              />
              <Controller
                name={`categoryId`}
                control={control}
                render={({ field }) => (
                  <div className="inline-flex w-full flex-col items-start justify-start gap-3 lg:w-[300px]">
                    <label className="text-xs font-medium text-[#0b0c0b]">
                      Categoria
                    </label>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full text-[#6d726d]">
                        <SelectValue
                          className="text-[#6d726d]"
                          placeholder="Categoria"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Opções</SelectLabel>
                          {categories?.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <span className="text-xs text-red-500">
                        {errors.categoryId.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <FormInput
                label="Preço"
                type="number"
                placeholder="Preço"
                formAttrs={register("price", { valueAsNumber: true })}
                errors={errors.price}
              />
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-4 md:flex-row">
            <FormInput
              label="Descrição"
              type="textarea"
              placeholder="Descrição"
              formAttrs={register("description")}
              errors={errors.description}
            />
          </div>
        </div>

        <div className="relative mt-8">
          <Title label="Variação do produto" />

          <p className="mt-6 w-auto text-sm text-[#6D736D] lg:w-[515px]">
            Nessa sessão, você poderá adicionar ao produto diferentes opções de
            preço de acordo com a quantidade de produtos escolhidos pelo
            usuário.
          </p>

          <div className="flex flex-col gap-4">
            <div className="mt-8">
              <AddButton
                type="button"
                onClick={() => {
                  append({
                    name: "",
                    group: "",
                    additionalPrice: 0,
                    outOfStock: false,
                  });
                }}
              />
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="mt-6 flex flex-col items-start gap-4 lg:flex-row lg:items-center"
              >
                <div className="mt-8">
                  <RemoveButton
                    onClick={() => {
                      remove(index);
                    }}
                  />
                </div>
                <div className="">
                  <label className="text-xs font-medium text-[#0b0c0b]">
                    Tipo de Variação
                  </label>
                  <div className="mt-2">
                    <Controller
                      name={`variants.${index}.group`}
                      control={control}
                      key={field.id}
                      render={({ field: selectField }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                        >
                          <SelectTrigger className="w-full text-[#6d726d]">
                            <SelectValue
                              className="text-[#6d726d]"
                              placeholder="Tipo de variação"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Opções</SelectLabel>
                              <SelectItem value="additionals">
                                Adicionais
                              </SelectItem>
                              <SelectItem value="change">
                                Substituições
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <FormInput
                  label="Preço adicional"
                  key={field.id}
                  type="number"
                  placeholder="Preço adicional"
                  formAttrs={register(`variants.${index}.additionalPrice`, {
                    valueAsNumber: true,
                  })}
                  errors={errors.variants?.[index]?.additionalPrice}
                />
                <FormInput
                  label="Nome"
                  key={field.id}
                  type="text"
                  placeholder="Nome"
                  formAttrs={register(`variants.${index}.name`)}
                  errors={errors.variants?.[index]?.name}
                />
                <Controller
                  name={`variants.${index}.outOfStock`}
                  control={control}
                  key={field.id}
                  render={({ field }) => (
                    <div className="block text-xs font-medium text-[#0b0c0b]">
                      <label className="block">Em estoque?</label>
                      <div className="mt-4">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          <Button
            className="absolute bottom-1 right-0 mt-6"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export default withAuth(UpdateProductPage);
