import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Phone, User, Mail, CreditCard, CheckCircle2, Loader2, Truck, Wallet, Smartphone } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useSettings } from '../SettingsContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Coupon, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    billingAddress: '',
  });

  const shippingCharge = (settings?.freeShippingThreshold && totalPrice >= settings.freeShippingThreshold) 
    ? 0 
    : (settings?.shippingCharge || 0);
  
  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (totalPrice * appliedCoupon.value / 100) : appliedCoupon.value)
    : 0;
    
  const grandTotal = totalPrice + shippingCharge - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setCouponError('Invalid or inactive coupon code.');
        setAppliedCoupon(null);
      } else {
        const coupon = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Coupon;
        
        // Check min purchase
        if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
          setCouponError(`Minimum purchase of ৳${coupon.minPurchase} required.`);
          setAppliedCoupon(null);
          return;
        }
        
        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          setCouponError('This coupon has expired.');
          setAppliedCoupon(null);
          return;
        }
        
        setAppliedCoupon(coupon);
        setCouponError(null);
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError('Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest',
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: totalPrice,
        shippingCharge,
        grandTotal,
        paymentMethod,
        status: 'pending',
        customerInfo: {
          ...formData,
          billingAddress: formData.billingAddress || formData.address
        },
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Error placing order:', err);
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            {success ? (
              <div className="p-12 text-center w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-6">Thank you for your order. We will contact you soon for confirmation.</p>
                
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 inline-block w-full max-w-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Order ID</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-lg font-black text-primary">#{orderId?.slice(-8).toUpperCase() || 'PENDING'}</code>
                    <button 
                      onClick={() => {
                        if (orderId) navigator.clipboard.writeText(orderId);
                      }}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-primary"
                      title="Copy ID"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Use this ID to track your order status</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={onClose}
                    className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
                  >
                    Continue Shopping
                  </button>
                  <Link 
                    to="/track-order" 
                    onClick={onClose}
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Left Side: Order Summary */}
                <div className="w-full md:w-5/12 bg-gray-50 p-8 border-r border-gray-100 overflow-y-auto">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary" /> Order Summary
                  </h3>
                  <div className="space-y-4 mb-8">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.quantity} x ৳{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-gray-200 space-y-4">
                    {/* Coupon Section */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coupon Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="ENTER CODE"
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="px-4 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                          {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                          <span className="text-[10px] text-green-600 font-black uppercase">Coupon Applied: {appliedCoupon.code}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode('');
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Subtotal</span>
                        <span className="font-bold text-gray-900">৳{totalPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold">Shipping</span>
                        <span className={cn("font-bold", shippingCharge === 0 ? "text-green-600" : "text-gray-900")}>
                          {shippingCharge === 0 ? 'FREE' : `৳${shippingCharge}`}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-bold">Discount</span>
                          <span className="font-bold text-green-600">-৳{discount.toFixed(0)}</span>
                        </div>
                      )}
                      {settings?.freeShippingThreshold && totalPrice < settings.freeShippingThreshold && (
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                          Add ৳{settings.freeShippingThreshold - totalPrice} more for FREE shipping
                        </p>
                      )}
                      <div className="flex justify-between items-center text-xl pt-4 border-t border-gray-200">
                        <span className="font-black text-gray-900">Total</span>
                        <span className="font-black text-primary">৳{grandTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Method</h4>
                    <div className="space-y-2">
                      {settings?.codEnabled && (
                        <button
                          onClick={() => setPaymentMethod('cod')}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                            paymentMethod === 'cod' ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Wallet className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-bold">Cash on Delivery</span>
                          </div>
                          {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </button>
                      )}
                      {settings?.bkashNumber && (
                        <button
                          onClick={() => setPaymentMethod('bkash')}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                            paymentMethod === 'bkash' ? "border-[#D12053] bg-[#D12053]/5" : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-[#D12053]" />
                            <span className="text-sm font-bold">bKash Payment</span>
                          </div>
                          {paymentMethod === 'bkash' && <CheckCircle2 className="w-4 h-4 text-[#D12053]" />}
                        </button>
                      )}
                      {settings?.nagadNumber && (
                        <button
                          onClick={() => setPaymentMethod('nagad')}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                            paymentMethod === 'nagad' ? "border-[#F7941D] bg-[#F7941D]/5" : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-[#F7941D]" />
                            <span className="text-sm font-bold">Nagad Payment</span>
                          </div>
                          {paymentMethod === 'nagad' && <CheckCircle2 className="w-4 h-4 text-[#F7941D]" />}
                        </button>
                      )}
                    </div>
                    {paymentMethod !== 'cod' && (
                      <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 font-bold leading-relaxed">
                        Please send the total amount to <span className="text-gray-900">{paymentMethod === 'bkash' ? settings?.bkashNumber : settings?.nagadNumber}</span> and provide your phone number below. We will verify and confirm your order.
                      </div>
                    )}
                    {paymentMethod === 'cod' && settings?.codInstructions && (
                      <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 font-bold leading-relaxed">
                        {settings.codInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-7/12 p-8 overflow-y-auto">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" /> Shipping Details
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            required
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="017xxxxxxxx"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Address</label>
                      <textarea
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        placeholder="Street address, Apartment, Suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">City</label>
                        <input
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="Dhaka"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Zip Code</label>
                        <input
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="1212"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center space-x-2 text-[10px] text-green-600 font-bold bg-green-50 p-3 rounded-xl mb-6">
                        <Truck className="w-4 h-4" />
                        <span>Estimated delivery within 2-3 business days</span>
                      </div>

                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>PLACE ORDER - ৳{grandTotal}</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
