import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCheckout = () => {
    if (!user) {
      setCheckoutMessage({ type: 'error', text: 'Please login to checkout' });
      return;
    }
    if (items.length === 0) return;
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Your Shopping Cart</h2>
                  <p className="text-xs text-gray-500 font-bold">{items.length} items selected</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl text-sm font-bold flex items-center space-x-2",
                    checkoutMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{checkoutMessage.text}</span>
                </motion.div>
              )}

              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-200" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map(item => (
                    <div key={item.id} className="flex space-x-4 group">
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">{item.category}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-primary rounded-md transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-primary rounded-md transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-base font-black text-primary">৳{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-primary">৳{totalPrice.toFixed(0)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-lg mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safe and Secure Checkout</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center space-x-4 opacity-50 grayscale">
                  <img src="https://ghorerbajar.com/wp-content/uploads/2022/10/payment-methods.png" alt="Payments" className="h-6 object-contain" />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
