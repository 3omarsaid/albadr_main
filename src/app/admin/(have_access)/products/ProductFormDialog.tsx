'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SerializedProduct } from '@/types';
import { createProduct, updateProduct, getUniqueCategories, getUniqueUnits } from '@/actions/productActions';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { Loader2, X, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface ProductFormDialogProps {
  product?: SerializedProduct | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (product: SerializedProduct) => void;
}

export function ProductFormDialog({ product, isOpen, onOpenChange, onSaved }: ProductFormDialogProps) {
  const supabase = createSupabaseBrowserClient();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('جركن');
  const [price, setPrice] = useState<string | number>('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      getUniqueCategories().then(setCategories);
      getUniqueUnits().then(setUnits);
      
      if (product) {
        setTimeout(() => {
          
          setName(product.name);
          setDescription(product.description);
          setCategory(product.category);
          setUnit(product.unit);
          setPrice(product.price);
          setIsNegotiable(product.price === 0);
          setExistingImages(product.images || []);
          setNewImages([]);
        }, 0);
      } else {
        setTimeout(() => {
          setName('');
          setDescription('');
          setCategory('');
          setUnit('جركن');
          setPrice('');
          setIsNegotiable(false);
          setExistingImages([]);
          setNewImages([]);
        }, 0);
      }
    }
  }, [isOpen, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of newImages) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        });
        
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressedFile, { contentType: 'image/jpeg' });
          
        if (error) {
          console.error("Supabase upload error:", error);
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
          
        uploadedUrls.push(publicUrl);
      } catch (err) {
        console.error("Error compressing/uploading image:", err);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      toast.error('يرجى تعبئة الحقول الإلزامية');
      return;
    }
    
    setLoading(true);
    
    try {
      const uploadedUrls = await uploadImages();
      const finalImages = [...existingImages, ...uploadedUrls];
      
      const productData = {
        name,
        description,
        category,
        unit,
        price: isNegotiable ? 0 : Number(price),
        images: finalImages,
      };

      let result;
      if (isEditing && product) {
        result = await updateProduct(product.id, productData);
      } else {
        result = await createProduct({ ...productData, isActive: true });
      }

      if (result.success && result.product) {
        toast.success(isEditing ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
        onSaved(result.product);
        onOpenChange(false);
      } else {
        toast.error('حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-950">
            {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700 font-bold">اسم المنتج *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-zinc-50 border-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-zinc-700 font-bold">التصنيف *</Label>
              <Input 
                id="category" 
                list="category-list" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
                className="bg-zinc-50 border-zinc-200"
                placeholder="اختر أو اكتب تصنيف جديد"
              />
              <datalist id="category-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-700 font-bold">الوصف</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="bg-zinc-50 border-zinc-200 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-zinc-700 font-bold">الوحدة (الكمية المباعة)</Label>
              <Input 
                id="unit" 
                list="unit-list" 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)} 
                className="bg-zinc-50 border-zinc-200"
                placeholder="اختر أو اكتب وحدة (مثل: طن، كيلو...)"
              />
              <datalist id="unit-list">
                {units.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>

            <div className="space-y-4">
              <Label className="text-zinc-700 font-bold">السعر</Label>
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Checkbox 
                  id="negotiable" 
                  checked={isNegotiable} 
                  onCheckedChange={(checked) => setIsNegotiable(checked as boolean)}
                />
                <label htmlFor="negotiable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-emerald-700">
                  السعر يتم الاتفاق عليه (قابل للتفاوض)
                </label>
              </div>
              <Input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                disabled={isNegotiable}
                placeholder={isNegotiable ? "0" : "أدخل السعر"}
                className="bg-zinc-50 border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-zinc-700 font-bold">الصور</Label>
            
            <div className="flex flex-wrap gap-4 mb-4">
              {existingImages.map((img, idx) => (
                <div key={`exist-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200">
                  <Image src={img} alt="Product" fill className="object-cover" />
                  <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {newImages.map((file, idx) => (
                <div key={`new-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-emerald-200">
                  <Image src={URL.createObjectURL(file)} alt="New Product" fill className="object-cover" />
                  <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors bg-zinc-50">
                <UploadCloud className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">رفع صورة</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
