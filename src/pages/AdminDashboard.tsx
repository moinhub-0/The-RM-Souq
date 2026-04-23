import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts, Product } from '../contexts/ProductContext';
import { LayoutDashboard, Users, ShoppingBag, Package, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { products, seedInitialProducts } = useProducts();
  
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  if (loading || loadingData) return <div className="text-center py-20 text-gray-500">Loading admin data...</div>;

  // Analytics Calculations
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const todaysOrders = orders.filter(o => now - o.createdAt < ONE_DAY);
  const last7DaysOrders = orders.filter(o => now - o.createdAt < 7 * ONE_DAY);
  const last30DaysOrders = orders.filter(o => now - o.createdAt < 30 * ONE_DAY);

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const todaysRevenue = todaysOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-sand-200">
              <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Today's Orders</h3>
              <p className="text-4xl font-serif text-brand-green-900">{todaysOrders.length}</p>
              <p className="text-sm text-brand-green-700 mt-2 font-medium">₹{todaysRevenue.toLocaleString()} revenue</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-sand-200">
              <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Last 7 Days</h3>
              <p className="text-4xl font-serif text-brand-green-900">{last7DaysOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-sand-200">
              <h3 className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Last 30 Days</h3>
              <p className="text-4xl font-serif text-brand-green-900">{last30DaysOrders.length}</p>
            </div>
            <div className="bg-brand-green-900 p-6 rounded-2xl shadow-sm border border-brand-green-800 text-white">
              <h3 className="text-brand-gold-300 text-sm font-medium mb-2 uppercase tracking-wider">Total Revenue</h3>
              <p className="text-4xl font-serif text-brand-gold-400">₹{totalRevenue.toLocaleString()}</p>
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
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input required value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className="w-full p-2 border rounded-xl" />
                    </div>
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
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-2 px-3 border-l bg-gray-50 translate-x-full group-hover:translate-x-0 transition-transform">
                  <button onClick={() => { setIsAdding(false); setEditingProduct(product); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
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
            <div key={order.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p className="font-medium text-brand-green-900">{order.userName} - ₹{order.totalPrice}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 text-sm text-gray-600">
                <span className="bg-brand-sand-100 px-3 py-1 rounded-full">{order.items.length} items</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wider">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
