import React, { useState } from 'react';
import { useWishlist } from '../WishlistContext';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistPage: React.FC = () => {
  const { wishlist } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">My Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-2 font-medium">You have {wishlist.length} items in your wishlist</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-primary bg-primary/5 px-4 py-2 rounded-xl">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-bold">Saved Items</span>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg">
              Save your favorite organic products to your wishlist and they'll appear here for easy access.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
            >
              <ShoppingBag className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
