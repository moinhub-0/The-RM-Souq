import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { Product } from '../contexts/ProductContext';
import { ProductRating } from './ProductRating';

interface ProductCardProps {
  product: Product;
  index: number;
  isWished: boolean;
  onToggleWishlist: (e: React.MouseEvent, productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  index, 
  isWished, 
  onToggleWishlist, 
  onAddToCart 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-brand-sand-200 flex flex-col relative"
    >
      <div className="aspect-square overflow-hidden relative bg-brand-sand-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full" aria-label={`View ${product.name}`}>
          <img 
            src={product.imageUrl || undefined} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(e, product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm ${isWished ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={18} fill={isWished ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = `${window.location.origin}/product/${product.id}`;
              const shareData = {
                title: product.name,
                text: `Check out ${product.name} on The RM Souq!`,
                url: url,
              };
              if (navigator.share) {
                navigator.share(shareData).catch(console.error);
              } else {
                navigator.clipboard.writeText(url);
                alert('Product link copied to clipboard!');
              }
            }}
            className="p-2 rounded-full backdrop-blur-sm bg-white/90 text-gray-400 hover:text-brand-green-600 transition-colors shadow-sm"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 relative z-20">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${product.id}`} className="hover:text-brand-green-700 transition-colors">
            <h3 className="text-lg text-brand-green-900 font-serif line-clamp-1 leading-tight">{product.name}</h3>
          </Link>
        </div>
        
        <ProductRating productId={product.id} className="mb-3" />
        
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed h-10">{product.description}</p>
        
        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-brand-sand-100">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-lg text-brand-green-900 leading-none">₹{product.price.toLocaleString()}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs font-medium text-gray-400 line-through leading-none">₹{product.mrp.toLocaleString()}</span>
              )}
            </div>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[9px] uppercase tracking-wider font-bold text-red-600 mt-1">
                Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="flex-shrink-0 bg-brand-green-900 text-white hover:bg-brand-green-800 p-2.5 rounded-lg font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center group/btn"
            title="Add to Cart"
          >
            <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
