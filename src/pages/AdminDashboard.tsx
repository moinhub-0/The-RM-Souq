import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts, Product } from '../contexts/ProductContext';
import { LayoutDashboard, Plus, Trash2, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { products, seedInitialProducts } = useProducts();
  
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeChartBox, setActiveChartBox] = useState<'orders' | 'revenue' | 'gift' | 'regular'>('orders');

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const fetchedOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(fetchedOrders);

      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(fetchedUsers);
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

  const chartData = useMemo(() => {
    // Generate last 7 days data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * ONE_DAY);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const endOfDay = startOfDay + ONE_DAY;
      
      const dayOrders = orders.filter(o => o.createdAt >= startOfDay && o.createdAt < endOfDay);
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        gift: dayOrders.filter(o => o.isGift).length,
        regular: dayOrders.filter(o => !o.isGift).length,
      });
    }
    return data;
  }, [orders, now, ONE_DAY]);

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
      console.error(e);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        alert('Product deleted!');
      } catch (e) {
        console.error(e);
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
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'orders' ? 'border-brand-gold-500 text-brand-green-900' : 'border-transparent text-gray-500 hover:text-brand-green-700'}`}>Recent Orders</button>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </button>
            <button 
              onClick={() => setActiveChartBox('regular')}
              className={`text-left p-6 rounded-2xl shadow-sm border transition-colors ${activeChartBox === 'regular' ? 'bg-brand-green-900 border-brand-green-800 text-white' : 'bg-white border-brand-sand-200 hover:border-brand-green-300'}`}
            >
              <h3 className={`text-sm font-medium mb-2 uppercase tracking-wider ${activeChartBox === 'regular' ? 'text-brand-gold-300' : 'text-gray-500'}`}>Without Gifting</h3>
              <p className={`text-4xl font-serif ${activeChartBox === 'regular' ? 'text-brand-gold-400' : 'text-brand-green-900'}`}>{regularOrders.length}</p>
            </button>
          </div>
          
          <div className="bg-white border border-brand-sand-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-xl font-serif text-brand-green-900 mb-6 capitalize">{activeChartBox} (Last 7 Days)</h3>
            <div className="h-80 w-full text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" width={40} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => activeChartBox === 'revenue' ? `₹${value.toLocaleString()}` : value}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={activeChartBox} 
                    stroke="#14532D" 
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#fbbf24', stroke: '#14532D' }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea required value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-2 border rounded-xl" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₹)</label>
                      <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full p-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (Optional)</label>
                      <input type="text" placeholder="e.g. 500g, 1kg" value={editingProduct.weight || ''} onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} className="w-full p-2 border rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Image</label>
                    <input 
                       type="file" 
                       accept="image/*"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;

                           const reader = new FileReader();
                           reader.onload = (event) => {
                             const img = new Image();
                             img.onload = () => {
                               const canvas = document.createElement('canvas');
                               const MAX_WIDTH = 800;
                               const MAX_HEIGHT = 800;
                               let width = img.width;
                               let height = img.height;

                               if (width > height) {
                                 if (width > MAX_WIDTH) {
                                   height *= Math.round(MAX_WIDTH / width);
                                   width = MAX_WIDTH;
                                 }
                               } else {
                                 if (height > MAX_HEIGHT) {
                                   width *= Math.round(MAX_HEIGHT / height);
                                   height = MAX_HEIGHT;
                                 }
                               }

                               canvas.width = width;
                               canvas.height = height;
                               const ctx = canvas.getContext('2d');
                               ctx?.drawImage(img, 0, 0, width, height);
                               
                               const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                               setEditingProduct({ ...editingProduct!, imageUrl: dataUrl });
                             };
                             img.src = event.target?.result as string;
                           };
                           reader.readAsDataURL(file);
                         }} 
                         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-sand-100 file:text-brand-green-900 hover:file:bg-brand-sand-200" 
                      />
                      {editingProduct.imageUrl && (
                        <img src={editingProduct.imageUrl} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded-xl border border-brand-sand-200" />
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
                <img src={product.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
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

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.sort((a,b) => b.createdAt - a.createdAt).slice(0, 20).map(order => (
            <div key={order.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-brand-sand-300 transition-colors">
              <div>
                <p className="font-medium text-brand-green-900 flex items-center gap-2">
                  {order.userName} - ₹{order.totalPrice}
                  {order.isGift && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">🎁 GIFT ORDER</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()} | Phone: {order.phone}</p>
                <div className="mt-3 space-y-1">
                  {order.items?.map((item: any, idx: number) => (
                    <p key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-brand-sand-100 text-brand-green-900 rounded-md flex items-center justify-center text-xs font-bold">{item.quantity}x</span>
                      {item.name}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center text-sm text-gray-600">
                <span className="bg-brand-sand-100 px-3 py-1 rounded-full whitespace-nowrap">{order.items.length} items</span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wider ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                  
                  {order.status === 'pending' && (
                    <div className="flex gap-2 ml-2">
                       <button
                         onClick={async () => {
                           try {
                             await updateDoc(doc(db, 'orders', order.id), { status: 'completed' });
                             setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                           } catch (e) { console.error(e); alert('Failed to update status'); }
                         }}
                         className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                       >
                         Complete
                       </button>
                       <button
                         onClick={async () => {
                           if(window.confirm('Are you sure you want to cancel this order?')) {
                             try {
                               await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
                               setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                             } catch (e) { console.error(e); alert('Failed to update status'); }
                           }
                         }}
                         className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                       >
                         Cancel
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
