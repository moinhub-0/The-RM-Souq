import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function ContactSection() {
  const { settings } = useSettings();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 border-t border-brand-sand-200 mt-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left Side: Contact Information */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b4d3e] leading-tight">
              We'd Love to Hear From You
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md">
              Have a question about Ruhani Talbina or your order? We're always happy to connect.
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-4">
              <div className="bg-[#1b4d3e] text-white p-3 rounded-full flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Email Details</p>
                <p className="font-medium text-gray-900">{settings.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#1b4d3e] text-white p-3 rounded-full flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Phone</p>
                <p className="font-medium text-gray-900">+{settings.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#1b4d3e] text-white p-3 rounded-full flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Address</p>
                <p className="font-medium text-gray-900 line-clamp-3">{settings.address}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="bg-[#1b4d3e] text-white p-3 rounded-full hover:bg-[#2ecc71] hover:text-[#0d2b22] transition-all transform hover:scale-110">
                  <Facebook size={20} />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="bg-[#1b4d3e] text-white p-3 rounded-full hover:bg-[#2ecc71] hover:text-[#0d2b22] transition-all transform hover:scale-110">
                  <Instagram size={20} />
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="bg-[#1b4d3e] text-white p-3 rounded-full hover:bg-[#2ecc71] hover:text-[#0d2b22] transition-all transform hover:scale-110">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm text-gray-600 space-y-2 mt-4">
            <p><strong className="text-[#1b4d3e] font-semibold">Trade-Name:</strong> The RM Souq</p>
            <p><strong className="text-[#1b4d3e] font-semibold">Legal Name:</strong> Reyan Ansari & Moinuddin Hasan</p>
            <p><strong className="text-[#1b4d3e] font-semibold">FSSAI Number:</strong> 22026031000271</p>
          </div>
        </div>

        {/* Right Side: Modern Contact Form */}
        <div className="bg-[#0d2b22] p-8 md:p-10 text-white shadow-2xl w-full" style={{ borderRadius: '25px' }}>
          <form name="contact-form" method="POST" data-netlify="true" className="space-y-6">
            <input type="hidden" name="form-name" value="contact-form" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-300">First Name</label>
                <input type="text" id="firstName" name="firstName" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-300">Last Name</label>
                <input type="text" id="lastName" name="lastName" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</label>
              <input type="tel" id="phone" name="phone" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all" placeholder="+91 00000 00000" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
              <input type="email" id="email" name="email" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all" placeholder="name@example.com" />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-300">Message / Comments</label>
              <textarea id="message" name="message" rows={4} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-[#0d2b22] font-bold text-lg py-4 rounded-xl transition-colors shadow-lg mt-4">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
}
