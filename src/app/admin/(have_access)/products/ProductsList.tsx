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

      <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100">
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
