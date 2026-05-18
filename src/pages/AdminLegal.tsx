import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Edit2 } from 'lucide-react';

export default function AdminLegal() {
  const [config, setConfig] = useState({
    privacy: '',
    shipping: '',
    terms: '',
    cancellation: '',
    return: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      const snap = await getDoc(doc(db, 'site_settings', 'legal_pages'));
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...(snap.data() as any) }));
      }
      setLoading(false);
    };
    fetchDoc();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'site_settings', 'legal_pages'), config, { merge: true });
      alert("Legal pages saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-serif text-gray-800 flex items-center gap-2 mb-2"><Edit2 size={18} className="text-[#b48d3d]" /> Edit Legal & Policy Pages</h2>
      <p className="text-xs text-gray-500 mb-8">You can use Markdown to format these pages.</p>
      
      <div className="space-y-6">
        {[
          { key: 'privacy', title: 'Privacy Policy' },
          { key: 'shipping', title: 'Shipping Policy' },
          { key: 'terms', title: 'Terms & Conditions' },
          { key: 'cancellation', title: 'Cancellation Policy' },
          { key: 'return', title: 'Return & Refund Policy' }
        ].map(policy => (
          <div key={policy.key}>
            <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{policy.title}</h3>
            <textarea 
              rows={4} 
              value={(config as any)[policy.key]} 
              onChange={e => setConfig({...config, [policy.key]: e.target.value})} 
              className="w-full font-mono text-[12px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-600 outline-none focus:border-[#b48d3d] resize-y" 
            />
          </div>
        ))}
        <button onClick={handleSave} className="w-full bg-[#0d2b22] text-white px-6 py-4 rounded-xl text-sm font-medium hover:bg-[#0a2016] transition-colors flex items-center justify-center gap-2 shadow-sm mt-4">
          <Save size={18} /> Save Legal Pages
        </button>
      </div>
    </div>
  );
}
