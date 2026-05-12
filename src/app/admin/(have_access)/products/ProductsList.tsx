'use client';

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { deleteProduct, updateProductStatus } from '@/actions/productActions';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Package } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SerializedProduct } from '@/types';
import { ProductFormDialog } from './ProductFormDialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

export default function ProductsList({ initialProducts }: { initialProducts: SerializedProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter(p => p.id !== id));
        toast.success("تم حذف المنتج بنجاح");
      } else {
        toast.error("فشل حذف المنتج");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatusStr: string) => {
    const isActive = newStatusStr === 'true';
    const result = await updateProductStatus(id, isActive);
    if (result.success && result.product) {
      setProducts(products.map(p => p.id === id ? result.product as SerializedProduct : p));
      toast.success("تم تحديث الحالة بنجاح");
    } else {
      toast.error("فشل تحديث الحالة");
    }
  };

  const openAddDialog = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleProductSaved = (savedProduct: SerializedProduct) => {
    if (selectedProduct) {
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    } else {
      setProducts([savedProduct, ...products]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openAddDialog} className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>إضافة منتج</span>
        </Button>
      </div>

      {/* ── Mobile Card List ── */}
      <div className="flex flex-col gap-4 md:hidden">
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-zinc-100">
            <Package className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-zinc-400 font-bold">لا توجد منتجات حالياً</p>
          </div>
        ) : products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-4 space-y-4"
          >
            {/* Top Row: Image & Primary Info */}
            <div className="flex items-start gap-4" dir="rtl">
              {/* Image with fallback */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-zinc-100 shrink-0 bg-zinc-50 flex items-center justify-center">
                {product.images && product.images[0] ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <Package className="w-8 h-8 text-zinc-200" />
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1 text-right">
                <h3 className="font-black text-emerald-950 text-base leading-tight line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[11px] text-zinc-500 font-bold line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-emerald-700 text-sm">
                      {product.price === 0 ? 'يحدد لاحقاً' : `${Number(product.price).toLocaleString()} ج.م`}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">/ {product.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status & Actions */}
            <div className="flex items-center justify-between border-t border-zinc-50 pt-3.5" dir="rtl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 ml-1">الحالة:</span>
                <Select 
                  value={product.isActive.toString()} 
                  onValueChange={(val) => handleStatusChange(product.id, val as string)}
                >
                  <SelectTrigger className={`h-8 border-0 font-black rounded-xl text-xs w-24 px-3 ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 shadow-xl" dir="rtl">
                    <SelectItem value="true" className="font-bold cursor-pointer text-emerald-700">نشط</SelectItem>
                    <SelectItem value="false" className="font-bold cursor-pointer text-rose-700">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEditDialog(product)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90 border border-zinc-100/50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 border border-zinc-100/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-[32px] shadow-sm border border-zinc-100">
        <div className="w-full overflow-x-auto pb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50">
                <TableHead className="text-right px-8 font-bold py-5 w-24">الصورة</TableHead>
                <TableHead className="text-right font-bold">المنتج</TableHead>
                <TableHead className="text-right font-bold">التصنيف</TableHead>
                <TableHead className="text-right font-bold">السعر / الوحدة</TableHead>
                <TableHead className="text-right font-bold">الحالة</TableHead>
                <TableHead className="text-right px-8 font-bold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/20 transition-colors">
                  <TableCell className="px-8">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-100">
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-950">{product.name}</span>
                      <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[200px]">
                        {product.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 font-bold px-3 py-1 rounded-lg text-[10px]">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-emerald-700">
                        {product.price === 0 ? 'يحدد لاحقاً' : `${Number(product.price).toLocaleString()} ج.م`}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">لكل {product.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={product.isActive.toString()} 
                      onValueChange={(val) => handleStatusChange(product.id, val as string)}
                    >
                      <SelectTrigger className={`h-8 border-0 font-bold rounded-lg text-xs w-28 ${product.isActive ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`} dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-zinc-100 shadow-xl" dir="rtl">
                        <SelectItem value="true" className="font-bold cursor-pointer text-blue-700">نشط</SelectItem>
                        <SelectItem value="false" className="font-bold cursor-pointer text-rose-700">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-8">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditDialog(product)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 border border-transparent hover:border-blue-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 border border-transparent hover:border-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    
      <ProductFormDialog 
        product={selectedProduct}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSaved={handleProductSaved}
      />
    </div>
  );
}
