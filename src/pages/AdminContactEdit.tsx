import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Edit2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

export default function AdminContactEdit() {
  const [config, setConfig] = useState({
    banner: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      const snap = await getDoc(doc(db, 'site_settings', 'contact_page'));
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...(snap.data() as any) }));
      }
      setLoading(false);
    };
    fetchDoc();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'site_settings', 'contact_page'), config, { merge: true });
      alert("Contact page saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-serif text-gray-800 flex items-center gap-2 mb-8"><Edit2 size={18} className="text-[#b48d3d]" /> Edit Contact Page</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Hero Banner (Image or .mp4 URL)</h3>
          <ImageUpload 
            currentImage={config.banner} 
            onSuccess={(url) => setConfig({...config, banner: url})}
            folder="banners"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="bg-[#0d2b22] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#0a2016] transition-colors flex items-center gap-2 shadow-sm">
            <Save size={16} /> Save Contact Settings
          </button>
        </div>
      </div>
    </div>
  );
}
