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
import { useCallback, useMemo, useState } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category, getTranslatedText, Product } from "@/types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

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
      return total + item.product.price * item.quantity;
    }, 0);
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
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
            name: getTranslatedText(item.product.name),
            quantity: item.quantity,
            productId: item.product.id,
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
    <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0">
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                deliveryType === "dine_in"
                  ? "bg-[#0B0C0B] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
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
      <div className="flex max-h-[35vh] flex-col overflow-hidden">
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
                  const cartItem = cart.find((i) => i.product.id === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-between rounded bg-[#efefef] px-3 py-3 transition-all hover:bg-[#e5e5e5] active:scale-[0.99]"
                    >
                      <span className="font-nohemi text-base font-semibold text-[#0b0c0b]">
                        {getTranslatedText(product.name)}
                        {cartItem && (
                          <span className="ml-2 rounded-full bg-[#0b0c0b] px-2 py-0.5 text-xs font-medium text-white">
                            {cartItem.quantity}x
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
        <div className="border-t bg-white">
          {/* Cart Items */}
          <div className="max-h-[18vh] overflow-y-auto px-6 py-3">
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
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-800">
                      {getTranslatedText(item.product.name)}
                    </span>
                    <span className="text-xs text-gray-500">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
        <div className="border-t bg-gray-50 px-6 py-4">
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
    </DialogContent>
  );
}
