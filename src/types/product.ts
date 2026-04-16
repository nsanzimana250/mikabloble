export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  reviewCount: number;
  category: string;
  category_id?: string;
  brand: string;
  brand_id?: string;
  inStock: boolean;
  lowStock?: boolean;
  image: string;
  images?: string[];
  specs?: Record<string, string>;
  compatibility?: string[];
}

export interface Category {
  id: string;
  name: string;
  count?: number;
}

export interface Brand {
  id: string;
  name: string;
  count?: number;
}</content>
<parameter name="filePath">src/types/product.ts