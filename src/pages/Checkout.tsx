import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, Mail, User as UserIcon, Tag, X } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { ProductRating } from '../components/ProductRating';

export default function Checkout() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pincode: '',
    city: '',
    state: '',
    district: '',
    fullAddress: '',
    giftMessage: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);

  const GIFT_WRAP_CHARGE = 20;
  // Shipping Calculation State
  const shippingChargeRange = "₹5 - ₹30";

  // Discount Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (totalPrice * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const finalPrice = totalPrice - calculateDiscount() + (isGift ? GIFT_WRAP_CHARGE : 0);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setCouponError('Invalid discount code');
        setAppliedCoupon(null);
      } else {
        const couponData = querySnapshot.docs[0].data();
        
        // Per-person usage check by querying previous orders
        const ordersQ = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid), 
          where('couponUsed', '==', couponData.code)
        );
        const ordersSnapshot = await getDocs(ordersQ);
        const userUsageCount = ordersSnapshot.docs.filter(d => d.data().status !== 'cancelled').length;

        if (couponData.usageLimit > 0 && userUsageCount >= couponData.usageLimit) {
          setCouponError(`You have already used this code ${userUsageCount} time(s). Limit: ${couponData.usageLimit} per person.`);
          setAppliedCoupon(null);
        } else if (totalPrice < (couponData.minPurchase || 0)) {
          setCouponError(`Minimum purchase of ₹${couponData.minPurchase} required`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon({ id: querySnapshot.docs[0].id, ...couponData });
          setCouponCode('');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'coupons');
      setCouponError('Error applying coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  useEffect(() => {
    let active = true;
    const validatePincode = async () => {
      if (!formData.pincode) {
        setPincodeError('');
        return;
      }
      
      const pin = formData.pincode.replace(/\s/g, '');
      if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        if (pin.length > 0) setPincodeError('Pincode must be 6 digits');
        return;
      }

      setIsValidatingPincode(true);
      setPincodeError('');
      
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        
        if (active) {
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              district: postOffice.District,
              state: postOffice.State,
              city: prev.city || postOffice.Block || postOffice.District
            }));
          } else {
            setPincodeError('Invalid Pincode for India');
          }
        }
      } catch (error) {
        if (active) setPincodeError('Error validating pincode');
      } finally {
        if (active) setIsValidatingPincode(false);
      }
    };

    const debounceTimer = setTimeout(validatePincode, 800);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [formData.pincode]);

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
        district: profile.district || '',
        state: profile.state || '',
        fullAddress: profile.fullAddress || '',
        giftMessage: '',
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
      const { giftMessage, ...addressToSave } = formData;
      await updateProfile(addressToSave);

      // 2. Save order to Firebase
      const newOrder = {
        userId: user.uid,
        userName: formData.name,
        email: formData.email,
        phone: formData.phone,
        shippingDetails: formData,
        items: items,
        totalPrice: finalPrice,
        shippingChargeEstimate: shippingChargeRange,
        discountApplied: calculateDiscount(),
        giftWrapPrice: isGift ? GIFT_WRAP_CHARGE : 0,
        giftMessage: isGift ? formData.giftMessage : null,
        couponUsed: appliedCoupon?.code || null,
        status: 'pending',
        createdAt: Date.now(),
        isGift: isGift
      };
      await addDoc(collection(db, 'orders'), newOrder);

      // Update coupon usage count if used
      if (appliedCoupon) {
        try {
          const couponRef = doc(db, 'coupons', appliedCoupon.id);
          await updateDoc(couponRef, {
            usageCount: (appliedCoupon.usageCount || 0) + 1
          });
        } catch (couponErr) {
          console.warn("Could not update coupon usage count (likely due to permissions):", couponErr);
        }
      }

      // 3. Generate WhatsApp Text
      const waNumber = settings.phoneNumber;
      const itemListText = items.map(i => `- ${i.quantity}x ${i.name} (\u20B9${i.price * i.quantity})`).join('\n');
      
      const giftMessageText = isGift ? `🎁 *GIFT ORDER*\n*Message:* ${formData.giftMessage || 'No message'}\n*Packaging Charge:* \u20B9${GIFT_WRAP_CHARGE}\n*Payment Method requested:* UPI Only (No COD for gifts)\n\n` : "";

      const message = `*New Order: The RM Souq* \ud83d\uded2

${giftMessageText}*Order Summary:*
${itemListText}
${appliedCoupon ? `*Discount (${appliedCoupon.code}):* -\u20B9${calculateDiscount()}\n` : ''}*Shipping Charge:* ${shippingChargeRange} (To be confirmed)
${isGift ? `*Gift Packaging:* +\u20B9${GIFT_WRAP_CHARGE}\n` : ''}*Total (Excl. Shipping):* \u20B9${finalPrice}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

*Shipping Address:*
${formData.fullAddress}
${formData.city}, ${formData.district ? formData.district + ', ' : ''}${formData.state}
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
      handleFirestoreError(error, OperationType.WRITE, 'orders');
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8"
    >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (Autofills City/State)</label>
                <div className="relative w-full sm:w-1/2">
                   <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" maxLength={6} className={`pl-10 w-full p-3 bg-white border ${pincodeError ? 'border-red-500' : 'border-brand-sand-200'} rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none`} placeholder="400001" />
                  {isValidatingPincode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-gold-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address (Street, House No, Locality)</label>
                <textarea required name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} rows={3} className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none resize-none" placeholder="123 Halal Market Road..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input required name="district" value={formData.district} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="Mumbai Suburban" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} type="text" className="w-full p-3 bg-white border border-brand-sand-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none" placeholder="Maharashtra" />
                </div>
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
                  <img src={item.imageUrl || undefined} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-brand-green-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                    <ProductRating productId={item.id} />
                  </div>
                  <div className="text-right flex flex-col items-end justify-center">
                    <div className="font-bold text-brand-green-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                    {item.mrp && item.mrp > item.price && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-medium text-gray-400 line-through">₹{(item.mrp * item.quantity).toLocaleString()}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          Save {Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-sand-200 pt-4 mb-6">
              {/* Discount Code Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className={`flex-1 p-2 bg-white border ${couponError ? 'border-red-500' : 'border-brand-sand-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500 uppercase`}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      className="bg-brand-green-900 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg text-green-800">
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span className="text-sm">({appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}% off` : `₹${appliedCoupon.discount} off`})</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-green-800 hover:text-green-900">
                      <X size={18} />
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>₹ {totalPrice.toLocaleString()}</span>
              </div>
              
              {(() => {
                const totalMrp = items.reduce((acc, item) => acc + ((item.mrp || item.price) * item.quantity), 0);
                const totalMrpSavings = totalMrp - totalPrice;
                if (totalMrpSavings > 0) {
                  return (
                    <div className="flex justify-between items-center text-sm text-green-600 font-medium mb-2">
                      <span>Store Discount (MRP Savings)</span>
                      <span>-₹ {totalMrpSavings.toLocaleString()}</span>
                    </div>
                  );
                }
                return null;
              })()}

              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 font-medium mb-2">
                  <span>Additional Discount ({appliedCoupon.code})</span>
                  <span>-₹ {calculateDiscount().toLocaleString()}</span>
                </div>
              )}

              {isGift && (
                <div className="flex justify-between items-center text-sm text-brand-gold-700 font-medium mb-2">
                  <span>Gift Packaging</span>
                  <span>+₹ {GIFT_WRAP_CHARGE.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-brand-green-700 mb-2">
                <span>Shipping Charge</span>
                <span className="italic font-medium">{shippingChargeRange}</span>
              </div>

              <div className="flex justify-between items-center text-xl font-serif text-brand-green-900 mb-1 pt-2 border-t border-brand-sand-200">
                <span>Total Amount</span>
                <span>₹ {finalPrice.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-500 mb-4 text-right">*Shipping will be informed on WhatsApp (₹5-₹30)</p>
              
              <p className="text-xs text-brand-green-800 font-medium mb-4 italic flex items-center gap-1">
                <MapPin size={12} /> Standard delivery (5-30 days)
              </p>
              
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
                        <div className="mt-3 space-y-3">
                          <div className="text-brand-gold-800 bg-brand-gold-200/50 p-3 rounded-lg border border-brand-gold-200/50 font-medium">
                            <span className="font-bold uppercase tracking-widest text-[10px] block opacity-70 mb-1">Important</span>
                            Payment must be done via UPI for all gift orders (No Cash on Delivery).
                          </div>
                          
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-brand-gold-700 uppercase tracking-wider">Gift Message (Optional)</label>
                            <textarea 
                              name="giftMessage"
                              value={formData.giftMessage}
                              onChange={handleInputChange}
                              placeholder="Write a sweet note for your loved one..."
                              className="w-full p-3 text-sm bg-white border border-brand-gold-200 rounded-xl focus:ring-2 focus:ring-brand-gold-400 outline-none resize-none"
                              rows={2}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
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
    </motion.div>
  );
}
