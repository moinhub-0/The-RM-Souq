import { useState } from 'react';
import { Menu, X, Home, ShoppingBag, User, Info, Phone, LayoutDashboard, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Checking admin purely by email as requested
  const isAdmin = user?.email === 'moincomp06@gmail.com' || user?.email === 'moincomp06@gmail.cm';

  const closeSidebar = () => setIsOpen(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Track My Order', path: 'https://thermsouq.shiprocket.co', icon: Truck, isExternal: true },
    { name: 'About The RM Souq', path: '/about', icon: Info },
    { name: 'Contact Us', path: '/contact', icon: Phone },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 hover:bg-brand-green-800 rounded-lg transition-colors text-brand-sand-50"
        aria-label="Open Menu"
      >
        <Menu size={28} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-brand-green-900 border-r border-brand-green-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-green-800">
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-wide text-brand-gold-400">The RM Souq</span>
            <span className="text-[10px] tracking-widest uppercase opacity-80 text-brand-sand-100">Sunnah & Halal</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-2 bg-brand-green-800 hover:bg-brand-green-700 text-brand-sand-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col py-6 overflow-y-auto flex-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            if (link.isExternal) {
              return (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeSidebar}
                  className="flex items-center gap-4 px-8 py-4 transition-colors font-medium text-brand-sand-100 hover:bg-brand-green-800 hover:text-brand-sand-50"
                >
                  <Icon size={20} className="opacity-70" />
                  {link.name}
                </a>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-8 py-4 transition-colors font-medium ${
                  isActive 
                    ? 'bg-brand-green-800 text-brand-gold-400 border-r-4 border-brand-gold-400' 
                    : 'text-brand-sand-100 hover:bg-brand-green-800 hover:text-brand-sand-50'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-brand-gold-400' : 'opacity-70'} />
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-6 border-t border-brand-green-800 mx-6"></div>
              <Link
                to="/admin"
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-8 py-4 transition-colors font-medium ${
                  location.pathname === '/admin' 
                    ? 'bg-brand-green-800 text-brand-gold-400 border-r-4 border-brand-gold-400' 
                    : 'text-brand-gold-300 hover:bg-brand-green-800 hover:text-brand-gold-400'
                }`}
              >
                <LayoutDashboard size={20} />
                Admin Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
