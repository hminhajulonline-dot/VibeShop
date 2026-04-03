import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const docRef = doc(db, 'orders', orderId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Failed to track order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'returned': return -1;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-primary transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">Track Order</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-500">Enter your Order ID to see the current status of your delivery.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-12">
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., #123456)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-14 pr-32 py-5 bg-white border-none rounded-[2rem] shadow-xl shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold"
            />
            <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center space-x-4 text-red-600"
            >
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="font-bold">{error}</p>
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Status Tracker */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                    <h2 className="text-2xl font-black text-gray-900 capitalize">{order.status}</h2>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    order.status === 'pending' && "bg-orange-50 text-orange-500",
                    order.status === 'confirmed' && "bg-blue-50 text-blue-500",
                    order.status === 'processing' && "bg-indigo-50 text-indigo-500",
                    order.status === 'shipped' && "bg-purple-50 text-purple-500",
                    order.status === 'delivered' && "bg-green-50 text-green-500",
                    order.status === 'cancelled' && "bg-red-50 text-red-500",
                    order.status === 'returned' && "bg-gray-50 text-gray-500",
                  )}>
                    {order.status === 'pending' && <Clock className="w-6 h-6" />}
                    {order.status === 'confirmed' && <CheckCircle2 className="w-6 h-6" />}
                    {order.status === 'processing' && <Package className="w-6 h-6" />}
                    {order.status === 'shipped' && <Truck className="w-6 h-6" />}
                    {order.status === 'delivered' && <CheckCircle2 className="w-6 h-6" />}
                    {(order.status === 'cancelled' || order.status === 'returned') && <XCircle className="w-6 h-6" />}
                  </div>
                </div>

                {order.status !== 'cancelled' && order.status !== 'returned' && (
                  <div className="relative flex justify-between">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(getStatusStep(order.status) - 1) * 25}%` }}
                      />
                    </div>

                    {[
                      { label: 'Pending', icon: Clock, step: 1 },
                      { label: 'Confirmed', icon: CheckCircle2, step: 2 },
                      { label: 'Processing', icon: Package, step: 3 },
                      { label: 'Shipped', icon: Truck, step: 4 },
                      { label: 'Delivered', icon: CheckCircle2, step: 5 },
                    ].map((step) => {
                      const isActive = getStatusStep(order.status) >= step.step;
                      return (
                        <div key={step.step} className="relative z-10 flex flex-col items-center">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-white text-gray-300 border-2 border-gray-100"
                          )}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <span className={cn(
                            "mt-3 text-[10px] font-black uppercase tracking-widest",
                            isActive ? "text-primary" : "text-gray-400"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Order Summary</h3>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">
                          {item.quantity}x
                        </div>
                        <span className="font-bold text-gray-900">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-900">৳{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold">Subtotal</span>
                      <span className="font-bold text-gray-900">৳{order.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold">Shipping</span>
                      <span className={cn("font-bold", order.shippingCharge === 0 ? "text-green-600" : "text-gray-900")}>
                        {order.shippingCharge === 0 ? 'Free' : `৳${order.shippingCharge}`}
                      </span>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900">Total Amount</span>
                      <span className="text-2xl font-black text-primary">৳{order.grandTotal || order.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
