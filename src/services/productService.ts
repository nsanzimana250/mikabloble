import { supabase } from "@/supabase";
import type { Product } from "@/data/products";

interface DBProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  review_count: number;
  in_stock: boolean;
  low_stock: boolean;
  image: string;
  images: string[];
  specs: Record<string, string>;
  compatibility: string[];
  category: { name: string } | null;
  brand: { name: string } | null;
}

const mapDBProduct = (p: DBProduct): Product => ({
  id: p.id,
  name: p.name,
  description: p.description || "",
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  reviewCount: p.review_count || 0,
  category: p.category?.name || "Uncategorized",
  brand: p.brand?.name || "Unknown",
  inStock: p.in_stock,
  lowStock: p.low_stock || false,
  image: p.image || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
  images: p.images || [],
  specs: p.specs || {},
  compatibility: p.compatibility || [],
});

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("MIKA_products")
    .select(`
      *,
      category:MIKA_categories(name),
      brand:MIKA_brands(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data || []).map(mapDBProduct);
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("MIKA_products")
    .select(`
      *,
      category:MIKA_categories(name),
      brand:MIKA_brands(name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data ? mapDBProduct(data) : null;
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("MIKA_categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
};

export const fetchBrands = async () => {
  const { data, error } = await supabase
    .from("MIKA_brands")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
  return data || [];
};

export const createProduct = async (product: {
  name: string;
  price: number;
  description: string;
  image: string;
  category_id?: string;
  brand_id?: string;
  in_stock?: boolean;
}) => {
  const { data, error } = await supabase
    .from("MIKA_products")
    .insert(product)
    .select(`*, category:MIKA_categories(name), brand:MIKA_brands(name)`)
    .single();

  if (error) throw error;
  return mapDBProduct(data);
};

export const updateProduct = async (id: string, updates: Record<string, any>) => {
  const { data, error } = await supabase
    .from("MIKA_products")
    .update(updates)
    .eq("id", id)
    .select(`*, category:MIKA_categories(name), brand:MIKA_brands(name)`)
    .single();

  if (error) throw error;
  return mapDBProduct(data);
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from("MIKA_products")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
