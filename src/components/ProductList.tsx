import ProductCard from "@/components/ProductCard";
import { useProductPage } from "@/hooks/use-product-data";
import type { Product } from "@/types/product";

interface ProductListProps {
  onProductClick?: (product: Product) => void;
}

const ProductList = ({ onProductClick }: ProductListProps) => {
  const { data, isPending, error } = useProductPage({ page: 1, sort: "popularity" });

  if (isPending) {
    return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />)}</div>;
  }
  if (error) return <div className="py-8 text-center text-red-500">Failed to load products.</div>;
  if (!data?.products.length) return <div className="py-8 text-center text-muted-foreground">No products found.</div>;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {data.products.map((product) => (
        <div key={product.id} onClick={() => onProductClick?.(product)}><ProductCard product={product} /></div>
      ))}
    </div>
  );
};

export default ProductList;
