import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import StaticPages from './pages/StaticPages';
import DeveloperProfile from './pages/DeveloperProfile';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import { AnimatePresence, motion } from 'motion/react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      // Don't track admin page visits as public visits? 
      // Usually we want to track visitors, not the admin themselves.
      if (pathname.startsWith('/admin')) return;

      let visitorId = localStorage.getItem('visitor_id');
      let isNewVisitor = false;
      
      if (!visitorId) {
        visitorId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('visitor_id', visitorId);
        isNewVisitor = true;
      }

      // To avoid massive spam on every internal link click in the same session, 
      // we could use sessionStorage to track "sessions".
      // But user said "repeated also", so let's stick to simple tracking.
      
      try {
        await addDoc(collection(db, 'visits'), {
          visitorId,
          timestamp: Date.now(),
          isNew: isNewVisitor,
          path: pathname
        });
      } catch (e) {
        // Silently fail to not disturb user experience
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><Shop /></motion.div>} />
        <Route path="/cart" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><Cart /></motion.div>} />
        <Route path="/checkout" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><Checkout /></motion.div>} />
        <Route path="/profile" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><Profile /></motion.div>} />
        <Route path="/product/:id" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><ProductDetails /></motion.div>} />
        <Route path="/my-orders" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><MyOrders /></motion.div>} />
        <Route path="/admin" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><AdminDashboard /></motion.div>} />
        <Route path="/about" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="about" /></motion.div>} />
        <Route path="/contact" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="contact" /></motion.div>} />
        <Route path="/privacy" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="privacy" /></motion.div>} />
        <Route path="/shipping" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="shipping" /></motion.div>} />
        <Route path="/terms" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="terms" /></motion.div>} />
        <Route path="/developer" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><DeveloperProfile /></motion.div>} />
        <Route path="/cancellation" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="cancellation" /></motion.div>} />
        <Route path="/return" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StaticPages page="return" /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <VisitTracker />
      <AuthProvider>
        <SettingsProvider>
          <ProductProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col font-sans">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                  <AnimatedRoutes />
                </main>
                <Footer />
                <FloatingWhatsApp />
              </div>
            </CartProvider>
          </ProductProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
