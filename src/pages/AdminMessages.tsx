import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2 } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const msgs: any[] = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsub;
  }, []);

  const deleteMessage = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteDoc(doc(db, 'contact_messages', id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">Contact Form Messages</h2>
      {messages.length === 0 ? (
        <div className="text-gray-500">No messages found.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-6 relative">
              <div className="absolute top-6 right-6 bg-[#f4f3f0] text-gray-500 text-[10px] font-bold px-3 py-1 rounded-md">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
              </div>
              <h4 className="font-serif text-gray-800 font-bold mb-1">{msg.name}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium">
                <span className="flex items-center gap-1 border-b border-gray-300 pb-0.5"><span className="opacity-50">✉</span> {msg.email}</span>
                <span className="flex items-center gap-1 border-b border-gray-300 pb-0.5"><span className="opacity-50">📞</span> {msg.phone}</span>
              </div>
              <div className="bg-[#fbfa-f9] bg-stone-50 p-4 rounded-xl text-sm text-gray-700 mb-4 whitespace-pre-wrap">
                {msg.message || msg.text}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => deleteMessage(msg.id)} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors"><Trash2 size={12} /> Delete</button>
                <a href={`mailto:${msg.email}`} className="px-4 py-2 text-xs font-bold text-white bg-[#0d2b22] hover:bg-[#0a2016] rounded-lg flex items-center gap-1 transition-colors"><span className="opacity-70">✉</span> Reply via Email</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
