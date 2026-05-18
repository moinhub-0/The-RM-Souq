import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Edit2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

export default function AdminAboutUs() {
  const [config, setConfig] = useState({
    banner: '',
    visionText: '',
    founderName: '',
    founderRole: '',
    founderBio1: '',
    founderBio2: '',
    coFounderName: '',
    coFounderRole: '',
    coFounderBio1: '',
    coFounderBio2: '',
    equationTitle: '',
    equationText: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      const snap = await getDoc(doc(db, 'site_settings', 'about_page'));
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...(snap.data() as any) }));
      }
      setLoading(false);
    };
    fetchDoc();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'site_settings', 'about_page'), config, { merge: true });
      alert("About Us saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-serif text-gray-800 flex items-center gap-2 mb-8"><Edit2 size={18} className="text-[#b48d3d]" /> Edit About Us Page</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Hero Banner (Image or .mp4 URL)</h3>
          <ImageUpload 
            currentImage={config.banner} 
            onSuccess={(url) => setConfig({...config, banner: url})}
            folder="banners"
          />
        </div>

        <div>
           <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Vision Section</h3>
           <label className="block text-[11px] text-gray-500 mb-1">Vision Text</label>
           <textarea rows={3} value={config.visionText} onChange={e => setConfig({...config, visionText: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">The Founder</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Name</label>
              <input type="text" value={config.founderName} onChange={e => setConfig({...config, founderName: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
            <div>
               <label className="block text-[11px] text-gray-500 mb-1">Role Tag</label>
               <input type="text" value={config.founderRole} onChange={e => setConfig({...config, founderRole: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Bio Paragraph 1</label>
              <textarea rows={2} value={config.founderBio1} onChange={e => setConfig({...config, founderBio1: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Bio Paragraph 2</label>
              <textarea rows={2} value={config.founderBio2} onChange={e => setConfig({...config, founderBio2: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">The Co-Founder</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Name</label>
              <input type="text" value={config.coFounderName} onChange={e => setConfig({...config, coFounderName: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Role Tag</label>
              <input type="text" value={config.coFounderRole} onChange={e => setConfig({...config, coFounderRole: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Bio Paragraph 1</label>
              <textarea rows={2} value={config.coFounderBio1} onChange={e => setConfig({...config, coFounderBio1: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Bio Paragraph 2</label>
              <textarea rows={2} value={config.coFounderBio2} onChange={e => setConfig({...config, coFounderBio2: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#b48d3d]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="bg-[#0d2b22] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#0a2016] transition-colors flex items-center gap-2 shadow-sm">
            <Save size={16} /> Save About Settings
          </button>
        </div>
      </div>
    </div>
  );
}
