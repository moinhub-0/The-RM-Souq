import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductRating } from '../components/ProductRating';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-24 space-y-6"
      >
        <div className="w-24 h-24 bg-brand-sand-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBagBigIcon className="w-10 h-10 text-brand-green-800/50" />
        </div>
        <h2 className="text-3xl text-brand-green-900">Your Cart is Empty</h2>
        <p className="text-gray-500 max-w-md mx-auto">Looks like you haven't added any of our premium Sunnah products to your cart yet.</p>
        <Link to="/" className="inline-block bg-brand-green-900 text-brand-gold-400 px-8 py-3 rounded-xl font-medium hover:bg-brand-green-800 transition-colors">
          Browse Shop
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8"
    >
      <h1 className="text-3xl mb-8 border-b border-brand-sand-200 pb-4">Shopping Cart ({totalItems} items)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence>
            {items.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.3 }}
                key={item.id} 
                className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-brand-sand-100"
              >
              <img src={item.imageUrl || undefined} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-medium text-brand-green-900">{item.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-brand-green-700 font-semibold">₹{item.price.toLocaleString()}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString()}</span>
                      )}
                    </div>
                    <ProductRating productId={item.id} className="mt-1 bg-brand-sand-50/50 px-1.5 py-0.5 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 bg-brand-sand-50 rounded-lg p-1 border border-brand-sand-200">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={16} /></button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 opacity-60 hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-brand-sand-100 h-fit sticky top-24"
        >
          <h3 className="text-xl mb-4 font-semibold">Order Summary</h3>
          <div className="space-y-3 text-sm text-gray-600 mb-6 border-b border-brand-sand-200 pb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">â¹. {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-brand-green-600 font-medium">Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-semibold text-brand-green-900 mb-6">
            <span>Total</span>
            <span>â¹. {totalPrice.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-green-900 text-brand-gold-400 py-4 rounded-xl font-semibold hover:bg-brand-green-800 transition-colors flex justify-center items-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ShoppingBagBigIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
