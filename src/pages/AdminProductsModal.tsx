import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { useProducts, Product } from '../contexts/ProductContext';
import ImageUpload from '../components/ImageUpload';
import MultiImageUpload from '../components/MultiImageUpload';

interface AdminProductsModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function AdminProductsModal({ product, onClose }: AdminProductsModalProps) {
  const { addProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    mrp: 0,
    imageUrl: '',
    category: 'Dates',
    currency: 'INR',
    isFeatured: false,
    weight: '1kg',
    additionalImages: [],
    descriptionImages: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) {
        await updateProduct(product.id, formData);
      } else {
        await addProduct(formData as Omit<Product, 'id'>);
      }
      onClose();
    } catch (err) {
      alert("Failed to save product.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-green-900/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-10 border-b border-brand-sand-100 shrink-0">
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-serif text-brand-green-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={onClose} className="p-3 bg-brand-sand-100 hover:bg-brand-sand-200 text-brand-green-900 rounded-2xl transition-all"><X size={20}/></button>
            </div>
          </div>
          
          <div className="p-10 overflow-y-auto flex-grow text-sm">
            <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d]" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d] resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Description Media (Multiple Images/Videos)</label>
                <MultiImageUpload 
                  currentImages={formData.descriptionImages || []} 
                  onSuccess={(urls) => setFormData({...formData, descriptionImages: urls})}
                  folder="products/description"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Price (₹)</label>
                <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d]" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">MRP (₹) [Optional]</label>
                <input type="number" value={formData.mrp || ''} onChange={e => setFormData({...formData, mrp: Number(e.target.value)})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d]" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                <input type="text" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d]" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Weight</label>
                <input type="text" required value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#b48d3d]" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Product Image</label>
                <ImageUpload 
                  currentImage={formData.imageUrl} 
                  onSuccess={(url) => setFormData({...formData, imageUrl: url})}
                  folder="products"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Product Media (Slider Gallery)</label>
                <MultiImageUpload 
                  currentImages={formData.additionalImages || []} 
                  onSuccess={(urls) => setFormData({...formData, additionalImages: urls})}
                  folder="products/gallery"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                 <input type="checkbox" id="featured" checked={formData.isFeatured || false} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-5 h-5 accent-[#0d2b22]" />
                 <label htmlFor="featured" className="text-sm font-bold text-gray-800">Featured Product (Show on homepage banner section)</label>
              </div>
            </form>
          </div>
          
          <div className="p-8 border-t border-brand-sand-100 flex justify-end gap-4 shrink-0 bg-brand-sand-50/50">
            <button onClick={onClose} className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
            <button form="productForm" type="submit" disabled={loading} className="px-6 py-3 bg-[#0d2b22] text-brand-gold-400 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-[#0a2016] transition-all disabled:opacity-50 flex items-center gap-2">
              <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
