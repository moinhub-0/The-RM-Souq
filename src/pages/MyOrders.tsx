import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShoppingBag, Calendar, MapPin, Truck, ExternalLink, PackageCheck, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; imageUrl: string }>;
  totalPrice: number;
  status: string;
  createdAt: number;
  isGift?: boolean;
  trackingId?: string;
  shippingDetails: {
    fullAddress: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  };
}

export default function MyOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        
        // Sort manually by date desc (since no composite index might exist yet)
        fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading || loadingOrders) {
    return <div className="text-center py-24 text-gray-500">Loading orders...</div>;
  }

  if (!user) {
    return <div className="text-center py-24">Please log in to view your orders.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-12 px-4 sm:px-0"
    >
      <h1 className="text-3xl font-serif text-brand-green-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="text-brand-gold-500" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-sand-50 p-12 text-center rounded-2xl border border-brand-sand-200"
        >
          <p className="text-gray-500 text-lg mb-4">You have not placed any orders yet.</p>
          <a href="/" className="text-brand-gold-600 hover:text-brand-gold-700 font-medium hover:underline">
            Start Shopping
          </a>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-brand-sand-200 rounded-2xl p-6 shadow-sm"
              >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-sand-100 pb-4 mb-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {order.isGift && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      🎁 Gift Order
                    </span>
                  )}
                  <span className="text-lg font-medium text-brand-green-900">₹{order.totalPrice.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      order.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      {order.status === 'pending' && <Clock size={12} />}
                      {order.status === 'shipped' && <Truck size={12} />}
                      {order.status === 'completed' && <PackageCheck size={12} />}
                      {order.status === 'cancelled' && <XCircle size={12} />}
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {(order.status === 'shipped' || order.status === 'completed') && order.trackingId && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="bg-[#0a3d1d]/5 border border-[#0a3d1d]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#0a3d1d] p-3 rounded-xl text-white">
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0a3d1d] opacity-60">Shipment Status</p>
                        <p className="text-sm font-bold text-[#0a3d1d]">Your order has been shipped!</p>
                        <p className="text-xs text-brand-green-800/70">Tracking ID: {order.trackingId}</p>
                      </div>
                    </div>
                    <a 
                      href={`https://shiprocket.co/tracking/${order.trackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-[#0a3d1d] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#062914] transition-all shadow-md active:scale-95"
                    >
                      Track with Shiprocket <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-brand-green-900 text-sm uppercase tracking-wider">Items</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img src={item.imageUrl || undefined} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-brand-sand-100" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-medium text-brand-green-900 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 bg-brand-sand-50 p-4 rounded-xl">
                    <p>{order.shippingDetails?.fullAddress}</p>
                    <p>{order.shippingDetails?.city}, {order.shippingDetails?.district ? order.shippingDetails?.district + ', ' : ''}{order.shippingDetails?.state}</p>
                    <p>Pincode: {order.shippingDetails?.pincode}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}
    </motion.div>
  );
}
