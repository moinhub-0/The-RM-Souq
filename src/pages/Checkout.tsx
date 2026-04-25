import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, Mail, User as UserIcon } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Checkout() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    fullAddress: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGift, setIsGift] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/profile?redirect=/checkout');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        pincode: profile.pincode || '',
        city: profile.city || '',
        state: profile.state || '',
        fullAddress: profile.fullAddress || '',
      });
    }
  }, [profile]);

  if (loading || !user) {
    return <div className="text-center py-20 text-gray-500">Loading checkout...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-brand-green-700 underline">Return to Shop</button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Save Address back to profile
      await updateProfile(formData);

      // 2. Save order to Firebase
      const newOrder = {
        userId: user.uid,
        userName: formData.name,
        email: formData.email,
        phone: formData.phone,
        shippingDetails: formData,
        items: items,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: Date.now(),
        isGift: isGift
      };
      await addDoc(collection(db, 'orders'), newOrder);

      // 3. Generate WhatsApp Text
      const waNumber = "917853903438";
      const itemListText = items.map(i => `- ${i.quantity}x ${i.name} (\u20B9${i.price * i.quantity})`).join('\n');
      
      const giftMessage = isGift ? "🎁 *THIS IS A GIFT ORDER*\n*Payment Method requested:* UPI Only (No COD for gifts)\n\n" : "";

      const message = `*New Order: The RM Souq* \ud83d\uded2

${giftMessage}*Order Summary:*
${itemListText}
*Total:* \u20B9${totalPrice}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

*Shipping Address:*
${formData.fullAddress}
${formData.city}, ${formData.state}
Pincode: ${formData.pincode}

Please confirm my order and share available payment methods.`;

      // 4. Clear cart
      clearCart();

      // 5. Redirect to WhatsApp
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      
      // 6. Navigate to orders
      navigate('/my-orders');
      
    } catch (error) {
      console.error("Error processing order", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl mb-8 border-b border-brand-sand-200 pb-4">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl mb-6 font-semibold flex items-center gap-2">
            <MapPin className="text-brand-gold-500" />
            Shipping details
          </h2>
          <form id="checkout-form" onSubmit={handleCompleteOrder} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="pl-10 w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none transition-shadow" placeholder="Mohamed Ali" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="pl-10 w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="pl-10 w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="ali@example.com" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address (Street, House No, Locality)</label>
                <textarea required name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} rows={3} className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none resize-none" placeholder="123 Halal Market Road..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="Maharashtra" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none w-1/2" placeholder="400001" />
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-brand-sand-100 p-6 rounded-2xl sticky top-24">
            <h3 className="text-xl mb-6 font-semibold flex items-center gap-2">
              <ShoppingBag className="text-brand-green-700" />
              Your Order
            </h3>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-brand-green-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium text-brand-green-700">â¹. {(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-sand-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-serif text-brand-green-900 mb-4">
                <span>Total Amount</span>
                <span>₹ {totalPrice.toLocaleString()}</span>
              </div>
              
              <div className={`border-2 p-5 rounded-2xl mb-6 transition-all shadow-sm ${isGift ? 'bg-brand-gold-50 border-brand-gold-400' : 'bg-white border-brand-sand-200 hover:border-brand-gold-300'}`}>
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className={`mt-1 p-2 rounded-full transition-colors ${isGift ? 'bg-brand-gold-400 text-white shadow-md' : 'bg-brand-sand-100 text-brand-gold-500'}`}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-brand-green-900 block">Make this a Gift Order</span>
                      <input 
                        type="checkbox" 
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className="w-5 h-5 accent-brand-gold-600 rounded border-gray-300 cursor-pointer" 
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <span className="text-sm text-gray-600 block mt-2 leading-relaxed">
                      We'll package your items elegantly in our premium gift boxes, perfect for surprising your loved ones.
                      {isGift && (
                        <span className="block mt-3 text-brand-gold-800 bg-brand-gold-200/50 p-3 rounded-lg border border-brand-gold-200/50 font-medium">
                          <span className="font-bold uppercase tracking-widest text-[10px] block opacity-70 mb-1">Important</span>
                          Payment must be done via UPI for all gift orders (No Cash on Delivery).
                        </span>
                      )}
                    </span>
                  </div>
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-right">Payment instructions will be shared via WhatsApp</p>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-brand-green-900 text-brand-gold-400 py-4 rounded-xl font-semibold hover:bg-brand-green-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? "Processing..." : "Complete via WhatsApp"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By placing your order, you agree to our Terms & Conditions. You will be redirected to WhatsApp to confirm and coordinate payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
