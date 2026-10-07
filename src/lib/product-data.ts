import { supabase } from "@/supabase";
import type { Brand, Category, Product } from "@/types/product";

export const PRODUCT_PAGE_SIZE = 24;

const PRODUCT_CARD_COLUMNS = `
  id,
  name,
  price,
  original_price,
  review_count,
  category_id,
  brand_id,
  in_stock,
  low_stock,
  image,
  created_at,
  mika_categories!left (id, name),
  mika_brands!left (id, name)
`;

const PRODUCT_DETAIL_COLUMNS = `
  id,
  name,
  description,
  price,
  original_price,
  review_count,
  category_id,
  brand_id,
  in_stock,
  low_stock,
  image,
  images,
  specs,
  compatibility,
  created_at,
  updated_at,
  mika_categories!left (id, name),
  mika_brands!left (id, name)
`;

type Relation = { id?: string; name?: string } | Array<{ id?: string; name?: string }> | null;

const relationName = (relation: Relation, fallback: string) =>
  (Array.isArray(relation) ? relation[0]?.name : relation?.name) || fallback;

// PostgREST relation shapes are runtime data and are normalized at this boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapProduct = (row: Record<string, any>): Product => ({
  id: row.id,
  name: row.name,
  description: row.description || "",
  price: Number(row.price),
  originalPrice: row.original_price == null ? undefined : Number(row.original_price),
  reviewCount: row.review_count || 0,
  category: relationName(row.mika_categories, row.category || "Uncategorized"),
  category_id: row.category_id || undefined,
  brand: relationName(row.mika_brands, row.brand || "Unbranded"),
  brand_id: row.brand_id || undefined,
  inStock: row.in_stock ?? true,
  lowStock: row.low_stock ?? false,
  image: row.image || "",
  images: row.images || [],
  specs: row.specs || {},
  compatibility: row.compatibility || [],
});

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryIds?: string[];
  brandIds?: string[];
  sort?: "popularity" | "price-asc" | "price-desc";
}

export interface ProductPage {
  products: Product[];
  count: number;
}

export async function fetchProductPage(filters: ProductFilters): Promise<ProductPage> {
  const pageSize = filters.pageSize || PRODUCT_PAGE_SIZE;
  let query = supabase
    .from("mika_products")
    .select(PRODUCT_CARD_COLUMNS, { count: "exact" });

  const search = filters.search?.trim().replace(/[%_,()]/g, " ");
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (filters.categoryIds?.length) query = query.in("category_id", filters.categoryIds);
  if (filters.brandIds?.length) query = query.in("brand_id", filters.brandIds);

  if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  if (filters.page !== undefined) {
    const from = (filters.page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: (data || []).map(mapProduct), count: count || 0 };
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("mika_products")
    .select(PRODUCT_CARD_COLUMNS)
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("mika_products")
    .select(PRODUCT_DETAIL_COLUMNS)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function fetchRelatedProducts(categoryId: string, productId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("mika_products")
    .select(PRODUCT_CARD_COLUMNS)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(4);
  if (error) throw error;
  return (data || []).map(mapProduct);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("mika_categories")
    .select("id,name,description,image")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("mika_brands")
    .select("id,name")
    .order("name");
  if (error) throw error;
  return data || [];
}
