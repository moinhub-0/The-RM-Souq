import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts, Product } from '../contexts/ProductContext';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function Shop() {
  const { addToCart } = useCart();
  const { user, profile, toggleWishlist, loginWithGoogle } = useAuth();
  const { products, loadingProducts } = useProducts();
  
  const featuredProducts = products.filter(p => p.isFeatured);
  const otherProducts = products.filter(p => !p.isFeatured);

  const handleToggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Prevent navigating to product details
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleWishlist(productId);
  };

  const ProductCard = ({ product, index }: { product: Product, index: number }) => {
    const isWished = profile?.wishlist?.includes(product.id) || false;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-brand-sand-200 flex flex-col relative"
      >
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
        
        <div className="aspect-square overflow-hidden relative bg-brand-sand-100">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-brand-green-900 shadow-sm z-10">
            {product.category}
          </div>
          <button 
            onClick={(e) => handleToggleWishlist(e, product.id)}
            className={`absolute top-4 left-4 p-2 rounded-full backdrop-blur-sm z-10 transition-colors shadow-sm ${isWished ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={18} fill={isWished ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
          <h3 className="text-xl mb-2 text-brand-green-900 font-serif">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
          <div className="mt-auto flex items-center justify-between pointer-events-auto">
            <span className="font-semibold text-lg text-brand-green-700">â¹. {product.price.toLocaleString()}</span>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
              className="bg-brand-green-900 text-brand-gold-400 hover:bg-brand-green-800 hover:text-brand-gold-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-brand-green-800 text-brand-sand-50 rounded-3xl p-8 sm:p-16 text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1549673967-df509cacee8f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl text-brand-gold-400 leading-tight">Authentic Sunnah & Halal Provisions</h1>
          <p className="text-lg sm:text-xl text-brand-sand-100 opacity-90 max-w-2xl mx-auto">
            Discover our premium selection of carefully sourced dates and natural products, honoring tradition and purity.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      {loadingProducts ? (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <section>
              <div className="mb-8 border-b border-brand-sand-200 pb-4">
                <h2 className="text-3xl text-brand-green-900">Featured Picks</h2>
                <p className="text-gray-500 mt-2">Curated selection of our finest dates</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          <section>
            <div className="mb-8 border-b border-brand-sand-200 pb-4">
              <h2 className="text-3xl text-brand-green-900">All Products</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No products available.
                  {(user?.email === 'moincomp06@gmail.com' || user?.email === 'moincomp06@gmail.cm') && (
                    <div className="mt-4">
                      <Link to="/admin" className="text-brand-green-700 underline">Go to Admin Dashboard to add products</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
