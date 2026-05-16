import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Truck, CreditCard, ChevronRight, 
  MapPin, Phone, User, Mail, Gift, AlertCircle, 
  ArrowLeft, CheckCircle2, Ticket, IndianRupee,
  Building2, Globe2, Landmark
} from 'lucide-react';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Checkout Steps State
  const [step, setStep] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [shippingCharge, setShippingCharge] = useState(0);
  const [isShippingFree, setIsShippingFree] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Shipping Form State (Pre-filled from profile if available)
  const [formData, setFormData] = useState({
    fullName: profile?.name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    fullAddress: profile?.fullAddress || '',
    city: profile?.city || '',
    district: profile?.district || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    paymentMethod: 'UPI' as 'UPI' | 'COD'
  });

  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items, navigate, orderComplete]);

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (formData.pincode && formData.pincode.length === 6 && /^\d+$/.test(formData.pincode)) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const details = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              state: details.State || prev.state,
              district: details.District || prev.district,
              city: details.Block || details.District || prev.city
            }));
          }
        } catch (error) {
          console.error("Error fetching pincode details", error);
        }
        
        // Fetch custom shipping calc from our backend
        setIsCalculatingShipping(true);
        setShippingError('');
        try {
          const shipRes = await fetch("/api/shipping-calc", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ deliveryPincode: formData.pincode })
          });
          const shipData = await shipRes.json();
          if (shipData.status === "success") {
             setShippingCharge(shipData.finalCharge);
             setIsShippingFree(shipData.isFree);
          } else {
             // fallback
             setShippingError(shipData.message || "Could not calculate custom shipping");
             setShippingCharge(0);
             setIsShippingFree(false);
          }
        } catch(err) {
          console.error("Shipping calc error:", err);
          setShippingError("Shipping calculation unavailable");
        } finally {
          setIsCalculatingShipping(false);
        }
      }
    };
    fetchPincodeDetails();
  }, [formData.pincode]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle gift toggle to enforce prepaid
  const handleToggleGift = () => {
    const newIsGift = !isGift;
    setIsGift(newIsGift);
    if (newIsGift && formData.paymentMethod === 'COD') {
      setFormData(prev => ({ ...prev, paymentMethod: 'UPI' }));
    }
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'FIRST10') {
      setAppliedDiscount(totalPrice * 0.1);
      alert("Coupon applied! 10% discount added.");
    } else {
      alert("Invalid coupon code.");
    }
  };

  const calculateFinalTotal = () => {
    let base = totalPrice - appliedDiscount;
    const codCharge = formData.paymentMethod === 'COD' ? 40 : 0;
    return { base, shipping: shippingCharge, codCharge, total: base + shippingCharge + codCharge };
  };

  const { base, shipping, codCharge, total } = calculateFinalTotal();

  const handleRazorpayPayment = async (orderData: any, docId: string) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, receipt: docId })
      });
      const data = await resp.json();

      if (data.error) throw new Error(data.error);

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "The RM Souq",
        description: "Premium Authentic Provisions",
        order_id: data.orderId,
        handler: async function (response: any) {
           try {
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: orderData
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                // Update firestore via direct logic if auth fails? we can update order status
                const orderRef = doc(db, 'orders', docId);
                await updateDoc(orderRef, { status: "confirmed", transactionId: response.razorpay_payment_id });
                
                setOrderComplete(true);
                clearCart();
              } else {
                alert("Payment verification failed. Please contact support.");
              }
           } catch(e) {
              alert("Payment verification failed.");
           } finally {
              setIsSubmitting(false);
           }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#1b4d3e"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
         alert("Payment failed: " + response.error.description);
         setIsSubmitting(false);
      });
      rzp.open();

    } catch(err) {
      console.error(err);
      alert("Could not initialize Razorpay checkout");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to complete your order.");
      navigate('/profile?redirect=/checkout');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the order document
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalPrice: total,
        status: 'pending',
        shippingDetails: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          fullAddress: formData.fullAddress,
          city: formData.city,
          district: formData.district || '',
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod: formData.paymentMethod,
        isGift,
        discount: appliedDiscount,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);

      // 2. Update user profile with latest address info
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.fullName,
        phone: formData.phone,
        fullAddress: formData.fullAddress,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        lastUpdated: Date.now()
      });

      // 3. Complete Checkout (Determine if UPI/Online vs COD)
      if (formData.paymentMethod === 'UPI') {
         await handleRazorpayPayment(orderData, docRef.id);
      } else {
         setOrderComplete(true);
         clearCart();
         setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Order failed:", error);
      alert("There was an error processing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-12 md:p-20 rounded-[4rem] text-center border border-brand-sand-200 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-brand-gold-400 via-brand-green-900 to-brand-gold-400" />
          
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-5xl font-serif text-brand-green-900 mb-4">Order Confirmed</h1>
          <p className="text-brand-gold-600 font-mono font-bold tracking-widest text-sm mb-10 uppercase">Ref ID: #{orderId.slice(0, 8).toUpperCase()}</p>
          
          <div className="space-y-6 text-gray-500 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            <p>Thank you for choosing <span className="font-bold text-brand-green-900">The RM Souq</span>. Your authentic Sunnah provisions are now being prepared for dispatch.</p>
            <p className="text-base italic">You will receive a confirmation message shortly. You can track your order status in your profile dashboard.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/my-orders" className="w-full sm:w-auto bg-brand-green-900 text-brand-gold-400 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-brand-green-900/20 active:scale-95 transition-all">
              Track My Order
            </Link>
            <Link to="/" className="w-full sm:w-auto bg-brand-sand-100 text-brand-green-900 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-sand-200 active:scale-95 transition-all">
              Back to Shop
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-brand-green-700 hover:text-brand-green-900 transition-colors mb-6 font-bold text-sm uppercase tracking-wider">
          <ArrowLeft size={16} /> Edit Cart
        </Link>
        <h1 className="text-4xl md:text-6xl font-serif text-brand-green-900 leading-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Checkout Forms */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 px-2">
            {[
              { n: 1, label: 'Shipping' },
              { n: 2, label: 'Payment' }
            ].map(s => (
               <div key={s.n} className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s.n ? 'bg-brand-green-900 text-brand-gold-400' : 'bg-brand-sand-200 text-gray-400'}`}>
                   {s.n}
                 </div>
                 <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${step >= s.n ? 'text-brand-green-900' : 'text-gray-300'}`}>{s.label}</span>
                 {s.n === 1 && <div className="w-12 h-px bg-brand-sand-200 mx-2" />}
               </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-brand-sand-200 shadow-sm space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-brand-green-50 text-brand-green-900 rounded-2xl"><User size={20}/></div>
                    <h2 className="text-2xl font-serif text-brand-green-900">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Legal Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe" 
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 transition-all shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Primary Contact Line</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+91 00000 00000" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 transition-all shadow-inner" 
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-brand-sand-200 shadow-sm space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-brand-green-50 text-brand-green-900 rounded-2xl"><MapPin size={20}/></div>
                    <h2 className="text-2xl font-serif text-brand-green-900">Shipping Address</h2>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Door / Building / Landmark / Street</label>
                      <textarea 
                        required
                        placeholder="e.g. H-4, Sector 7, Near Green Park..." 
                        rows={3}
                        value={formData.fullAddress}
                        onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                        className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 transition-all shadow-inner resize-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">City</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Mumbai" 
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Pincode</label>
                        <input 
                          required
                          type="text" 
                          placeholder="400001" 
                          value={formData.pincode}
                          onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">State</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Maharashtra" 
                          value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value })}
                          className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">District (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. South Mumbai" 
                          value={formData.district}
                          onChange={e => setFormData({ ...formData, district: e.target.value })}
                          className="w-full bg-brand-sand-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-brand-green-900 focus:ring-2 focus:ring-brand-gold-400 placeholder-gray-300 shadow-inner" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-grow flex items-center justify-center gap-3 bg-brand-green-900 text-brand-gold-400 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-green-800 transition-all shadow-xl active:scale-95"
                  >
                    Continue to Payment <ChevronRight size={18}/>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-brand-sand-200 shadow-sm space-y-10">
                   <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-brand-green-50 text-brand-green-900 rounded-2xl"><CreditCard size={20}/></div>
                    <h2 className="text-2xl font-serif text-brand-green-900">Payment Method</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, paymentMethod: 'UPI'})}
                      className={`relative flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all group text-left ${formData.paymentMethod === 'UPI' ? 'border-brand-green-900 bg-brand-green-50/30' : 'border-brand-sand-100 hover:border-brand-sand-300'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.paymentMethod === 'UPI' ? 'bg-brand-green-900 text-white shadow-lg' : 'bg-brand-sand-100 text-gray-400'}`}>
                        <Globe2 size={28} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-brand-green-900 flex items-center gap-2">
                          Standard Shipping (Prepaid)
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Faster processing. Secure payment via GPay / PhonePe / Paytm.</p>
                      </div>
                      {formData.paymentMethod === 'UPI' && (
                        <div className="bg-brand-green-900 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </button>

                    <button 
                      type="button" 
                      disabled={isGift}
                      onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                      className={`relative flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all group text-left ${
                        isGift ? 'opacity-50 cursor-not-allowed border-brand-sand-100' :
                        formData.paymentMethod === 'COD' ? 'border-brand-green-900 bg-brand-green-50/30' : 'border-brand-sand-100 hover:border-brand-sand-300'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        isGift ? 'bg-brand-sand-100 text-gray-400' :
                        formData.paymentMethod === 'COD' ? 'bg-brand-green-900 text-white shadow-lg' : 'bg-brand-sand-100 text-gray-400'
                      }`}>
                        <Landmark size={28} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-brand-green-900 flex items-center gap-2">
                          Cash on Delivery
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {isGift ? "COD is not available for gifting services." : "Pay only when you receive your authentic package. (₹40 COD charge)"}
                        </p>
                      </div>
                       {formData.paymentMethod === 'COD' && !isGift && (
                        <div className="bg-brand-green-900 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </button>
                  </div>

                  <div 
                    className={`p-8 rounded-3xl border-2 flex items-center gap-6 group cursor-pointer transition-all ${
                      isGift 
                      ? 'bg-brand-gold-50 border-brand-gold-400/50 shadow-lg shadow-brand-gold-400/10' 
                      : 'bg-brand-sand-50 border-transparent hover:border-brand-sand-200'
                    }`} 
                    onClick={handleToggleGift}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isGift ? 'bg-brand-gold-400 text-brand-green-900 shadow-md rotate-12 scale-110' : 'bg-white text-gray-400 shadow-sm group-hover:scale-105'}`}>
                       <Gift size={26} />
                    </div>
                    <div className="flex-grow">
                      <p className={`text-base font-bold mb-1 transition-colors ${isGift ? 'text-brand-green-900' : 'text-gray-700'}`}>Make it a Pure Sunnah Gift</p>
                      <p className={`text-xs transition-colors ${isGift ? 'text-brand-green-800/80 font-medium' : 'text-gray-500'}`}>Premium packaging & handwritten note. Free for limited time.</p>
                       {isGift && (
                         <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#d97706] bg-yellow-100/50 inline-block px-2 py-1 rounded-md">
                           Only Prepaid Available
                         </div>
                       )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isGift ? 'border-brand-green-900 bg-brand-green-900' : 'border-gray-300 bg-white group-hover:border-brand-gold-400'}`}>
                       {isGift && <div className="w-2 h-2 rounded-full bg-brand-gold-400" />}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-6 bg-brand-sand-100 text-brand-green-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-sand-200 transition-all active:scale-95"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow flex items-center justify-center gap-3 bg-brand-green-900 text-brand-gold-400 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-green-800 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Confirming Transaction...' : 'Place Firm Order'} <ShieldCheck size={18}/>
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Sidebar Order Recap */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit space-y-8">
           <div className="bg-brand-green-900 rounded-[3rem] p-10 text-brand-sand-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <ShieldCheck size={250} />
              </div>
              
              <h3 className="text-2xl font-serif text-brand-gold-400 mb-8 border-b border-brand-green-800 pb-4">Manifest Summary</h3>
              
              <div className="max-h-64 overflow-y-auto space-y-6 pr-4 mb-10 scrollbar-hide">
                {items.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-center group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/10 group-hover:border-brand-gold-400/30 transition-colors">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-brand-gold-400 transition-colors truncate">{item.name}</p>
                        <p className="text-xs text-brand-sand-100/40 uppercase tracking-widest font-black mt-0.5">Qty: {item.quantity} x ₹{item.price}</p>
                      </div>
                      <span className="text-sm font-bold text-white italic">₹{(item.quantity * item.price).toLocaleString()}</span>
                   </div>
                ))}
              </div>

              <div className="bg-brand-sand-50/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6 mb-8 shadow-inner">
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                   <span className="text-brand-sand-100/40">Raw Subtotal</span>
                   <span>₹{totalPrice.toLocaleString()}</span>
                 </div>
                 {appliedDiscount > 0 && (
                   <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-brand-gold-400">
                     <span>Privilege Discount</span>
                     <span>- ₹{appliedDiscount.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                   <span className="text-brand-sand-100/40">Shipping Charge</span>
                   <span className="flex items-center gap-2">
                     {isCalculatingShipping ? (
                       <span className="animate-pulse text-brand-gold-400">Calculating...</span>
                     ) : shippingError ? (
                       <span className="text-red-400 capitalize whitespace-nowrap">{shippingError}</span>
                     ) : shippingCharge === 0 ? (
                       <span className="text-brand-gold-400">FREE SHIPPING</span>
                     ) : (
                       `₹${shippingCharge}`
                     )}
                   </span>
                 </div>
                 {codCharge > 0 && (
                   <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-brand-gold-400">
                     <span>COD Convenience Fee</span>
                     <span>+ ₹{codCharge}</span>
                   </div>
                 )}
                 <div className="h-px bg-white/10" />
                 <div className="flex justify-between items-end">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold-600 block mb-1">Grand Aggregate</span>
                       <span className="text-xs text-brand-sand-100/30 italic">Inclusive of all duties</span>
                    </div>
                    <span className="text-4xl font-black text-white">₹{total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="relative">
                   <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold-400" size={16}/>
                   <input 
                    type="text" 
                    placeholder="ENTER PRIVILEGE CODE..." 
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-black tracking-widest text-center text-white placeholder-brand-sand-100/20 focus:ring-1 focus:ring-brand-gold-400 transition-all uppercase" 
                   />
                 </div>
                 <button onClick={handleApplyCoupon} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold-400 border border-brand-gold-400/30 rounded-2xl hover:bg-brand-gold-400/10 transition-colors active:scale-95">Validate Code</button>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-brand-sand-200 shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-green-50 rounded-2xl flex items-center justify-center text-brand-green-900 border border-brand-green-100">
                <AlertCircle size={28} />
              </div>
              <div className="flex-grow">
                 <h4 className="text-sm font-bold text-brand-green-900 uppercase tracking-tight">Purchase Guarantee</h4>
                 <p className="text-[11px] text-gray-500 leading-relaxed mt-1">We stand by the purity of our Sunnah provisions. All transactions are protected by RM Souq's quality assurance manifest.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
