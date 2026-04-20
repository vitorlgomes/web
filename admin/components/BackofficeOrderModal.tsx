"use client";

import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Category,
  getTranslatedText,
  Product,
  ProductVariation,
} from "@/types/product";

interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  variations: ProductVariation[];
  comment: string;
}

const cartKey = (productId: number, variationIds: number[]) =>
  `${productId}:${[...variationIds].sort((a, b) => a - b).join(",")}`;

const variationPriceSum = (variations: ProductVariation[]) =>
  variations.reduce((s, v) => s + (v.additionalPrice || 0), 0);

interface BackofficeOrderModalProps {
  tableNumber: number | null;
  shopId: number;
  categories: Category[];
  products: Product[];
  onOrderCreated: () => void;
  onClose: () => void;
  allowNoTable?: boolean;
}

type DeliveryType = "dine_in" | "takeaway";

export function BackofficeOrderModal({
  tableNumber,
  shopId,
  categories,
  products,
  onOrderCreated,
  onClose,
  allowNoTable = false,
}: BackofficeOrderModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    tableNumber ? "dine_in" : "takeaway"
  );
  const [variationPicker, setVariationPicker] = useState<Product | null>(null);
  const [pickerSelection, setPickerSelection] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    setDeliveryType(tableNumber ? "dine_in" : "takeaway");
  }, [tableNumber, allowNoTable]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory.id);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const name = getTranslatedText(p.name).toLowerCase();
        return name.includes(query);
      });
    }

    return filtered.filter((p) => !p.outOfStock);
  }, [products, selectedCategory, searchQuery]);

  // Filter categories that have products
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(products.map((p) => p.categoryId));
    return categories.filter((c) => categoryIds.has(c.id));
  }, [categories, products]);

  // Cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const unit = item.product.price + variationPriceSum(item.variations);
      return total + unit * item.quantity;
    }, 0);
  }, [cart]);

  const addToCart = useCallback(
    (product: Product, variations: ProductVariation[]) => {
      setCart((prev) => {
        const key = cartKey(
          product.id,
          variations.map((v) => v.id)
        );
        const existing = prev.find((item) => item.key === key);
        if (existing) {
          return prev.map((item) =>
            item.key === key
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { key, product, quantity: 1, variations, comment: "" }];
      });
    },
    []
  );

  const handleProductClick = useCallback(
    (product: Product) => {
      const variations = product.ProductVariation ?? [];
      if (variations.length > 0) {
        setVariationPicker(product);
        setPickerSelection(new Set());
      } else {
        addToCart(product, []);
      }
    },
    [addToCart]
  );

  const confirmVariationPicker = useCallback(() => {
    if (!variationPicker) return;
    const selected = (variationPicker.ProductVariation ?? []).filter((v) =>
      pickerSelection.has(v.id)
    );
    addToCart(variationPicker, selected);
    setVariationPicker(null);
    setPickerSelection(new Set());
  }, [variationPicker, pickerSelection, addToCart]);

  const updateQuantity = useCallback((key: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.key === key) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateComment = useCallback((key: string, comment: string) => {
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, comment } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleSubmit = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        data: {
          totalValue: cartTotal,
          status: "PENDING",
          shopId,
          ...(tableNumber && { table: tableNumber }),
          type: "backoffice",
          delivery_type: deliveryType,
          orderItems: cart.map((item) => ({
            name: `${getTranslatedText(item.product.name)}:R$${item.product.price.toFixed(2)}`,
            quantity: item.quantity,
            productId: item.product.id,
            ...(item.comment.trim() && { comments: item.comment.trim() }),
            ...(item.variations.length > 0 && {
              productVariations: item.variations.map((v) => ({
                productVariationId: v.id,
              })),
            }),
          })),
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) throw new Error("Erro ao criar pedido");

      onOrderCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showProducts = selectedCategory || searchQuery.trim().length > 0;

  return (
    <DialogContent className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden p-0">
      {/* Header */}
      <div className="border-b bg-[#faf9f6] px-6 py-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {showProducts && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-all hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <DialogTitle className="font-nohemi text-lg">
                {tableNumber ? `Novo Pedido - Mesa ${tableNumber}` : "Novo Pedido"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Selecione os produtos para o pedido
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
      </div>

      {/* Delivery Type Selector (when no table or allowNoTable) */}
      {(allowNoTable || !tableNumber) && (
        <div className="border-b bg-white px-6 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setDeliveryType("dine_in")}
              disabled={allowNoTable}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                deliveryType === "dine_in"
                  ? "bg-[#0B0C0B] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Consumo Local
            </button>
            <button
              onClick={() => setDeliveryType("takeaway")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                deliveryType === "takeaway"
                  ? "bg-[#0B0C0B] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Para Viagem
            </button>
          </div>
        </div>
      )}

      {/* Search Bar - Figma Style */}
      <div className="border-b bg-[#faf9f6] px-6 py-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O que você deseja?"
            className="flex-1 bg-transparent font-nohemi text-xl font-light text-[#0b0c0b] placeholder-[#a4b2a9] outline-none"
          />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efefef]">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="mt-2 h-px w-1 bg-[#758079]" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!showProducts ? (
          /* Categories List - Figma Style */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-4">
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="text-left font-nohemi text-xl font-bold text-[#0b0c0b] transition-colors hover:text-gray-600"
                  >
                    {getTranslatedText(category.name)}
                  </button>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Nenhuma categoria disponível
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Products List - Figma Style */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {selectedCategory && (
              <div className="mb-2">
                <h3 className="font-nohemi text-lg font-bold text-[#0b0c0b]">
                  {getTranslatedText(selectedCategory.name)}
                </h3>
                <p className="text-xs text-[#6d736d]">
                  Selecione o item desejado
                </p>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const totalInCart = cart
                    .filter((i) => i.product.id === product.id)
                    .reduce((s, i) => s + i.quantity, 0);
                  const hasVariations =
                    (product.ProductVariation?.length ?? 0) > 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center justify-between rounded bg-[#efefef] px-3 py-3 transition-all hover:bg-[#e5e5e5] active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-2 font-nohemi text-base font-semibold text-[#0b0c0b]">
                        {getTranslatedText(product.name)}
                        {hasVariations && (
                          <span className="rounded-full bg-[#0b0c0b]/10 px-2 py-0.5 text-[10px] font-medium text-[#0b0c0b]">
                            opções
                          </span>
                        )}
                        {totalInCart > 0 && (
                          <span className="rounded-full bg-[#0b0c0b] px-2 py-0.5 text-xs font-medium text-white">
                            {totalInCart}x
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-semibold text-[#0b0c0b]">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  Nenhum produto encontrado
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="flex flex-shrink-0 flex-col border-t bg-white">
          {/* Cart Items */}
          <div className="max-h-[25vh] overflow-y-auto px-6 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ShoppingCart className="h-4 w-4" />
                {cart.length} {cart.length === 1 ? "item" : "itens"}
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                Limpar
              </button>
            </div>
            <div className="space-y-2">
              {cart.map((item) => {
                const unit =
                  item.product.price + variationPriceSum(item.variations);
                return (
                  <div
                    key={item.key}
                    className="rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {getTranslatedText(item.product.name)}
                        </span>
                        {item.variations.length > 0 && (
                          <span className="block truncate text-[10px] italic text-gray-500">
                            {item.variations
                              .map((v) => getTranslatedText(v.name))
                              .join(", ")}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          R$ {(unit * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <div className="ml-2 flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.key, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.comment}
                      onChange={(e) => updateComment(item.key, e.target.value)}
                      placeholder="Observação (ex: sem cebola)"
                      className="mt-2 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#0B0C0B] focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Footer */}
          <div className="border-t bg-[#0B0C0B] px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {deliveryType === "takeaway" ? "Para viagem" : "Consumo local"}
              </span>
              <span className="font-nohemi text-xl font-bold text-white">
                R$ {cartTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Criar Pedido
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty Cart Footer */}
      {cart.length === 0 && (
        <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Adicione produtos ao pedido
            </span>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {variationPicker && (
        <div className="absolute inset-0 z-20 flex flex-col bg-white">
          <div className="flex items-center gap-3 border-b bg-[#faf9f6] px-6 py-4">
            <button
              onClick={() => {
                setVariationPicker(null);
                setPickerSelection(new Set());
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-all hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h3 className="font-nohemi text-lg font-bold text-[#0b0c0b]">
                {getTranslatedText(variationPicker.name)}
              </h3>
              <p className="text-xs text-[#6d736d]">
                Selecione os adicionais
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {Object.entries(
              (variationPicker.ProductVariation ?? []).reduce<
                Record<string, ProductVariation[]>
              >((acc, v) => {
                const group = v.group || "Opções";
                (acc[group] ??= []).push(v);
                return acc;
              }, {})
            ).map(([group, items]) => (
              <div key={group} className="mb-4">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {group}
                </h4>
                <div className="space-y-1.5">
                  {items.map((v) => {
                    const checked = pickerSelection.has(v.id);
                    const disabled = v.outOfStock;
                    return (
                      <button
                        key={v.id}
                        disabled={disabled}
                        onClick={() => {
                          setPickerSelection((prev) => {
                            const next = new Set(prev);
                            if (next.has(v.id)) next.delete(v.id);
                            else next.add(v.id);
                            return next;
                          });
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all ${
                          checked
                            ? "border-[#0B0C0B] bg-gray-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                              checked
                                ? "border-[#0B0C0B] bg-[#0B0C0B]"
                                : "border-gray-300"
                            }`}
                          >
                            {checked && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#0b0c0b]">
                            {getTranslatedText(v.name)}
                          </span>
                        </div>
                        {v.additionalPrice > 0 && (
                          <span className="text-xs font-semibold text-gray-600">
                            + R$ {v.additionalPrice.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t bg-white px-6 py-3">
            <button
              onClick={confirmVariationPicker}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0C0B] py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Adicionar ao pedido
            </button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}
