import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit2, Trash2, X, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts, useCategories, useBrands, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AdminProducts = () => {
  const { data: productList = [], isLoading } = useProducts();
  const { data: dbCategories = [] } = useCategories();
  const { data: dbBrands = [] } = useBrands();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category_id: "", brand_id: "", description: "", image: "" });

  const filtered = productList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditProductId(null);
    setForm({ name: "", price: "", category_id: "", brand_id: "", description: "", image: "" });
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditProductId(p.id);
    const catMatch = dbCategories.find((c: any) => c.name === p.category);
    const brandMatch = dbBrands.find((b: any) => b.name === p.brand);
    setForm({
      name: p.name,
      price: String(p.price),
      category_id: catMatch?.id || "",
      brand_id: brandMatch?.id || "",
      description: p.description,
      image: p.image,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        price: parseFloat(form.price) || 0,
        description: form.description,
        image: form.image || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
      };
      if (form.category_id) payload.category_id = form.category_id;
      if (form.brand_id) payload.brand_id = form.brand_id;

      if (editProductId) {
        await updateMutation.mutateAsync({ id: editProductId, updates: payload });
        toast.success("Product updated!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Product added!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.info("Product deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: productList.length },
            { label: "In Stock", value: productList.filter((p) => p.inStock).length },
            { label: "Out of Stock", value: productList.filter((p) => !p.inStock).length },
            { label: "Categories", value: [...new Set(productList.map((p) => p.category))].length },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-sm text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{p.category}</td>
                      <td className="p-4 font-semibold whitespace-nowrap">RWF {p.price.toLocaleString()}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.inStock ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                          {p.inStock ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No products found</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowForm(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl border border-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{editProductId ? "Edit Product" : "Add New Product"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Price (RWF)</Label><Input type="number" step="1" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required /></div>
                    <div>
                      <Label>Category</Label>
                      <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}>
                        <option value="">Select category</option>
                        {dbCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.brand_id} onChange={(e) => setForm((p) => ({ ...p, brand_id: e.target.value }))}>
                      <option value="">Select brand</option>
                      {dbBrands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div><Label>Description</Label><textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
                  <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://…" /></div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      {editProductId ? "Update" : "Add"} Product
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
