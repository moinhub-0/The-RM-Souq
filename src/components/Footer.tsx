import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import ContactSection from './ContactSection';
import { useSettings } from '../context/SettingsContext';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const { settings } = useSettings();

  // Do not show on admin page
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {location.pathname !== '/contact' && <ContactSection />}
      <footer className="bg-brand-green-900 py-12 text-brand-sand-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="inline-block mb-6 group">
              <h3 className="font-serif text-2xl font-bold text-brand-gold-400 group-hover:text-brand-gold-300 transition-colors tracking-wide">The RM Souq</h3>
            </Link>
            <p className="text-base font-medium opacity-90 max-w-xs leading-relaxed mb-8">
              Setting a higher standard in purity, transparency, and quality for your health and wellness.
            </p>
            <div className="flex items-center gap-8 mt-6">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold-400 transition-all">
                  <Facebook size={24} />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold-400 transition-all">
                  <Instagram size={24} />
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold-400 transition-all">
                  <Youtube size={24} />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-sand-50 tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:text-brand-gold-400 transition-colors">Home</Link></li>
              <li><a href="https://thermsouq.shiprocket.co" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold-400 transition-colors">Track My Order</a></li>
              <li><Link to="/profile" className="hover:text-brand-gold-400 transition-colors">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-sand-50 tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/about" className="hover:text-brand-gold-400 transition-colors">About The RM Souq</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-brand-gold-400 transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-sand-50 tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/privacy" className="hover:text-brand-gold-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-gold-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/cancellation" className="hover:text-brand-gold-400 transition-colors">Cancellation Policy</Link></li>
              <li><Link to="/return" className="hover:text-brand-gold-400 transition-colors">Return & Refund</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-green-800 pt-8 text-center text-[10px] uppercase font-black tracking-widest opacity-40 flex flex-col items-center gap-4">
          <p>&copy; {new Date().getFullYear()} The RM Souq. All rights reserved.</p>
          <p>Developed by <Link to="/developer" className="text-brand-gold-400 hover:text-brand-gold-300 transition-colors font-medium opacity-100">Moinuddin Hasan</Link></p>
        </div>
      </div>
    </footer>
    </>
  );
}
