import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchBrands,
  fetchCategories,
  fetchFeaturedProducts,
  fetchProduct,
  fetchProductPage,
  fetchRelatedProducts,
  type ProductFilters,
} from "@/lib/product-data";

export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  featured: ["products", "featured"] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  related: (categoryId: string, id: string) => ["products", "related", categoryId, id] as const,
  categories: ["catalog", "categories"] as const,
  brands: ["catalog", "brands"] as const,
};

export const useProductPage = (filters: ProductFilters, enabled = true) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProductPage(filters),
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 5 * 60_000,
  });

export const useFeaturedProducts = () =>
  useQuery({ queryKey: productKeys.featured, queryFn: fetchFeaturedProducts, staleTime: 10 * 60_000 });

export const useProduct = (id?: string) =>
  useQuery({
    queryKey: productKeys.detail(id || ""),
    queryFn: () => fetchProduct(id!),
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
  });

export const useRelatedProducts = (categoryId?: string, productId?: string) =>
  useQuery({
    queryKey: productKeys.related(categoryId || "", productId || ""),
    queryFn: () => fetchRelatedProducts(categoryId!, productId!),
    enabled: Boolean(categoryId && productId),
    staleTime: 10 * 60_000,
  });

export const useCategories = () =>
  useQuery({ queryKey: productKeys.categories, queryFn: fetchCategories, staleTime: 30 * 60_000 });

export const useBrands = () =>
  useQuery({ queryKey: productKeys.brands, queryFn: fetchBrands, staleTime: 30 * 60_000 });
