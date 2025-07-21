export type Product = {
  id: number;
  name: string;
  category: { name: string; id: number };
  outOfStock: boolean;
  price: number;
  quantity: number;
  imageUrl: string;
  description: string;
  categoryId: number;
  discount?: number;
  variants?: Array<{
    name: string;
    group: string;
    additionalPrice: number;
    outOfStock: boolean;
  }>;
};
