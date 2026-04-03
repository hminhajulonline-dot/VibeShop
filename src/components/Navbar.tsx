import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, LayoutDashboard, Heart, Package, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { useSettings } from '../SettingsContext';
import { useData } from '../DataContext';
import { auth } from '../firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { cn } from '../lib/utils';

export const Navbar: React.FC<{ onCartOpen: () => void }> = ({ onCartOpen }) => {
  const { user, profile, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const { categories } = useData();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.siteName} className="h-12 w-auto" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex flex-col">
                <span className="text-2xl font-black text-primary leading-tight">
                  {settings?.siteName || "PureNature"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Organic Shop</span>
              </div>
            )}
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for organic honey, ghee, dates..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white px-12 py-2.5 rounded-lg text-sm transition-all outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link to="/track-order" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors">
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Track Order</span>
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-1">Profile</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-sm font-bold text-gray-900 truncate">{profile?.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 p-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 p-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>My Orders</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 p-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 p-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-1">Sign In</span>
              </button>
            )}

            <Link to="/wishlist" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Wishlist</span>
            </Link>

            <button
              onClick={onCartOpen}
              className="relative flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-primary text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-1">Cart</span>
            </button>

            <button className="flex flex-col items-center p-2 text-gray-600 hover:text-primary transition-colors">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">More</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onCartOpen}
              className="relative p-2 text-gray-700"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <div className="hidden md:block bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-10 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.name.toLowerCase()}`}
                className="text-[11px] font-bold uppercase tracking-wider hover:text-secondary transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                />
              </form>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-primary/10 text-primary font-bold rounded-xl"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-xl">
                    <img
                      src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{profile?.displayName}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 font-medium bg-red-50 rounded-xl"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  <User className="w-5 h-5" />
                  <span>Login with Google</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
