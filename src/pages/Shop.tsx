import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';

export default function Shop() {
  const { addToCart } = useCart();
  const { user, profile, toggleWishlist, loginWithGoogle } = useAuth();
  const { products, loadingProducts } = useProducts();
  const { settings } = useSettings();
  
  const featuredProducts = products.filter(p => p.isFeatured);

  const handleToggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleWishlist(productId);
  };

  return (
    <div className="space-y-16 pb-16">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-brand-green-800 text-brand-sand-50 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
      >
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center transition-all duration-700" 
          style={{ 
            backgroundImage: `url('${settings.homePageBanner || 'https://images.unsplash.com/photo-1549673967-df509cacee8f?auto=format&fit=crop&w=1200&q=80'}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green-900/40 to-transparent z-0" />
        <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-5xl text-brand-gold-400 leading-tight font-serif"
          >
            Authentic Sunnah Provisions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg text-brand-sand-100 opacity-90 max-w-xl leading-relaxed mx-auto md:mx-0"
          >
            Embrace a lifestyle of purity and wellness. Discover our curated collection of authentic Sunnah superfoods and natural remedies.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative z-10 bg-brand-gold-50/10 backdrop-blur-md border border-brand-gold-400/30 rounded-2xl p-5 flex items-center gap-4 max-w-sm w-full shrink-0"
        >
          <div>
            <h3 className="text-brand-gold-400 font-bold tracking-wide uppercase text-sm">Premium Gifting</h3>
            <p className="text-brand-sand-100 text-xs opacity-80 mt-1">Select "Make it a Gift" at checkout for elegant packaging.</p>
          </div>
        </motion.div>
      </motion.section>

      {loadingProducts ? (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-10 text-center">
                <h2 className="text-4xl text-brand-green-900 font-serif">Best Sellers</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {featuredProducts.map((product, index) => (
                  <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={index} 
                      isWished={profile?.wishlist?.includes(product.id) || false}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={addToCart}
                  />
                ))}
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 sm:mb-8 border-b border-brand-sand-200 pb-4">
              <h2 className="text-2xl sm:text-3xl text-brand-green-900">All Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  isWished={profile?.wishlist?.includes(product.id) || false}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
}
