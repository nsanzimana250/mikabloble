import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Plus, Search, Edit2, Trash2, X, Package, 
  FolderPlus, Tag, Upload, Image as ImageIcon,
  PlusCircle, MinusCircle, Camera, AlertCircle, Eye,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/data/products";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface Brand {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductWithRelations extends Product {
  category_id?: string;
  brand_id?: string;
}

interface SpecItem {
  key: string;
  value: string;
}

const AdminProducts = () => {
  const [productList, setProductList] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductWithRelations | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategorySection, setShowCategorySection] = useState(false);
  const [showBrandSection, setShowBrandSection] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ 
    isOpen: boolean; 
    type: 'product' | 'category' | 'brand'; 
    id: string; 
    name: string 
  }>({ isOpen: false, type: 'product', id: '', name: '' });
  const [viewProduct, setViewProduct] = useState<ProductWithRelations | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Product Form State with dynamic fields
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    brandId: "",
    description: "",
    image: "",
    inStock: true,
    lowStock: false,
    compatibility: [] as string[],
    specs: [] as SpecItem[],
    images: [] as string[]
  });

  // New input fields for dynamic addition
  const [newCompatibility, setNewCompatibility] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: ""
  });

  // Brand Form State
  const [brandForm, setBrandForm] = useState({
    name: ""
  });

  // URL input states
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [additionalImageUrl, setAdditionalImageUrl] = useState("");

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('mika_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error('Failed to fetch categories');
        setCategories([]);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('mika_brands')
        .select('*')
        .order('name');
      
      if (brandsError) {
        console.error('Error fetching brands:', brandsError);
        toast.error('Failed to fetch brands');
        setBrands([]);
      } else {
        setBrands(brandsData || []);
      }

      // Fetch products with category and brand relations
      const { data: productsData, error: productsError } = await supabase
        .from('mika_products')
        .select(`
          *,
          mika_categories!left (id, name),
          mika_brands!left (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('Failed to fetch products');
        setProductList([]);
      } else if (productsData) {
        // Transform data to match Product interface
        const transformedProducts = productsData.map(product => {
          // Parse specs from JSONB to array format if needed
          let specsArray: SpecItem[] = [];
          if (product.specs && typeof product.specs === 'object') {
            specsArray = Object.entries(product.specs).map(([key, value]) => ({
              key,
              value: String(value)
            }));
          }

          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
            reviewCount: product.review_count || 0,
            category: product.mika_categories?.name || 'Uncategorized',
            category_id: product.category_id,
            brand: product.mika_brands?.name || 'Unbranded',
            brand_id: product.brand_id,
            inStock: product.in_stock,
            lowStock: product.low_stock || false,
            image: product.image || '',
            images: product.images || [],
            specs: product.specs || {},
            compatibility: product.compatibility || []
          };
        });

        setProductList(transformedProducts);
      } else {
        setProductList([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Image URL handlers
  const addImageUrl = () => {
    if (!imageUrlInput.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrlInput);
      setProductForm(prev => ({ ...prev, image: imageUrlInput }));
      setImageUrlInput('');
      toast.success('Main image URL added');
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)');
    }
  };

  const addAdditionalImageUrl = () => {
    if (!additionalImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    if (productForm.images.length >= 3) {
      toast.error('Maximum 3 additional images allowed');
      return;
    }

    // Basic URL validation
    try {
      new URL(additionalImageUrl);
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, additionalImageUrl]
      }));
      setAdditionalImageUrl('');
      toast.success('Additional image URL added');
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)');
    }
  };

  const removeMainImage = () => {
    setProductForm(prev => ({ ...prev, image: '' }));
  };

  const removeAdditionalImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Compatibility handlers
  const addCompatibility = () => {
    if (!newCompatibility.trim()) {
      toast.error('Please enter a compatibility value');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      compatibility: [...prev.compatibility, newCompatibility.trim()]
    }));
    setNewCompatibility('');
  };

  const removeCompatibility = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      compatibility: prev.compatibility.filter((_, i) => i !== index)
    }));
  };

  // Specifications handlers
  const addSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      toast.error('Both key and value are required');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      specs: [...prev.specs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]
    }));
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpec = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const filtered = productList.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  // Product Form Handlers
  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({
      name: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      brandId: "",
      description: "",
      image: "",
      inStock: true,
      lowStock: false,
      compatibility: [],
      specs: [],
      images: []
    });
    setImageUrlInput('');
    setAdditionalImageUrl('');
    setNewCompatibility('');
    setNewSpecKey('');
    setNewSpecValue('');
    setShowProductForm(true);
  };

  const openEditProduct = (p: ProductWithRelations) => {
    setEditProduct(p);
    
    // Convert specs from object to array if needed
    let specsArray: SpecItem[] = [];
    if (p.specs && typeof p.specs === 'object') {
      specsArray = Object.entries(p.specs).map(([key, value]) => ({
        key,
        value: String(value)
      }));
    }

    setProductForm({
      name: p.name,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      categoryId: p.category_id || "",
      brandId: p.brand_id || "",
      description: p.description || "",
      image: p.image || "",
      inStock: p.inStock,
      lowStock: p.lowStock || false,
      compatibility: p.compatibility || [],
      specs: specsArray,
      images: p.images || []
    });
    setImageUrlInput('');
    setAdditionalImageUrl('');
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!productForm.name) {
        toast.error('Product name is required');
        return;
      }
      if (!productForm.price) {
        toast.error('Price is required');
        return;
      }
      if (!productForm.categoryId) {
        toast.error('Category is required');
        return;
      }
      if (!productForm.brandId) {
        toast.error('Brand is required');
        return;
      }

      // Convert specs array to object
      const specsObject = productForm.specs.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        category_id: productForm.categoryId,
        brand_id: productForm.brandId,
        description: productForm.description || null,
        image: productForm.image || null, // Make sure image is included
        images: productForm.images || [],
        in_stock: productForm.inStock,
        low_stock: productForm.lowStock,
        specs: specsObject,
        compatibility: productForm.compatibility || [],
        updated_at: new Date().toISOString()
      };

      console.log('Submitting product data:', productData); // Debug log

      if (editProduct) {
        // Update existing product
        const { error } = await supabase
          .from('mika_products')
          .update(productData)
          .eq('id', editProduct.id);
        
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        // Add new product
        const { error } = await supabase
          .from('mika_products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        toast.success("Product added successfully!");
      }
      
      setShowProductForm(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    }
  };

  // Category Form Handlers
  const openAddCategory = () => {
    setEditCategory(null);
    setCategoryForm({ name: "" });
    setShowCategoryForm(true);
  };

  const openEditCategory = (category: Category) => {
    setEditCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editCategory) {
        const { error } = await supabase
          .from('mika_categories')
          .update({ 
            name: categoryForm.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editCategory.id);
        
        if (error) throw error;
        toast.success("Category updated successfully!");
      } else {
        const { error } = await supabase
          .from('mika_categories')
          .insert([{ 
            name: categoryForm.name,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        toast.success("Category added successfully!");
      }
      
      setShowCategoryForm(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(`Failed to save category: ${error.message}`);
    }
  };

  // Brand Form Handlers
  const openAddBrand = () => {
    setEditBrand(null);
    setBrandForm({ name: "" });
    setShowBrandForm(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditBrand(brand);
    setBrandForm({ name: brand.name });
    setShowBrandForm(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandForm.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    try {
      if (editBrand) {
        const { error } = await supabase
          .from('mika_brands')
          .update({ 
            name: brandForm.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editBrand.id);
        
        if (error) throw error;
        toast.success("Brand updated successfully!");
      } else {
        const { error } = await supabase
          .from('mika_brands')
          .insert([{ 
            name: brandForm.name,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        toast.success("Brand added successfully!");
      }
      
      setShowBrandForm(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast.error(`Failed to save brand: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const table = deleteDialog.type === 'product' ? 'mika_products' : 
                    deleteDialog.type === 'category' ? 'mika_categories' : 'mika_brands';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', deleteDialog.id);
      
      if (error) throw error;
      
      toast.success(`${deleteDialog.type.charAt(0).toUpperCase() + deleteDialog.type.slice(1)} deleted successfully!`);
      fetchAllData();
    } catch (error: any) {
      console.error(`Error deleting ${deleteDialog.type}:`, error);
      toast.error(`Failed to delete ${deleteDialog.type}: ${error.message}`);
    } finally {
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const openDeleteDialog = (type: 'product' | 'category' | 'brand', id: string, name: string) => {
    setDeleteDialog({ isOpen: true, type, id, name });
  };

  // Image gallery handlers
  const openImageGallery = (product: ProductWithRelations, index: number = 0) => {
    setViewProduct(product);
    setSelectedImageIndex(index);
    setShowImageGallery(true);
  };

  const nextImage = () => {
    if (!viewProduct) return;
    const totalImages = [viewProduct.image, ...(viewProduct.images || [])].filter(Boolean).length;
    setSelectedImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!viewProduct) return;
    const totalImages = [viewProduct.image, ...(viewProduct.images || [])].filter(Boolean).length;
    setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Get all images for gallery
  const getAllImages = (product: ProductWithRelations) => {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    return images;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header with Management Toggles */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Search products, categories, brands…" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCategorySection(!showCategorySection)}>
                <Tag className="h-4 w-4 mr-2" />
                {showCategorySection ? 'Hide' : 'Manage'} Categories
              </Button>
              <Button variant="outline" onClick={() => setShowBrandSection(!showBrandSection)}>
                <Package className="h-4 w-4 mr-2" />
                {showBrandSection ? 'Hide' : 'Manage'} Brands
              </Button>
              <Button onClick={openAddProduct}>
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>
          </div>

          {/* Categories Management Section */}
          <AnimatePresence>
            {showCategorySection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Categories Management
                    </h3>
                    <Button size="sm" onClick={openAddCategory}>
                      <Plus className="h-3 w-3 mr-1" /> Add Category
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => openEditCategory(category)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog('category', category.id, category.name)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brands Management Section */}
          <AnimatePresence>
            {showBrandSection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" /> Brands Management
                    </h3>
                    <Button size="sm" onClick={openAddBrand}>
                      <Plus className="h-3 w-3 mr-1" /> Add Brand
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {brands.map(brand => (
                      <div key={brand.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
                        <span className="text-sm font-medium">{brand.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => openEditBrand(brand)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog('brand', brand.id, brand.name)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Products", value: productList.length, icon: Package },
                { label: "Categories", value: categories.length, icon: Tag },
                { label: "Brands", value: brands.length, icon: Package },
                { label: "In Stock", value: productList.filter((p) => p.inStock).length, icon: Package },
              ].map((stat, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Brand</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="relative cursor-pointer group"
                              onClick={() => openImageGallery(p, 0)}
                            >
                              <img 
                                src={p.image || '/placeholder-image.jpg'} 
                                alt={p.name} 
                                className="h-10 w-10 rounded-lg object-cover shrink-0 border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">{p.name}</p>
                              {(p.image || (p.images && p.images.length > 0)) && (
                                <p className="text-xs text-muted-foreground">
                                  {p.image ? '1 main' : '0 main'} + {(p.images?.length || 0)} additional
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-secondary/10 rounded-full text-xs">
                            {p.brand}
                          </span>
                        </td>
                        <td className="p-4 font-semibold whitespace-nowrap">
                          {p.originalPrice ? (
                            <div className="flex flex-col">
                              <span className="text-xs line-through text-muted-foreground">
                                RWF {p.originalPrice.toLocaleString()}
                              </span>
                              <span>RWF {p.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span>RWF {p.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            !p.inStock ? "bg-red-500/10 text-red-500" : 
                            p.lowStock ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
                          }`}>
                            {!p.inStock ? "Out of Stock" : p.lowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setViewProduct(p)} 
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openEditProduct(p)} 
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteDialog('product', p.id, p.name)} 
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No products found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Product Form Modal */}
        <AnimatePresence>
          {showProductForm && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" 
              onClick={() => setShowProductForm(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-card rounded-2xl p-6 w-full max-w-3xl my-8 shadow-xl border border-border" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b">
                  <h2 className="text-lg font-bold">{editProduct ? "Edit Product" : "Add New Product"}</h2>
                  <button onClick={() => setShowProductForm(false)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleProductSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="product-name">Product Name *</Label>
                      <Input 
                        id="product-name"
                        value={productForm.name} 
                        onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} 
                        required 
                        placeholder="Enter product name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-price">Price (RWF) *</Label>
                        <Input 
                          id="product-price"
                          type="number" 
                          step="1" 
                          min="0"
                          value={productForm.price} 
                          onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} 
                          required 
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-original-price">Original Price (RWF)</Label>
                        <Input 
                          id="product-original-price"
                          type="number" 
                          step="1" 
                          min="0"
                          value={productForm.originalPrice} 
                          onChange={(e) => setProductForm(p => ({ ...p, originalPrice: e.target.value }))} 
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-category">Category *</Label>
                        <select 
                          id="product-category"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm(p => ({ ...p, categoryId: e.target.value }))}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="product-brand">Brand *</Label>
                        <select 
                          id="product-brand"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={productForm.brandId}
                          onChange={(e) => setProductForm(p => ({ ...p, brandId: e.target.value }))}
                          required
                        >
                          <option value="">Select a brand</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Stock Information</h3>
                    
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="inStock" 
                          checked={productForm.inStock}
                          onChange={(e) => setProductForm(p => ({ ...p, inStock: e.target.checked }))}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <Label htmlFor="inStock" className="text-sm">In Stock</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="lowStock" 
                          checked={productForm.lowStock}
                          onChange={(e) => setProductForm(p => ({ ...p, lowStock: e.target.checked }))}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <Label htmlFor="lowStock" className="text-sm">Low Stock Warning</Label>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Description</h3>
                    
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <textarea 
                        id="product-description"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring" 
                        value={productForm.description} 
                        onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>

                  {/* Images Section - Simplified with URL inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Images (URLs)</h3>
                    
                    {/* Main Image */}
                    <div>
                      <Label>Main Product Image URL *</Label>
                      <div className="mt-2 space-y-3">
                        {productForm.image && (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border group">
                            <img 
                              src={productForm.image} 
                              alt="Main product preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                              }}
                            />
                            <button
                              type="button"
                              onClick={removeMainImage}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        
                        {!productForm.image && (
                          <div className="flex gap-2">
                            <Input
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={addImageUrl}
                              size="sm"
                            >
                              Add URL
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enter a valid image URL (must include http:// or https://)
                        </p>
                      </div>
                    </div>

                    {/* Additional Images (max 3) */}
                    <div>
                      <Label>Additional Images URLs (Max 3)</Label>
                      <div className="mt-2 space-y-3">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {productForm.images.map((img, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img 
                                src={img} 
                                alt={`Additional ${index + 1}`} 
                                className="w-full h-full rounded-lg object-cover border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {productForm.images.length < 3 && (
                            <div className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {productForm.images.length < 3 && (
                          <div className="flex gap-2">
                            <Input
                              value={additionalImageUrl}
                              onChange={(e) => setAdditionalImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={addAdditionalImageUrl}
                              size="sm"
                            >
                              Add URL
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {productForm.images.length}/3 images. Enter valid image URLs with http:// or https://
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Compatibility</h3>
                    
                    <div className="space-y-3">
                      {/* List of compatibility items */}
                      <div className="flex flex-wrap gap-2">
                        {productForm.compatibility.map((item, index) => (
                          <div key={index} className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                            <span className="text-sm">{item}</span>
                            <button
                              type="button"
                              onClick={() => removeCompatibility(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new compatibility */}
                      <div className="flex gap-2">
                        <Input
                          value={newCompatibility}
                          onChange={(e) => setNewCompatibility(e.target.value)}
                          placeholder="e.g., iPhone 12, Samsung S21, etc."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCompatibility();
                            }
                          }}
                        />
                        <Button type="button" onClick={addCompatibility} size="sm">
                          <PlusCircle className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add devices or models this product is compatible with
                      </p>
                    </div>
                  </div>

                  {/* Specifications Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Specifications</h3>
                    
                    <div className="space-y-3">
                      {/* List of specifications */}
                      <div className="space-y-2">
                        {productForm.specs.map((spec, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                            <div className="grid grid-cols-2 flex-1 gap-2">
                              <Input
                                value={spec.key}
                                onChange={(e) => {
                                  const newSpecs = [...productForm.specs];
                                  newSpecs[index].key = e.target.value;
                                  setProductForm(p => ({ ...p, specs: newSpecs }));
                                }}
                                placeholder="Key (e.g., Processor)"
                                className="bg-background"
                              />
                              <Input
                                value={spec.value}
                                onChange={(e) => {
                                  const newSpecs = [...productForm.specs];
                                  newSpecs[index].value = e.target.value;
                                  setProductForm(p => ({ ...p, specs: newSpecs }));
                                }}
                                placeholder="Value (e.g., Intel i7)"
                                className="bg-background"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSpec(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <MinusCircle className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new specification */}
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          placeholder="Key (e.g., Processor)"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            placeholder="Value (e.g., Intel i7)"
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSpec();
                              }
                            }}
                          />
                          <Button type="button" onClick={addSpec} size="sm">
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add technical specifications as key-value pairs
                      </p>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-card border-t mt-6 -mx-6 px-6 py-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowProductForm(false)} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editProduct ? "Update" : "Add"} Product
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Form Modal */}
        <AnimatePresence>
          {showCategoryForm && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" 
              onClick={() => setShowCategoryForm(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{editCategory ? "Edit Category" : "Add New Category"}</h2>
                  <button onClick={() => setShowCategoryForm(false)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name *</Label>
                    <Input 
                      id="category-name"
                      value={categoryForm.name} 
                      onChange={(e) => setCategoryForm({ name: e.target.value })} 
                      required 
                      placeholder="Enter category name"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCategoryForm(false)} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editCategory ? "Update" : "Add"} Category
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Form Modal */}
        <AnimatePresence>
          {showBrandForm && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" 
              onClick={() => setShowBrandForm(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{editBrand ? "Edit Brand" : "Add New Brand"}</h2>
                  <button onClick={() => setShowBrandForm(false)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="brand-name">Brand Name *</Label>
                    <Input 
                      id="brand-name"
                      value={brandForm.name} 
                      onChange={(e) => setBrandForm({ name: e.target.value })} 
                      required 
                      placeholder="Enter brand name"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowBrandForm(false)} 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editBrand ? "Update" : "Add"} Brand
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product View Modal */}
        <AnimatePresence>
          {viewProduct && !showImageGallery && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" 
              onClick={() => setViewProduct(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-card rounded-2xl p-6 w-full max-w-4xl my-8 shadow-xl border border-border" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b">
                  <h2 className="text-lg font-bold">Product Details</h2>
                  <button onClick={() => setViewProduct(null)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Images */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Images</h3>
                    <div className="space-y-2">
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => openImageGallery(viewProduct, 0)}
                      >
                        <img 
                          src={viewProduct.image || '/placeholder-image.jpg'} 
                          alt={viewProduct.name} 
                          className="w-full h-64 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">Click to view gallery</span>
                        </div>
                      </div>
                      {viewProduct.images && viewProduct.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {viewProduct.images.map((img, index) => (
                            <div 
                              key={index} 
                              className="relative cursor-pointer group"
                              onClick={() => openImageGallery(viewProduct, index + 1)}
                            >
                              <img 
                                src={img || '/placeholder-image.jpg'} 
                                alt={`Additional ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Basic Information</h3>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label className="text-sm text-muted-foreground">Product Name</Label>
                          <p className="font-medium">{viewProduct.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Category</Label>
                          <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">{viewProduct.category}</span>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Brand</Label>
                          <span className="px-2 py-1 bg-secondary/10 rounded-full text-xs">{viewProduct.brand}</span>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Price</Label>
                          <p className="font-semibold text-lg">
                            RWF {viewProduct.price.toLocaleString()}
                            {viewProduct.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                RWF {viewProduct.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Stock Status</Label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            !viewProduct.inStock ? "bg-red-500/10 text-red-500" : 
                            viewProduct.lowStock ? "bg-yellow-500/10 text-yellow-600" : "bg-green-500/10 text-green-600"
                          }`}>
                            {!viewProduct.inStock ? "Out of Stock" : viewProduct.lowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Description</h3>
                      <p className="text-sm text-muted-foreground mt-2">{viewProduct.description}</p>
                    </div>

                    {viewProduct.compatibility && viewProduct.compatibility.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Compatibility</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {viewProduct.compatibility.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 rounded-full text-xs">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewProduct.specs && Object.keys(viewProduct.specs).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Specifications</h3>
                        <div className="mt-2 space-y-2">
                          {Object.entries(viewProduct.specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-4">
                              <span className="text-sm font-medium">{key}:</span>
                              <span className="text-sm text-muted-foreground">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-card border-t mt-6 -mx-6 px-6 py-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setViewProduct(null)} 
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewProduct(null);
                    openEditProduct(viewProduct);
                  }}>
                    Edit Product
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Gallery Modal */}
        <AnimatePresence>
          {showImageGallery && viewProduct && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" 
              onClick={() => setShowImageGallery(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="relative w-full max-w-5xl" 
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowImageGallery(false)} 
                  className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="relative">
                  {/* Main Image */}
                  <div className="flex items-center justify-center">
                    <img 
                      src={getAllImages(viewProduct)[selectedImageIndex] || '/placeholder-image.jpg'} 
                      alt={`${viewProduct.name} - Image ${selectedImageIndex + 1}`} 
                      className="max-h-[80vh] max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>

                  {/* Navigation Arrows */}
                  {getAllImages(viewProduct).length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {getAllImages(viewProduct).length}
                  </div>
                </div>

                {/* Thumbnails */}
                {getAllImages(viewProduct).length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {getAllImages(viewProduct).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img || '/placeholder-image.jpg'} 
                          alt={`Thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Delete {deleteDialog.type.charAt(0).toUpperCase() + deleteDialog.type.slice(1)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.type === 'product' && `Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
                {deleteDialog.type === 'category' && `Are you sure you want to delete category "${deleteDialog.name}"? Products in this category will be uncategorized. This action cannot be undone.`}
                {deleteDialog.type === 'brand' && `Are you sure you want to delete brand "${deleteDialog.name}"? Products from this brand will be unbranded. This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;