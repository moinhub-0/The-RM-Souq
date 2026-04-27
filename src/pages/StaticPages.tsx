import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Code, TrendingUp, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function StaticPages({ page }: { page: 'about' | 'contact' }) {
  const [aboutConfig, setAboutConfig] = useState({
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

  useEffect(() => {
    if (page === 'about') {
      const fetchAboutConfig = async () => {
        try {
          const snap = await getDoc(doc(db, 'site_settings', 'about_page'));
          if (snap.exists()) {
            setAboutConfig(snap.data() as any);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchAboutConfig();
    }
  }, [page]);

  if (page === 'about') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
        {/* About Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-block bg-brand-sand-100 text-brand-green-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-2 border border-brand-sand-200">
            Our Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-green-900 leading-tight">
            About The RM Souq
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {aboutConfig.visionText}
          </p>
        </motion.section>

        {/* Founders Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-brand-sand-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Code size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-brand-gold-600 font-bold tracking-widest uppercase text-xs mb-2 block">{aboutConfig.founderRole}</span>
              <h2 className="text-2xl font-serif text-brand-green-900 mb-4">{aboutConfig.founderName}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {aboutConfig.founderBio1}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {aboutConfig.founderBio2}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-brand-sand-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-brand-gold-600 font-bold tracking-widest uppercase text-xs mb-2 block">{aboutConfig.coFounderRole}</span>
              <h2 className="text-2xl font-serif text-brand-green-900 mb-4">{aboutConfig.coFounderName}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {aboutConfig.coFounderBio1}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {aboutConfig.coFounderBio2}
              </p>
            </div>
          </motion.div>
        </section>

        {/* The Equation */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-brand-green-900 text-brand-sand-50 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center justify-center bg-brand-gold-500/20 text-brand-gold-300 p-4 rounded-full mb-2">
              <HeartHandshake size={40} />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-gold-400 tracking-wide">
              {aboutConfig.equationTitle}
            </h2>
            <p className="text-lg md:text-xl text-brand-sand-100 max-w-2xl mx-auto leading-relaxed">
              {aboutConfig.equationText}
            </p>
          </div>
        </motion.section>

        {/* Contact Info (Compact) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-sand-50 border border-brand-sand-200 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-serif text-brand-green-900 mb-8 text-center">Get In Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Phone</p>
                <p className="font-semibold text-brand-green-900">7853903438</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                <p className="font-semibold text-brand-green-900">thermsouq@gmail.com</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Address</p>
                <p className="font-semibold text-brand-green-900">Birmitrapur, Sundergarh, Odisha</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  // Contact Page View
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-green-900">Contact Us</h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          We would love to hear from you! Whether you have questions about our premium Sunnah products, need help with your order, or just want to say hello.
        </p>
      </div>
      
      <div className="bg-white border border-brand-sand-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-6 text-brand-green-900 group">
            <div className="bg-brand-sand-100 p-4 rounded-2xl group-hover:bg-brand-gold-100 group-hover:text-brand-gold-700 transition-colors">
              <Phone size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Phone / WhatsApp</p>
              <p className="font-semibold text-xl">7853903438</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-brand-green-900 group">
            <div className="bg-brand-sand-100 p-4 rounded-2xl group-hover:bg-brand-gold-100 group-hover:text-brand-gold-700 transition-colors">
              <Mail size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
              <p className="font-semibold text-xl">thermsouq@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-brand-green-900 group">
            <div className="bg-brand-sand-100 p-4 rounded-2xl group-hover:bg-brand-gold-100 group-hover:text-brand-gold-700 transition-colors">
              <MapPin size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Location</p>
              <p className="font-semibold text-lg leading-tight">Birmitrapur, Sundergarh<br/>Odisha</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
