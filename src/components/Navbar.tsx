import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SidebarMenu from './SidebarMenu';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <nav className="bg-brand-green-900 text-brand-sand-50 sticky top-0 z-50 shadow-md">
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

          <div className="flex items-center space-x-6">
            <Link to="/profile" className="hover:text-brand-gold-400 transition-colors flex items-center gap-2">
              <User size={20} />
              <span className="hidden sm:inline text-sm font-medium">{user ? "My Account" : "Log In"}</span>
            </Link>
            
            <Link to="/cart" className="relative hover:text-brand-gold-400 transition-colors">
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold-500 text-brand-green-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
