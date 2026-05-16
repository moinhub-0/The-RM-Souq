import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ArrowRight, ShieldCheck, Truck, RotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 md:p-20 rounded-[3rem] border border-brand-sand-200 shadow-xl"
        >
          <div className="w-24 h-24 bg-brand-sand-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-sand-100 shadow-inner">
             <ShoppingBag size={40} className="text-brand-green-900" />
          </div>
          <h2 className="text-4xl font-serif text-brand-green-900 mb-4">Your basket is empty</h2>
          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">Explore our collection of authentic Sunnah provisions and start your journey towards natural wellness.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 bg-brand-green-900 text-brand-gold-400 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-green-800 transition-all shadow-xl active:scale-95"
          >
            Explore Collection <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
           <h1 className="text-4xl md:text-6xl font-serif text-brand-green-900 leading-tight">Shopping Bag</h1>
           <p className="text-brand-gold-600 font-bold uppercase tracking-[0.2em] text-xs mt-2 ml-1">Secure manifest for your provisions</p>
        </div>
        <div className="bg-brand-sand-50 px-6 py-2 rounded-full border border-brand-sand-200 text-sm font-bold text-brand-green-900 shadow-sm flex items-center gap-2">
           <ShoppingBag size={18} /> {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id} 
                className="bg-white border border-brand-sand-200 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-8 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="w-full sm:w-48 aspect-square rounded-3xl overflow-hidden bg-brand-sand-50 border border-brand-sand-100 shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-serif text-brand-green-900 mb-2">{item.name}</h3>
                      <span className="text-[10px] uppercase font-black tracking-widest text-brand-gold-600 bg-brand-gold-50 px-3 py-1 rounded-full border border-brand-gold-100">Premium Quality</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 bg-brand-sand-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 sm:mt-0">
                    <div className="flex items-center bg-brand-sand-50 p-1.5 rounded-2xl shadow-inner border border-brand-sand-100 shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2.5 hover:bg-white rounded-xl transition-all text-brand-green-900 disabled:opacity-30 active:scale-90 shadow-sm"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-bold text-brand-green-900 text-lg">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2.5 hover:bg-white rounded-xl transition-all text-brand-green-900 active:scale-90 shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="text-right">
                       <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Item Total</p>
                       <p className="text-2xl font-black text-brand-green-900 italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 h-fit sticky top-24">
           <div className="bg-brand-green-900 rounded-[3rem] p-10 text-brand-sand-100 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <ShieldCheck size={200} />
              </div>
              
              <h3 className="text-2xl font-serif text-brand-gold-400 mb-8 border-b border-brand-green-800 pb-4">Order Summary</h3>
              
              <div className="space-y-6 mb-10">
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                   <span className="text-brand-sand-100/40">Gross Subtotal</span>
                   <span>₹{totalPrice.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                   <span className="text-brand-sand-100/40">Logistics execution</span>
                   <span className="text-brand-gold-400">Calculated at checkout</span>
                 </div>
                 <div className="h-px bg-white/10" />
                 <div className="flex justify-between items-end">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold-600 block mb-1">Grant Total</span>
                       <span className="text-xs text-brand-sand-100/30 italic">Estimated aggregate</span>
                    </div>
                    <span className="text-4xl font-black text-white italic">₹{totalPrice.toLocaleString()}</span>
                 </div>
              </div>

              <div className="space-y-4">
                <Link 
                  to="/checkout" 
                  className="w-full flex items-center justify-center gap-3 bg-brand-gold-400 text-brand-green-900 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-gold-300 transition-all shadow-xl active:scale-95"
                >
                  Secure Checkout <ArrowRight size={18} />
                </Link>
                <Link to="/" className="w-full block text-center py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-sand-100/50 hover:text-brand-sand-100 transition-colors">
                  Continue Browsing
                </Link>
              </div>
           </div>

           {/* Security Badges */}
           <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-brand-sand-200 flex flex-col items-center text-center gap-2">
                 <div className="text-brand-green-900"><Truck size={20} /></div>
                 <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Verified Ship</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-brand-sand-200 flex flex-col items-center text-center gap-2">
                 <div className="text-brand-green-900"><ShieldCheck size={20} /></div>
                 <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Purity Guarantee</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-brand-sand-200 flex flex-col items-center text-center gap-2">
                 <div className="text-brand-green-900"><RotateCcw size={20} /></div>
                 <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Easy Inward</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
