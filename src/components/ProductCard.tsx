import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Zap, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { cn } from '../lib/utils';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(product.id);

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 15;
  const originalPrice = product.oldPrice || (product.price / (1 - discount / 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative"
    >
      {/* Wishlist Button */}
      <button 
        onClick={() => toggleWishlist(product)}
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg transition-all duration-300",
          isWishlisted ? "bg-primary text-white" : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-primary"
        )}
      >
        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center space-x-1 shadow-lg">
              <Zap className="w-3 h-3 fill-current" />
              <span className="uppercase">Offered Item</span>
            </div>
          )}
          {product.stock < 20 && (
            <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center space-x-1 shadow-lg">
              <TrendingUp className="w-3 h-3" />
              <span className="uppercase">Best Selling</span>
            </div>
          )}
        </div>

        {/* Save Badge */}
        <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
          Save {discount}%
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 text-center">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black text-primary">৳{product.price.toFixed(0)}</span>
            <span className="text-xs text-gray-400 line-through">৳{originalPrice.toFixed(0)}</span>
          </div>
          <div className="mt-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            Save ৳{(originalPrice - product.price).toFixed(0)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex items-center justify-center space-x-1 px-2 py-2.5 bg-white border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add To Cart</span>
          </button>
          <button
            onClick={() => {
              addToCart(product);
              navigate('/checkout');
            }}
            className="flex items-center justify-center space-x-1 px-2 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
