import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchBrands,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import { products as staticProducts, categories as staticCategories, brands as staticBrands } from "@/data/products";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    placeholderData: staticProducts,
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    placeholderData: () => staticProducts.find((p) => p.id === id) || null,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
    placeholderData: staticCategories.map((c, i) => ({ id: String(i), name: c.name })),
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 10,
    placeholderData: staticBrands.map((b, i) => ({ id: String(i), name: b })),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, any> }) =>
      updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
