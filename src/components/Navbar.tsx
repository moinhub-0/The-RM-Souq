import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, UserCircle, Truck, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SidebarMenu from './SidebarMenu';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-brand-green-900 text-brand-sand-50 sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <SidebarMenu />
            
            <Link to="/" className="flex items-center gap-3 ml-2 group">
              <div className="bg-white rounded-xl p-1 shadow-sm group-hover:shadow-md transition-shadow">
                 <img src="/logo.png" alt="The RM Souq Logo" className="h-12 w-auto object-contain rounded-lg" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                 }} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-brand-gold-400">The RM Souq</span>
                <span className="text-[10px] tracking-widest uppercase opacity-80 text-brand-sand-100">Sunnah & Halal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-brand-gold-400 transition-colors flex items-center gap-1 sm:gap-2 p-1"
              >
                <div className="bg-brand-green-800 p-2 rounded-full">
                  <User size={18} />
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                  >
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-brand-sand-50/50">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-brand-green-900 truncate">{user.email}</p>
                      </div>
                    )}

                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-brand-green-900 hover:bg-brand-sand-50 transition-colors"
                    >
                      <User size={20} className="text-brand-green-900" />
                      <span className="font-medium">{user ? 'My Account' : 'Login / Sign Up'}</span>
                    </Link>

                    <Link 
                      to="/my-orders" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-brand-green-900 hover:bg-brand-sand-50 transition-colors"
                    >
                      <UserCircle size={20} className="text-brand-green-900" />
                      <span className="font-medium">My Orders</span>
                    </Link>

                    <a 
                      href="https://thermsouq.shiprocket.co" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-brand-green-900 hover:bg-brand-sand-50 transition-colors"
                    >
                      <Truck size={20} className="text-brand-green-900" />
                      <span className="font-medium">Track My Order</span>
                    </a>

                    {user && (
                      <>
                        <div className="h-px bg-gray-100 my-1 mx-2" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={20} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link to="/cart" className="relative hover:text-brand-gold-400 transition-colors flex items-center p-1">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold-500 text-brand-green-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-brand-green-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
