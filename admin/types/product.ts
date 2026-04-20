// i18n Types
export type SupportedLanguage = 'pt' | 'en' | 'es';

export interface TranslatedField {
  pt: string;
  en: string;
  es: string;
}

export type ProductVariation = {
  id: number;
  name: TranslatedField;
  group: string;
  additionalPrice: number;
  outOfStock: boolean;
  productId: number;
};

export type Product = {
  id: number;
  name: TranslatedField;
  category: { name: TranslatedField; id: number };
  outOfStock: boolean;
  price: number;
  quantity: number;
  imageUrl: string;
  description: TranslatedField;
  categoryId: number;
  discount?: number;
  tags?: string[];
  ProductVariation?: ProductVariation[];
  variants?: Array<{
    name: TranslatedField;
    group: string;
    additionalPrice: number;
    outOfStock: boolean;
  }>;
};

export type Category = {
  id: number;
  name: TranslatedField;
  priority?: number;
  shopId?: number;
};

// Helper function to get text in a specific language
export function getTranslatedText(
  field: TranslatedField | string | undefined,
  language: SupportedLanguage = 'pt'
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[language] || field.pt || '';
}
