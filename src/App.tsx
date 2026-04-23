import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import StaticPages from './pages/StaticPages';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col font-sans">
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/about" element={<StaticPages page="about" />} />
                  <Route path="/contact" element={<StaticPages page="contact" />} />
                </Routes>
              </main>
              <footer className="bg-brand-green-900 py-12 text-center text-brand-sand-100">
                <div className="max-w-7xl mx-auto px-4">
                  <h3 className="font-serif text-2xl mb-2 text-brand-gold-400">The RM Souq</h3>
                  <p className="text-sm opacity-80 mb-6">Premium Sunnah & Halal Products</p>
                  <div className="text-xs opacity-60">
                    &copy; {new Date().getFullYear()} The RM Souq. All rights reserved.
                  </div>
                </div>
              </footer>
              <FloatingWhatsApp />
            </div>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
