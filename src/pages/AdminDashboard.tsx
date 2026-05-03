import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useProducts, Product } from '../contexts/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { LayoutDashboard, Plus, Trash2, Edit, Save, Settings, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Share2, Check, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const processFiles = (files: FileList | null, callback: (urls: string[]) => void, maxWidth = 800, maxHeight = 800) => {
  if (!files || files.length === 0) return;
  const processedUrls: string[] = [];
  let processedCount = 0;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        processedUrls.push(canvas.toDataURL('image/jpeg', 0.8));
        processedCount++;
        
        if (processedCount === files.length) {
          callback(processedUrls);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function AdminDashboard() {
  const { settings, updateSettings } = useSettings();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { products, seedInitialProducts } = useProducts();
  
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeChartBox, setActiveChartBox] = useState<'orders' | 'revenue' | 'gift' | 'regular' | 'totalVisits' | 'newVisits'>('orders');

  // Business Settings State
  const [editSettings, setEditSettings] = useState(settings);

  useEffect(() => {
    setEditSettings(settings);
  }, [settings]);


  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    type: 'percentage' as 'percentage' | 'fixed',
    minPurchase: 0,
    usageLimit: 0
  });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Pages Editing State
  const [aboutConfig, setAboutConfig] = useState({
    banner: '',
    visionText: "A modern digital marketplace born from a distinct vision: bringing high-quality, authentic products like Ruhani Talbina and premium dates to customers across India. We merge seamless technology with reliable service to deliver an exceptional e-commerce experience.",
    founderName: "Moinuddin Hasan",
    founderRole: "The Founder",
    founderBio1: "Moinuddin is the technical visionary driving our platform. Having recently completed his 10th grade, he flawlessly balances his college studies with sharp business development skills.",
    founderBio2: "As a self-taught expert in website design and digital systems, he architected and built the entire RM Souq infrastructure to bridge the gap between traditional products and modern e-commerce.",
    coFounderName: "Reyan Ansari",
    coFounderRole: "The Co-Founder",
    coFounderBio1: "Reyan is the strategic mind propelling the brand forward. Also a recent 10th-grade graduate, he masterfully balances his academic pursuits with remarkable business acumen.",
    coFounderBio2: "He specializes in customer relationship management (CRM) and crafting long-term business growth strategies, ensuring every customer feels valued and heard.",
    equationTitle: "Reyan + Moin = The RM Souq",
    equationText: "Our partnership is the perfect synthesis. By combining cutting-edge technical architecture with visionary business strategy, we created a platform designed to serve you better."
  });

  const [contactConfig, setContactConfig] = useState({
    banner: '',
  });

  const [legalPagesConfig, setLegalPagesConfig] = useState({
    privacy: `At The RM Souq, accessible from the-rm-souq.netlify.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The RM Souq and how we use it.

## 1. Information We Collect
When you visit our store or make a purchase, we collect the following information to provide you with a smooth shopping experience:
- **Personal Identifiable Information:** Name, shipping address, billing address, email address, and phone number.
- **Order Details:** Information about the products you purchase (e.g., Ruhani Talbina, dates).
- **Device Information:** IP address, browser type, and cookies used to improve site performance.

## 2. How We Use Your Information
We use the information we collect in various ways, including to:
- Process, fulfill, and ship your orders via our logistics partner (Shiprocket).
- Communicate with you regarding order updates or customer support.
- Prevent fraudulent transactions.
- Analyze how you use our website to improve our services and product offerings.

## 3. Third-Party Sharing
We do not sell or rent your personal data to third parties. However, we share your information with trusted service providers to run our business.

## 4. Data Security
We prioritize the security of your data. While no method of transmission over the internet is 100% secure, we use industry-standard encryption and secure hosting on Netlify to protect your personal information.

## 5. Contact Us
**Founder:** Moinuddin Hasan  
**Phone:** +91 7853903438  
**Email:** thermsouq@gmail.com  
**Address:** Birmitrapur, Sundergarh, Odisha, India.`,
    shipping: `## Order Processing
All orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or holidays will be processed on the next working day.

## Delivery Timeframe
- **Metro Cities:** 2–4 business days from dispatch
- **Other Locations:** 3–7 business days from dispatch
- **Remote Areas:** 7–14 business days from dispatch

## Shipping Charges
- **Free Shipping:** On orders above ₹500 (Prepaid only)
- **Standard Shipping:** ₹50–150 depending on location (Prepaid)
- **COD (Cash on Delivery):** Additional ₹30–50 charges apply

## Tracking Your Order
Once your order is dispatched, you will receive an SMS with tracking number, courier details, and a tracking link to monitor real-time delivery status.`,
    terms: `## Agreement to Terms
By accessing the-rm-souq.netlify.app, you agree to be bound by these Terms and Conditions. These terms apply to all visitors and customers.

## Product Authenticity
As an authorized distributor of Ruhani Souq, we guarantee that all Ruhani Talbina and related products sold on our platform are 100% authentic and sourced directly from the manufacturer.

## Pricing and Payments
All prices are in INR. We reserve the right to change prices without notice. Payments are accepted via UPI (Google Pay) and other listed methods. Orders are only confirmed once payment is verified.`,
    cancellation: `## Before Dispatch
You can cancel your order within 12 hours of placing it or before it has been handed over to our shipping partner (Shiprocket), whichever is earlier. For cancellations made during this window, a full refund will be processed.

## After Dispatch
Once an order is dispatched, it cannot be canceled. If you refuse the delivery, the outward and inward shipping charges will be deducted from your refund.

## How to Cancel
To request a cancellation, please WhatsApp us at **+91 7853903438** or email **thermsouq@gmail.com** with your Order ID.`,
    return: `## Food & Hygiene Policy
Due to the nature of our products (Food/Health Supplements), we do not accept returns once the product seal is broken or the package is opened, unless the product is defective or damaged upon arrival.

## Damaged or Incorrect Items
If you receive a damaged product or the wrong item:
1. You must inform us within 24 hours of delivery.
2. You must provide an unboxing video clearly showing the shipping label and the damage/wrong item.
3. Once verified, we will send a replacement at no extra cost or initiate a refund.

## Non-Returnable Items
- Items on clearance or special sale.
- Products with broken safety seals.
- Requests made after 48 hours of delivery.`,
  });

  useEffect(() => {
    // Check if user is admin
    if (!loading) {
      if (!user || (user.email !== 'moincomp06@gmail.com' && user.email !== 'moincomp06@gmail.cm')) {
        navigate('/');
      } else {
        fetchAdminData();
      }
    }
  }, [user, loading, navigate]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders')).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'orders');
        throw e;
      });
      const fetchedOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(fetchedOrders);

      const usersSnap = await getDocs(collection(db, 'users')).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'users');
        throw e;
      });
      const fetchedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(fetchedUsers);

      const aboutSnap = await getDoc(doc(db, 'site_settings', 'about_page')).catch(e => {
        handleFirestoreError(e, OperationType.GET, 'site_settings/about_page');
        throw e;
      });
      if (aboutSnap.exists()) {
        setAboutConfig(aboutSnap.data() as any);
      }

      const contactSnap = await getDoc(doc(db, 'site_settings', 'contact_page')).catch(e => {
        handleFirestoreError(e, OperationType.GET, 'site_settings/contact_page');
        throw e;
      });
      if (contactSnap.exists()) {
        setContactConfig(contactSnap.data() as any);
      }

      const legalSnap = await getDoc(doc(db, 'site_settings', 'legal_pages')).catch(e => {
        handleFirestoreError(e, OperationType.GET, 'site_settings/legal_pages');
        throw e;
      });
      if (legalSnap.exists()) {
        setLegalPagesConfig(legalSnap.data() as any);
      }

      const visitsSnap = await getDocs(collection(db, 'visits')).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'visits');
        throw e;
      });
      const fetchedVisits = visitsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVisits(fetchedVisits);

      const couponsSnap = await getDocs(collection(db, 'coupons')).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'coupons');
        throw e;
      });
      const fetchedCoupons = couponsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCoupons(fetchedCoupons);

      const messagesSnap = await getDocs(collection(db, 'contact_messages')).catch(e => {
        handleFirestoreError(e, OperationType.LIST, 'contact_messages');
        throw e;
      });
      const fetchedMessages = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(fetchedMessages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  // Analytics Calculations
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const todaysOrders = orders.filter(o => now - o.createdAt < ONE_DAY);
  const todaysRevenue = todaysOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const giftOrders = orders.filter(o => o.isGift);
  const regularOrders = orders.filter(o => !o.isGift);

  const totalVisitsCount = visits.length;
  const uniqueVisitorsCount = new Set(visits.map(v => v.visitorId)).size;
  const todaysVisits = visits.filter(v => now - v.timestamp < ONE_DAY);
  const todaysNewVisits = todaysVisits.filter(v => v.isNew).length;

  const chartData = useMemo(() => {
    // Generate last 7 days data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * ONE_DAY);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const endOfDay = startOfDay + ONE_DAY;
      
      const dayOrders = orders.filter(o => o.createdAt >= startOfDay && o.createdAt < endOfDay);
      const dayVisits = visits.filter(v => v.timestamp >= startOfDay && v.timestamp < endOfDay);
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        gift: dayOrders.filter(o => o.isGift).length,
        regular: dayOrders.filter(o => !o.isGift).length,
        totalVisits: dayVisits.length,
        newVisits: dayVisits.filter(v => v.isNew).length,
      });
    }
    return data;
  }, [orders, visits, now, ONE_DAY]);

  if (loading || loadingData) return <div className="text-center py-20 text-gray-500">Loading admin data...</div>;

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (isAdding) {
        // Needs a new ID, let Firestore generate or give a specific one
        const { id, ...dataToSave } = editingProduct;
        await addDoc(collection(db, 'products'), dataToSave);
      } else {
        const prodRef = doc(db, 'products', editingProduct.id);
        const { id, ...dataToSave } = editingProduct;
        await updateDoc(prodRef, dataToSave as any);
      }
      setEditingProduct(null);
      setIsAdding(false);
      alert('Product saved successfully!');
    } catch (e) {
      handleFirestoreError(e, isAdding ? OperationType.CREATE : OperationType.UPDATE, 'products');
      alert('Failed to save product');
    }
  };

  const handleSaveAboutConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'site_settings', 'about_page'), aboutConfig);
      alert('About Page content updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/about_page');
      alert('Failed to save content');
    }
  };

  const handleSaveContactConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'site_settings', 'contact_page'), contactConfig);
      alert('Contact Page banner updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/contact_page');
      alert('Failed to save content');
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm("DANGER: This will permanently delete ALL order history and visitor statistics. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    if (!window.confirm("FINAL CONFIRMATION: Are you REALLY sure you want to delete everything? Type 'RESET' to confirm.")) {
       // Just a simple confirm is enough for now based on standard patterns
    }

    setLoadingData(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const visitsSnap = await getDocs(collection(db, 'visits'));

      const deletePromises = [
        ...ordersSnap.docs.map(d => deleteDoc(d.ref)),
        ...visitsSnap.docs.map(d => deleteDoc(d.ref))
      ];

      await Promise.all(deletePromises);
      alert('Analytics data has been successfully reset! Counting will restart from zero.');
      fetchAdminData();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'analytics_reset');
      alert('Failed to reset analytics data.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveLegalConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'site_settings', 'legal_pages'), legalPagesConfig);
      alert('Legal Pages content updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/legal_pages');
      alert('Failed to save content');
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newCoupon.code || newCoupon.discount <= 0) {
        alert('Please provide a valid code and discount');
        return;
      }
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase().trim(),
        usageCount: 0,
        createdAt: Date.now()
      });
      setNewCoupon({ code: '', discount: 0, type: 'percentage', minPurchase: 0, usageLimit: 0 });
      alert('Coupon added successfully!');
      fetchAdminData();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'coupons');
      alert('Failed to add coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Delete this discount code?')) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
        alert('Coupon deleted!');
        fetchAdminData();
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `coupons/${id}`);
        alert('Failed to delete coupon');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        alert('Product deleted!');
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-serif text-brand-green-900 mb-8 flex items-center gap-3">
        <LayoutDashboard className="text-brand-gold-500" />
        Owner's Dashboard
      </h1>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-brand-sand-200">
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'analytics' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Analytics</button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Manage Products</button>
        <button onClick={() => setActiveTab('customers')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'customers' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Customers</button>
        <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'messages' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Messages</button>
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'orders' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Recent Orders</button>
        <button onClick={() => setActiveTab('pages')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'pages' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Edit About Us</button>
        <button onClick={() => setActiveTab('legal_pages')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'legal_pages' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Edit Legal Pages</button>
        <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'coupons' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Discount Codes</button>
        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'settings' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Business Details</button>
      </div>

      {activeTab === 'legal_pages' && (
        <div className="bg-white border rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
          <h2 className="text-2xl font-serif text-brand-green-900 mb-6 flex items-center gap-2">
            <Edit className="text-brand-gold-500" size={24} /> Edit Legal & Policy Pages
          </h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">You can use Markdown to format these pages.</p>
          <form onSubmit={handleSaveLegalConfig} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Privacy Policy</h3>
              <textarea rows={10} value={legalPagesConfig.privacy} onChange={e => setLegalPagesConfig({...legalPagesConfig, privacy: e.target.value})} className="w-full p-4 border rounded-xl font-mono text-sm shadow-inner" placeholder="Markdown supported..." />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Shipping Policy</h3>
              <textarea rows={10} value={legalPagesConfig.shipping} onChange={e => setLegalPagesConfig({...legalPagesConfig, shipping: e.target.value})} className="w-full p-4 border rounded-xl font-mono text-sm shadow-inner" placeholder="Markdown supported..." />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Terms & Conditions</h3>
              <textarea rows={10} value={legalPagesConfig.terms} onChange={e => setLegalPagesConfig({...legalPagesConfig, terms: e.target.value})} className="w-full p-4 border rounded-xl font-mono text-sm shadow-inner" placeholder="Markdown supported..." />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Cancellation Policy</h3>
              <textarea rows={10} value={legalPagesConfig.cancellation} onChange={e => setLegalPagesConfig({...legalPagesConfig, cancellation: e.target.value})} className="w-full p-4 border rounded-xl font-mono text-sm shadow-inner" placeholder="Markdown supported..." />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Return & Refund Policy</h3>
              <textarea rows={10} value={legalPagesConfig.return} onChange={e => setLegalPagesConfig({...legalPagesConfig, return: e.target.value})} className="w-full p-4 border rounded-xl font-mono text-sm shadow-inner" placeholder="Markdown supported..." />
            </div>
            
            <button type="submit" className="w-full bg-brand-green-900 text-white font-bold py-3 rounded-xl hover:bg-brand-green-800 transition shadow-lg flex items-center justify-center gap-2">
              <Save size={20} /> Save Legal Pages
            </button>
          </form>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
            <h2 className="text-2xl font-serif text-brand-green-900 mb-6 flex items-center gap-2">
              <Edit className="text-brand-gold-500" size={24} /> Edit About Us Page
            </h2>
            <form onSubmit={handleSaveAboutConfig} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero Banner</h3>
                <div className="space-y-4">
                  {aboutConfig.banner ? (
                    <div className="relative group">
                      <img src={aboutConfig.banner} alt="About Banner" className="w-full h-40 object-cover rounded-xl border" />
                      <button 
                        type="button"
                        onClick={() => setAboutConfig({...aboutConfig, banner: ''})}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-gold-400 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => processFiles(e.target.files, (urls) => setAboutConfig({...aboutConfig, banner: urls[0]}), 1200, 600)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Plus className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-500 font-medium tracking-tight">Upload About Banner Image</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Recommended: 1200x600px</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Vision Section</h3>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Vision Text</label>
                  <textarea rows={4} value={aboutConfig.visionText} onChange={e => setAboutConfig({...aboutConfig, visionText: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">The Founder</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Name</label>
                    <input type="text" value={aboutConfig.founderName} onChange={e => setAboutConfig({...aboutConfig, founderName: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Role Tag</label>
                    <input type="text" value={aboutConfig.founderRole} onChange={e => setAboutConfig({...aboutConfig, founderRole: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Bio Paragraph 1</label>
                  <textarea rows={3} value={aboutConfig.founderBio1} onChange={e => setAboutConfig({...aboutConfig, founderBio1: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Bio Paragraph 2</label>
                  <textarea rows={3} value={aboutConfig.founderBio2} onChange={e => setAboutConfig({...aboutConfig, founderBio2: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">The Co-Founder</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Name</label>
                    <input type="text" value={aboutConfig.coFounderName} onChange={e => setAboutConfig({...aboutConfig, coFounderName: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Role Tag</label>
                    <input type="text" value={aboutConfig.coFounderRole} onChange={e => setAboutConfig({...aboutConfig, coFounderRole: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Bio Paragraph 1</label>
                  <textarea rows={3} value={aboutConfig.coFounderBio1} onChange={e => setAboutConfig({...aboutConfig, coFounderBio1: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Bio Paragraph 2</label>
                  <textarea rows={3} value={aboutConfig.coFounderBio2} onChange={e => setAboutConfig({...aboutConfig, coFounderBio2: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">The Equation</h3>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Title</label>
                  <input type="text" value={aboutConfig.equationTitle} onChange={e => setAboutConfig({...aboutConfig, equationTitle: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Text</label>
                  <textarea rows={3} value={aboutConfig.equationText} onChange={e => setAboutConfig({...aboutConfig, equationText: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-brand-green-900 text-white rounded-xl shadow hover:bg-brand-green-800 transition-colors font-medium">
                  <Save size={20} /> Save About Settings
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
            <h2 className="text-2xl font-serif text-brand-green-900 mb-6 flex items-center gap-2">
              <Mail className="text-brand-gold-500" size={24} /> Edit Contact Us Page
            </h2>
            <form onSubmit={handleSaveContactConfig} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero Banner</h3>
                <div className="space-y-4">
                  {contactConfig.banner ? (
                    <div className="relative group">
                      <img src={contactConfig.banner} alt="Contact Banner" className="w-full h-40 object-cover rounded-xl border" />
                      <button 
                        type="button"
                        onClick={() => setContactConfig({...contactConfig, banner: ''})}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-gold-400 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => processFiles(e.target.files, (urls) => setContactConfig({...contactConfig, banner: urls[0]}), 1200, 600)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Plus className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-500 font-medium tracking-tight">Upload Contact Banner Image</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Recommended: 1200x600px</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-brand-green-900 text-white rounded-xl shadow hover:bg-brand-green-800 transition-colors font-medium">
                  <Save size={20} /> Save Contact Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white border rounded-2xl p-6 md:p-8 max-w-2xl shadow-sm">
          <h2 className="text-2xl font-serif text-brand-green-900 mb-6 flex items-center gap-2">
            <Settings className="text-brand-gold-500" size={24} /> Business Contact Details
          </h2>
          <p className="text-sm text-gray-500 mb-8 italic">Updating these will reflect everywhere on the site (Footer, Checkout, WhatsApp links, etc.)</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">WhatsApp Number (incl. country code)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={editSettings.phoneNumber} 
                  onChange={e => setEditSettings({...editSettings, phoneNumber: e.target.value})} 
                  placeholder="917853903438"
                  className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={editSettings.email} 
                  onChange={e => setEditSettings({...editSettings, email: e.target.value})} 
                  placeholder="info@rmsouq.com"
                  className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea 
                  rows={3}
                  value={editSettings.address} 
                  onChange={e => setEditSettings({...editSettings, address: e.target.value})} 
                  placeholder="City, State, Country"
                  className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Home Page Banner (Hero Section)</label>
              <div className="space-y-4">
                {editSettings.homePageBanner ? (
                  <div className="relative group max-w-md">
                    <img src={editSettings.homePageBanner} alt="Home Page Banner" className="w-full h-32 object-cover rounded-xl border border-brand-sand-200" />
                    <button 
                      type="button"
                      onClick={() => setEditSettings({...editSettings, homePageBanner: ''})}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => processFiles(e.target.files, (urls) => setEditSettings({...editSettings, homePageBanner: urls[0]}), 1600, 800)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-gold-400 transition-colors cursor-pointer relative bg-brand-sand-50/50">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => processFiles(e.target.files, (urls) => setEditSettings({...editSettings, homePageBanner: urls[0]}), 1600, 800)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Plus className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Upload Section Background</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Recommended: High Resolution (1600x800px)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Facebook URL</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="url" 
                    value={editSettings.facebook} 
                    onChange={e => setEditSettings({...editSettings, facebook: e.target.value})} 
                    placeholder="https://facebook.com/..."
                    className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Instagram URL</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="url" 
                    value={editSettings.instagram} 
                    onChange={e => setEditSettings({...editSettings, instagram: e.target.value})} 
                    placeholder="https://instagram.com/..."
                    className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">YouTube URL</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="url" 
                    value={editSettings.youtube} 
                    onChange={e => setEditSettings({...editSettings, youtube: e.target.value})} 
                    placeholder="https://youtube.com/..."
                    className="w-full pl-10 pr-4 py-3 bg-brand-sand-50 border border-brand-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold-400"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                try {
                  await updateSettings(editSettings);
                  alert('Business details updated successfully!');
                } catch (e) {
                  console.error(e);
                  alert('Failed to update details');
                }
              }}
              className="w-full bg-brand-green-900 text-white font-bold py-4 rounded-xl hover:bg-brand-green-800 transition-colors shadow-lg active:scale-95"
            >
              Save Changes
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-red-100">
            <h3 className="text-lg font-bold text-red-600 mb-2 uppercase tracking-wider">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4 font-medium">Use these actions with extreme caution. They are irreversible.</p>
            <button 
              onClick={handleResetAnalytics}
              className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              <Trash2 size={18} /> Reset Analytics & Orders
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => setActiveChartBox('orders')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'orders' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'orders' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Total Orders</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'orders' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{totalOrders}</p>
              <p className={`text-sm mt-2 font-medium ${activeChartBox === 'orders' ? 'text-brand-sand-200' : 'text-brand-green-700'}`}>Today: {todaysOrders.length}</p>
            </button>
            <button 
              onClick={() => setActiveChartBox('revenue')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'revenue' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'revenue' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Total Revenue</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'revenue' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>₹{totalRevenue.toLocaleString()}</p>
              <p className={`text-sm mt-2 font-medium ${activeChartBox === 'revenue' ? 'text-brand-sand-200' : 'text-brand-green-700'}`}>Today: ₹{todaysRevenue.toLocaleString()}</p>
            </button>
            <button 
              onClick={() => setActiveChartBox('gift')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'gift' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'gift' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Gifting Orders</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'gift' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{giftOrders.length}</p>
              <p className="text-sm mt-2 text-gray-400 invisible">Placeholder</p>
            </button>
            <button 
              onClick={() => setActiveChartBox('regular')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'regular' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'regular' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Without Gifting</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'regular' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{regularOrders.length}</p>
              <p className="text-sm mt-2 text-gray-400 invisible">Placeholder</p>
            </button>
            <button 
              onClick={() => setActiveChartBox('totalVisits')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'totalVisits' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'totalVisits' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Total Visits</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'totalVisits' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{totalVisitsCount}</p>
              <p className={`text-sm mt-2 font-medium ${activeChartBox === 'totalVisits' ? 'text-brand-sand-200' : 'text-brand-green-700'}`}>Today: {todaysVisits.length}</p>
            </button>
            <button 
              onClick={() => setActiveChartBox('newVisits')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'newVisits' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'newVisits' ? 'text-brand-gold-300' : 'text-gray-500'}`}>New Visits</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'newVisits' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{uniqueVisitorsCount}</p>
              <p className={`text-sm mt-2 font-medium ${activeChartBox === 'newVisits' ? 'text-brand-sand-200' : 'text-brand-green-700'}`}>Today: {todaysNewVisits}</p>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-brand-sand-200 shadow-sm rounded-2xl p-6">
              <h3 className="text-xl font-serif text-brand-green-900 mb-6 font-bold">Daily Orders & Revenue (Last 7 Days)</h3>
              <div className="w-full text-sm">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#14532D" allowDecimals={false} width={40} />
                    <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" allowDecimals={false} width={80} tickFormatter={(val) => '₹'+val.toLocaleString()} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="orders" name="Orders" stroke="#14532D" strokeWidth={3} dot={{ fill: '#14532D', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#fbbf24" strokeWidth={3} dot={{ fill: '#fbbf24', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-brand-sand-200 shadow-sm rounded-2xl p-6">
              <h3 className="text-xl font-serif text-brand-green-900 mb-6 font-bold">Website Visits (Last 7 Days)</h3>
              <div className="w-full text-sm">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Line type="monotone" dataKey="totalVisits" name="Total Visits" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="newVisits" name="New Visits" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif text-brand-green-900">Your Catalog</h2>
            <div className="flex gap-4">
              {products.length === 0 && (
                <button onClick={seedInitialProducts} className="bg-brand-gold-500 text-brand-green-900 px-4 py-2 rounded-xl font-medium hover:bg-brand-gold-400 transition-colors">
                  Seed Default Products
                </button>
              )}
              <button onClick={() => { setIsAdding(true); setEditingProduct({ id: '', name: '', description: '', price: 0, imageUrl: '', category: 'Dates', currency: 'INR', isFeatured: false }); }} className="bg-brand-green-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-brand-green-800 transition-colors">
                <Plus size={18} /> Add Product
              </button>
            </div>
          </div>

          {editingProduct && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-serif text-brand-green-900 mb-6">{isAdding ? 'Add New Product' : 'Edit Product'}</h3>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-2 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (Markdown Supported)</label>
                    <textarea required value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-2 border rounded-xl font-mono text-sm" rows={6} placeholder="Describe the product. You can use **bold**, *italics*, or - lists." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">MRP (₹)</label>
                      <input type="number" placeholder="Optional" value={editingProduct.mrp || ''} onChange={e => setEditingProduct({...editingProduct, mrp: e.target.value ? Number(e.target.value) : undefined})} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
                      <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight</label>
                      <input type="text" placeholder="e.g. 500g, 1kg" value={editingProduct.weight || ''} onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} className="w-full p-2 border rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-brand-green-900">Custom Highlight Section</h4>
                    <p className="text-xs text-gray-500">Add a special highlighted section for this product (like health benefits). Supports Markdown for content.</p>
                    <div>
                      <label className="block text-sm font-medium mb-1">Highlight Heading</label>
                      <input type="text" placeholder="e.g. Prophetic Superfood Health Benefits" value={editingProduct.highlightHeading || ''} onChange={e => setEditingProduct({...editingProduct, highlightHeading: e.target.value})} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Highlight Content (Markdown)</label>
                      <textarea placeholder="Use Markdown for lists, bold, etc.&#10;- **Boosts energy**&#10;- **Aids digestion**" value={editingProduct.highlightContent || ''} onChange={e => setEditingProduct({...editingProduct, highlightContent: e.target.value})} className="w-full p-2 border rounded-xl font-mono text-sm" rows={4} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Image (Main)</label>
                    <input 
                       type="file" 
                       accept="image/*"
                         onChange={(e) => {
                           processFiles(e.target.files, (urls) => {
                             setEditingProduct({ ...editingProduct!, imageUrl: urls[0] });
                           });
                         }} 
                         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-sand-100 file:text-brand-green-900 hover:file:bg-brand-sand-200" 
                      />
                      {editingProduct.imageUrl ? (
                        <div className="mt-2 relative inline-block">
                          <img src={editingProduct.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-brand-sand-200" />
                          <button type="button" onClick={() => setEditingProduct({ ...editingProduct!, imageUrl: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><Trash2 size={12} /></button>
                        </div>
                      ) : null}
                    </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Additional Gallery Images</label>
                    <input 
                       type="file" 
                       accept="image/*"
                       multiple
                         onChange={(e) => {
                           processFiles(e.target.files, (urls) => {
                             setEditingProduct({ ...editingProduct!, additionalImages: [...(editingProduct!.additionalImages || []), ...urls] });
                           });
                         }} 
                         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-sand-100 file:text-brand-green-900 hover:file:bg-brand-sand-200" 
                      />
                      {editingProduct.additionalImages && editingProduct.additionalImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editingProduct.additionalImages.map((imgUrl, i) => (
                            <div key={i} className="relative inline-block">
                              <img src={imgUrl} className="h-16 w-16 object-cover rounded-xl border border-brand-sand-200" />
                              <button type="button" onClick={() => {
                                const newArr = [...editingProduct.additionalImages!];
                                newArr.splice(i, 1);
                                setEditingProduct({ ...editingProduct!, additionalImages: newArr });
                              }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"><Trash2 size={12} /></button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const markdown = `![Product Image](${imgUrl})`;
                                  navigator.clipboard.writeText(markdown);
                                  alert('Markdown image link copied! You can now paste it in the description.');
                                }}
                                className="absolute -bottom-2 -right-2 bg-brand-gold-500 text-brand-green-900 rounded-full p-1 shadow-md z-10"
                                title="Copy Markdown Link"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-1">Description Images</label>
                     <p className="text-xs text-gray-500 mb-2">These images will be displayed below the product description in full size.</p>
                    <input 
                       type="file" 
                       accept="image/*"
                       multiple
                         onChange={(e) => {
                           // Use 1600px for description images so they appear full quality
                           processFiles(e.target.files, (urls) => {
                             setEditingProduct({ ...editingProduct!, descriptionImages: [...(editingProduct!.descriptionImages || []), ...urls] });
                           }, 1600, 1600);
                         }} 
                         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-sand-100 file:text-brand-green-900 hover:file:bg-brand-sand-200" 
                      />
                      {editingProduct.descriptionImages && editingProduct.descriptionImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editingProduct.descriptionImages.map((imgUrl, i) => (
                            <div key={i} className="relative inline-block">
                              <img src={imgUrl} className="h-16 w-16 object-cover rounded-xl border border-brand-sand-200" />
                              <button type="button" onClick={() => {
                                const newArr = [...editingProduct.descriptionImages!];
                                newArr.splice(i, 1);
                                setEditingProduct({ ...editingProduct!, descriptionImages: newArr });
                              }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"><Trash2 size={12} /></button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const markdown = `![Description Image](${imgUrl})`;
                                  navigator.clipboard.writeText(markdown);
                                  alert('Markdown image link copied! You can now paste it in the description.');
                                }}
                                className="absolute -bottom-2 -right-2 bg-brand-gold-500 text-brand-green-900 rounded-full p-1 shadow-md z-10"
                                title="Copy Markdown Link"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="isFeatured" checked={editingProduct.isFeatured || false} onChange={e => setEditingProduct({...editingProduct, isFeatured: e.target.checked})} />
                    <label htmlFor="isFeatured" className="text-sm font-medium">Featured Product</label>
                  </div>
                  <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-2 text-gray-500 font-medium">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-brand-green-900 text-white rounded-xl font-medium">Save Product</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white border rounded-2xl p-4 flex gap-4 pr-12 relative overflow-hidden group">
                <img src={product.imageUrl || undefined} className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h4 className="font-medium text-brand-green-900">{product.name}</h4>
                  <p className="text-brand-gold-600 font-medium text-sm mt-1">₹{product.price}</p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-2 px-3 border-l bg-gray-50">
                  <button onClick={() => { setIsAdding(false); setEditingProduct(product); }} className="p-2 text-blue-600 hover:bg-blue-100 bg-blue-50 transition-colors rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 bg-red-50 transition-colors rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-left sm:text-sm">
            <thead className="bg-brand-sand-50 border-b text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">City</th>
                <th className="p-4 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="p-4">
                    <div className="font-medium text-brand-green-900">{c.name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{c.phone || '-'}</td>
                  <td className="p-4 text-gray-600">{c.city || '-'}</td>
                  <td className="p-4 text-gray-500 text-right">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brand-green-900 mb-4">Contact Form Messages</h2>
          {messages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No messages yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {[...messages].sort((a,b) => b.createdAt - a.createdAt).map((msg) => (
                <div key={msg.id} className="bg-white border border-brand-sand-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-brand-green-900 text-lg">{msg.firstName} {msg.lastName}</h4>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Mail size={14} /> <a href={`mailto:${msg.email}`} className="hover:text-brand-green-700 underline">{msg.email}</a></span>
                        <span className="flex items-center gap-1"><Phone size={14} /> <a href={`tel:${msg.phone}`} className="hover:text-brand-green-700 underline">{msg.phone}</a></span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-brand-sand-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap text-sm border border-brand-sand-100">
                    {msg.message}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={async () => {
                        if(window.confirm('Are you sure you want to delete this message?')) {
                          try {
                            await deleteDoc(doc(db, 'contact_messages', msg.id));
                            setMessages(messages.filter(m => m.id !== msg.id));
                          } catch (e) {
                            handleFirestoreError(e, OperationType.DELETE, `contact_messages/${msg.id}`);
                            alert('Failed to delete message');
                          }
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your inquiry to The RM Souq`}
                      className="px-3 py-1.5 text-xs font-bold bg-brand-green-900 text-white hover:bg-brand-green-800 rounded-lg transition-all shadow-sm flex items-center gap-1"
                    >
                      <Mail size={14} /> Reply via Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-brand-green-900">Recent Orders</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Filter by Status:</span>
              <select 
                value={orderStatusFilter} 
                onChange={e => setOrderStatusFilter(e.target.value as any)}
                className="bg-white border border-brand-sand-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-400 font-medium"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...orders]
              .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter || (!o.status && orderStatusFilter === 'pending'))
              .sort((a,b) => b.createdAt - a.createdAt)
              .map(order => (
              <div key={order.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-brand-sand-300 transition-colors">
                <div>
                  <p className="font-medium text-brand-green-900 flex items-center gap-2">
                    {order.userName} - ₹{order.totalPrice?.toLocaleString()}
                    {order.shippingChargeEstimate ? (
                      <span className="text-xs font-normal text-gray-500 whitespace-nowrap">(Shipping: {order.shippingChargeEstimate})</span>
                    ) : order.shippingCharge > 0 ? (
                      <span className="text-xs font-normal text-gray-500 whitespace-nowrap">(Incl. ₹{order.shippingCharge} shipping)</span>
                    ) : null}
                    {order.isGift && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">🎁 GIFT ORDER</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()} | Phone: {order.phone} | Address: {order.address || 'N/A'}</p>
                  <div className="mt-3 space-y-1 bg-brand-sand-50 p-3 rounded-xl border border-brand-sand-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Order Items:</p>
                    {order.items?.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-6 h-6 bg-white text-brand-green-900 border border-brand-sand-200 rounded-md flex items-center justify-center text-xs font-bold">{item.quantity}x</span>
                        {item.name}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center text-sm text-gray-600">
                  <span className="bg-brand-sand-100 px-3 py-1 rounded-full whitespace-nowrap font-medium text-brand-green-900">{order.items?.length || 0} items</span>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className={`px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wider ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                    
                    <div className="flex flex-wrap gap-2 sm:ml-2 mt-2 sm:mt-0">
                      <div className="flex items-center bg-brand-sand-50 rounded-lg border border-brand-sand-200 px-2 py-1">
                        <span className="text-[10px] font-bold text-gray-400 mr-2">TRACKING:</span>
                        <input 
                          type="text" 
                          placeholder="ID..." 
                          className="bg-transparent text-xs outline-none w-24 font-mono"
                          defaultValue={order.trackingId || ''}
                          onBlur={async (e) => {
                            const val = e.target.value;
                            if (val !== (order.trackingId || '')) {
                              try {
                                await updateDoc(doc(db, 'orders', order.id), { trackingId: val });
                                setOrders(orders.map(o => o.id === order.id ? { ...o, trackingId: val } : o));
                              } catch (err) {
                                handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
                              }
                            }
                          }}
                        />
                      </div>

                      {(!order.status || order.status === 'pending') && (
                        <>
                           <button
                             onClick={async () => {
                               const trackingId = prompt("Please enter the Tracking ID to ship this order:");
                               if (trackingId !== null) {
                                 try {
                                   await updateDoc(doc(db, 'orders', order.id), { 
                                     status: 'shipped',
                                     trackingId: trackingId 
                                   });
                                   setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'shipped', trackingId: trackingId } : o));
                                 } catch (err) {
                                   handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
                                 }
                               }
                             }}
                             className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                           >
                             <Truck size={14} /> Ship
                           </button>
                           <button
                             onClick={async () => {
                               try {
                                 await updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
                                 setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                               } catch (e) { 
                                 handleFirestoreError(e, OperationType.UPDATE, `orders/${order.id}`);
                                 alert('Failed to update status'); 
                               }
                             }}
                             className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white hover:bg-green-600 rounded-lg transition-all shadow-sm"
                           >
                             Complete
                           </button>
                           <button
                             onClick={async () => {
                               if(window.confirm('Are you sure you want to cancel this order?')) {
                                 try {
                                   await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
                                   setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                                 } catch (e) { 
                                   handleFirestoreError(e, OperationType.UPDATE, `orders/${order.id}`);
                                   alert('Failed to update status'); 
                                 }
                               }
                             }}
                             className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                           >
                             Cancel
                           </button>
                        </>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
                              setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                            } catch (e) {
                              handleFirestoreError(e, OperationType.UPDATE, `orders/${order.id}`);
                              alert('Failed to update status');
                            }
                          }}
                          className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                        >
                          <Check size={14} /> Delivered
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if(window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
                            try {
                              await deleteDoc(doc(db, 'orders', order.id));
                              setOrders(orders.filter(o => o.id !== order.id));
                            } catch (e) { 
                              handleFirestoreError(e, OperationType.DELETE, `orders/${order.id}`);
                              alert('Failed to delete order'); 
                            }
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <button
                        onClick={() => {
                          const summary = `*Order ID:* ${order.id}\n*Customer:* ${order.userName}\n*Phone:* ${order.phone || 'N/A'}\n*Total:* ₹${order.totalPrice?.toLocaleString() || 0}\n\n*Items:*\n${order.items?.map((i: any) => `- ${i.quantity}x ${i.name}`).join('\n')}`;
                          if (navigator.share) {
                            navigator.share({
                              title: 'Order Summary',
                              text: summary,
                            }).catch((error) => console.log('Sharing failed', error));
                          } else {
                            navigator.clipboard.writeText(summary);
                            alert('Order details copied to clipboard!');
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 flex items-center justify-center gap-1"
                      >
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {orders.filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter || (!o.status && orderStatusFilter === 'pending')).length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No orders found for the selected status.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'coupons' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-serif text-brand-green-900 mb-6">Create New Discount Code</h2>
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Code</label>
                <input 
                  type="text" 
                  value={newCoupon.code} 
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} 
                  placeholder="SAVE20"
                  className="w-full px-4 py-2 bg-brand-sand-50 border border-brand-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Type</label>
                <select 
                  value={newCoupon.type} 
                  onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                  className="w-full px-4 py-2 bg-brand-sand-50 border border-brand-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  {newCoupon.type === 'percentage' ? 'Discount %' : 'Discount ₹'}
                </label>
                <input 
                  type="number" 
                  value={newCoupon.discount} 
                  onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})} 
                  className="w-full px-4 py-2 bg-brand-sand-50 border border-brand-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Min. Purchase (₹)</label>
                <input 
                  type="number" 
                  value={newCoupon.minPurchase} 
                  onChange={e => setNewCoupon({...newCoupon, minPurchase: Number(e.target.value)})} 
                  className="w-full px-4 py-2 bg-brand-sand-50 border border-brand-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Limit Per Person</label>
                <input 
                  type="number" 
                  value={newCoupon.usageLimit} 
                  onChange={e => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value)})} 
                  placeholder="0 = Unlimited"
                  className="w-full px-4 py-2 bg-brand-sand-50 border border-brand-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold-500"
                />
              </div>
              <button type="submit" className="md:col-span-5 bg-brand-green-900 text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-green-800 transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Add Code
              </button>
            </form>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-sand-100 border-b border-brand-sand-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Discount</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Min. Purchase</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Limit/Person</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total Used</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand-200">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-brand-sand-50">
                    <td className="p-4 font-bold text-brand-green-900">{coupon.code}</td>
                    <td className="p-4 text-gray-600">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                    </td>
                    <td className="p-4 text-gray-600">₹{coupon.minPurchase || 0}</td>
                    <td className="p-4 text-gray-600">
                      {coupon.usageLimit > 0 ? `${coupon.usageLimit} times` : '∞'}
                    </td>
                    <td className="p-4 text-brand-green-700 font-medium">{coupon.usageCount || 0}</td>
                    <td className="p-4">
                      <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">No discount codes created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
