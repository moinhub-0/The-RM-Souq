import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useSettings();
  
  if (!settings.phoneNumber) return null;

  const handleClick = () => {
    const message = encodeURIComponent("Assalamu Alaikum! I'm interested in products from The RM Souq.");
    window.open(`https://wa.me/${settings.phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20ba5a] transition-colors group"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={32} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
      <span className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-100">
        Chat with us
      </span>
    </motion.button>
  );
};
