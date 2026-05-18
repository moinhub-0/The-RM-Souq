import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'discounts'));
    const unsub = onSnapshot(q, snap => {
      const arr: any[] = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setDiscounts(arr);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAdd = async () => {
    if (!formData.code || formData.value <= 0) return alert("Invalid discount data");
    await addDoc(collection(db, 'discounts'), {
       code: formData.code.toUpperCase(),
       type: formData.type,
       value: formData.value,
       createdAt: Date.now()
    });
    setFormData({ code: '', type: 'percentage', value: 0 });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'discounts', id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-serif text-gray-800 mb-4">Create New Discount Code</h3>
        <div className="grid grid-cols-4 gap-4 items-end">
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Code</label>
            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="SAVE20" className="w-full text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#b48d3d]" />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#b48d3d]">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Rate (₹)</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Value</label>
            <input type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#b48d3d]" />
          </div>
          <div className="col-span-1">
            <button onClick={handleAdd} className="w-full bg-[#0d2b22] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0a2016] flex justify-center items-center gap-2">
              <Plus size={16} /> Add Code
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f4f3f0] border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Code</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {discounts.map(d => (
              <tr key={d.id}>
                <td className="px-6 py-4 font-bold text-gray-800">{d.code}</td>
                <td className="px-6 py-4 text-gray-600">{d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}</td>
                <td className="px-6 py-4"><button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {discounts.length === 0 && !loading && (
              <tr><td colSpan={3} className="px-6 py-4 text-gray-500 text-center">No discount codes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
