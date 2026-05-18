import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Code, TrendingUp, HeartHandshake, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ContactSection from '../components/ContactSection';
import { useSettings } from '../context/SettingsContext';

export default function StaticPages({ page }: { page: 'about' | 'contact' | 'privacy' | 'shipping' | 'terms' | 'cancellation' | 'return' }) {
  const { settings } = useSettings();
  const [aboutConfig, setAboutConfig] = useState({
    banner: '',
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

  const [legalPagesConfig, setLegalPagesConfig] = useState({
    privacy: `At The RM Souq, accessible from the-rm-souq.netlify.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The RM Souq and how we use it.

## 1. Information We Collect
When you visit our store or make a purchase, we collect the following information to provide you with a smooth shopping experience:
- **Personal Identifiable Information:** Name, shipping address, billing address, email address, and phone number.
- **Order Details:** Information about the products you purchase (e.g., Ruhani Talbina, dates).
- **Device Information:** IP address, browser type, and cookies used to improve site performance.

## 2. How We Use Your Information
We use the information we collect in various ways, including to:
- Process, fulfill, and ship your orders via our logistics partner (Shiprocket).
- Communicate with you regarding order updates or customer support.
- Prevent fraudulent transactions.
- Analyze how you use our website to improve our services and product offerings.

## 3. Third-Party Sharing
We do not sell or rent your personal data to third parties. However, we share your information with trusted service providers to run our business.

## 4. Data Security
We prioritize the security of your data. While no method of transmission over the internet is 100% secure, we use industry-standard encryption and secure hosting on Netlify to protect your personal information.

## 5. Contact Us
**Legal Name:** Reyan Ansari & Moinuddin Hasan  
**Phone:** +91 7853903438  
**Email:** thermsouq@gmail.com  
**Address:** Birmitrapur, Sundergarh, Odisha, India.`,
    shipping: `## Order Processing
All orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or holidays will be processed on the next working day.

## Delivery Timeframe
- **Metro Cities:** 2–4 business days from dispatch
- **Other Locations:** 3–7 business days from dispatch
- **Remote Areas:** 7–14 business days from dispatch

## Shipping Charges
- **Free Shipping:** On orders above ₹500 (Prepaid only)
- **Standard Shipping:** ₹50–150 depending on location (Prepaid)
- **COD (Cash on Delivery):** Additional ₹30–50 charges apply

## Tracking Your Order
Once your order is dispatched, you will receive an SMS with tracking number, courier details, and a tracking link to monitor real-time delivery status.`,
    terms: `## Agreement to Terms
By accessing the-rm-souq.netlify.app, you agree to be bound by these Terms and Conditions. These terms apply to all visitors and customers.

## Product Authenticity
As an authorized distributor of Ruhani Souq, we guarantee that all Ruhani Talbina and related products sold on our platform are 100% authentic and sourced directly from the manufacturer.

## Pricing and Payments
All prices are in INR. We reserve the right to change prices without notice. Payments are accepted via UPI (Google Pay) and other listed methods. Orders are only confirmed once payment is verified.`,
    cancellation: `## Before Dispatch
You can cancel your order within 12 hours of placing it or before it has been handed over to our shipping partner (Shiprocket), whichever is earlier. For cancellations made during this window, a full refund will be processed.

## After Dispatch
Once an order is dispatched, it cannot be canceled. If you refuse the delivery, the outward and inward shipping charges will be deducted from your refund.

## How to Cancel
To request a cancellation, please WhatsApp us at **+91 7853903438** or email **thermsouq@gmail.com** with your Order ID.`,
    return: `## Food & Hygiene Policy
Due to the nature of our products (Food/Health Supplements), we do not accept returns once the product seal is broken or the package is opened, unless the product is defective or damaged upon arrival.

## Damaged or Incorrect Items
If you receive a damaged product or the wrong item:
1. You must inform us within 24 hours of delivery.
2. You must provide an unboxing video clearly showing the shipping label and the damage/wrong item.
3. Once verified, we will send a replacement at no extra cost or initiate a refund.

## Non-Returnable Items
- Items on clearance or special sale.
- Products with broken safety seals.
- Requests made after 48 hours of delivery.`,
  });

  const [contactConfig, setContactConfig] = useState({
    banner: '',
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
    } else if (page === 'contact') {
      const fetchContactConfig = async () => {
        try {
          const snap = await getDoc(doc(db, 'site_settings', 'contact_page'));
          if (snap.exists()) {
            setContactConfig(snap.data() as any);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchContactConfig();
    } else if (['privacy', 'shipping', 'terms', 'cancellation', 'return'].includes(page)) {
      const fetchLegalConfig = async () => {
        try {
          const snap = await getDoc(doc(db, 'site_settings', 'legal_pages'));
          if (snap.exists()) {
            setLegalPagesConfig(snap.data() as any);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLegalConfig();
    }
  }, [page]);

  if (page === 'about') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
        {aboutConfig.banner && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl mb-12 group"
          >
            {aboutConfig.banner.endsWith('.mp4') ? (
               <video src={aboutConfig.banner} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            ) : (
               <img src={aboutConfig.banner} alt="About Ruhani Souq" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-green-900/80 via-transparent to-transparent flex items-end justify-center p-8 md:p-12">
              <h1 className="text-4xl md:text-7xl font-serif text-white text-center leading-tight">
                About The RM Souq
              </h1>
            </div>
          </motion.div>
        )}

        {/* About Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          {!aboutConfig.banner && (
            <h1 className="text-4xl md:text-5xl font-serif text-brand-green-900 leading-tight">
              About The RM Souq
            </h1>
          )}
          <div className="inline-block bg-brand-sand-100 text-brand-green-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-2 border border-brand-sand-200">
            Our Vision
          </div>
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
                <p className="font-semibold text-brand-green-900">{settings.phoneNumber}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                <p className="font-semibold text-brand-green-900">{settings.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Address</p>
                <p className="font-semibold text-brand-green-900 line-clamp-1">{settings.address}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-12 pt-8 border-t border-brand-sand-200">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600 group-hover:bg-brand-green-900 group-hover:text-white transition-all transform group-hover:scale-110">
                  <Facebook size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-brand-green-900">Facebook</span>
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600 group-hover:bg-brand-green-900 group-hover:text-white transition-all transform group-hover:scale-110">
                  <Instagram size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-brand-green-900">Instagram</span>
              </a>
            )}
            {settings.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="bg-white p-4 rounded-full shadow-sm text-brand-gold-600 group-hover:bg-brand-green-900 group-hover:text-white transition-all transform group-hover:scale-110">
                  <Youtube size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-brand-green-900">YouTube</span>
              </a>
            )}
          </div>
        </motion.section>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
        {contactConfig.banner && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative h-[300px] md:h-[450px] rounded-[3rem] overflow-hidden shadow-2xl mb-12 group"
          >
            {contactConfig.banner.endsWith('.mp4') ? (
               <video src={contactConfig.banner} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            ) : (
               <img src={contactConfig.banner} alt="Contact Ruhani Souq" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-green-900/80 via-transparent to-transparent flex items-end justify-center p-8 md:p-12">
              <h1 className="text-4xl md:text-7xl font-serif text-white text-center leading-tight">
                Contact Us
              </h1>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-6 mb-16"
        >
          {!contactConfig.banner && (
            <h1 className="text-4xl md:text-5xl font-serif text-brand-green-900 leading-tight mb-8">
              Contact Us
            </h1>
          )}
          <h2 className="text-4xl md:text-5xl font-serif text-brand-green-900 leading-tight">
            We're here to help!
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-medium">
            For any inquiries, or feedback regarding our range of supplements, please don't hesitate to get in touch. Our dedicated team is committed to providing you with the best possible service. Reach out via email or our website contact form, and let us assist you.
          </p>
        </motion.div>
        
        <ContactSection />
      </div>
    );
  }

  // Legal Pages
  if (['privacy', 'shipping', 'terms', 'cancellation', 'return'].includes(page)) {
    let title = '';
    let content = '';

    switch (page) {
      case 'privacy':
        title = 'Privacy Policy';
        content = legalPagesConfig.privacy;
        break;
      case 'shipping':
        title = 'Shipping Policy';
        content = legalPagesConfig.shipping;
        break;
      case 'terms':
        title = 'Terms & Conditions';
        content = legalPagesConfig.terms;
        break;
      case 'cancellation':
        title = 'Cancellation Policy';
        content = legalPagesConfig.cancellation;
        break;
      case 'return':
        title = 'Return & Refund Policy';
        content = legalPagesConfig.return;
        break;
    }

    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-green-900 border-b border-brand-sand-200 pb-4">{title}</h1>
        <div className="prose prose-brand max-w-none prose-headings:font-serif prose-headings:text-brand-green-900 prose-a:text-brand-gold-600 prose-a:no-underline hover:prose-a:text-brand-gold-700">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
}
