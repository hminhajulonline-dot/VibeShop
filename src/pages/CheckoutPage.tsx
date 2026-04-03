import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Phone, User, Mail, CreditCard, CheckCircle2, Loader2, Truck, Wallet, Smartphone, ArrowLeft, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useSettings } from '../SettingsContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Coupon, Order } from '../types';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    billingAddress: '',
  });

  useEffect(() => {
    if (items.length === 0 && !success) {
      navigate('/');
    }
  }, [items, success, navigate]);

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
        
        if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
          setCouponError(`Minimum purchase of ৳${coupon.minPurchase} required.`);
          setAppliedCoupon(null);
          return;
        }
        
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onCartOpen={() => setIsCartOpen(true)} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-8">Thank you for your order. We will contact you soon for confirmation.</p>
          
          <div className="bg-white p-8 rounded-3xl mb-10 border border-gray-100 shadow-sm inline-block w-full max-w-md">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Order ID</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-black text-primary">#{orderId?.slice(-8).toUpperCase() || 'PENDING'}</code>
              <button 
                onClick={() => {
                  if (orderId) navigator.clipboard.writeText(orderId);
                }}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-primary"
              >
                <CreditCard className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Use this ID to track your order status</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              Continue Shopping
            </Link>
            <Link 
              to="/track-order" 
              className="px-10 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Form */}
          <div className="lg:col-span-7 space-y-8">
            {!user && (
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Already have an account?</h4>
                    <p className="text-sm text-gray-500">Sign in to track your orders and checkout faster.</p>
                  </div>
                </div>
                <Link 
                  to="/login" 
                  state={{ from: { pathname: '/checkout' } }}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Sign In
                </Link>
              </div>
            )}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" /> Shipping Details
              </h3>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="017xxxxxxxx"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Address</label>
                  <textarea
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Street address, Apartment, Suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">City</label>
                    <input
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Zip Code</label>
                    <input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="1212"
                    />
                  </div>
                </div>
              </form>
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" /> Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {settings?.codEnabled && (
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                      paymentMethod === 'cod' ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <Wallet className={cn("w-8 h-8", paymentMethod === 'cod' ? "text-primary" : "text-gray-400")} />
                    <span className="text-sm font-bold">Cash on Delivery</span>
                  </button>
                )}
                {settings?.bkashNumber && (
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                      paymentMethod === 'bkash' ? "border-[#D12053] bg-[#D12053]/5" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <Smartphone className={cn("w-8 h-8", paymentMethod === 'bkash' ? "text-[#D12053]" : "text-gray-400")} />
                    <span className="text-sm font-bold">bKash</span>
                  </button>
                )}
                {settings?.nagadNumber && (
                  <button
                    onClick={() => setPaymentMethod('nagad')}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                      paymentMethod === 'nagad' ? "border-[#F7941D] bg-[#F7941D]/5" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <Smartphone className={cn("w-8 h-8", paymentMethod === 'nagad' ? "text-[#F7941D]" : "text-gray-400")} />
                    <span className="text-sm font-bold">Nagad</span>
                  </button>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {paymentMethod === 'cod' ? (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {settings?.codInstructions || 'Pay with cash upon delivery.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Please send the total amount to <span className="font-black text-gray-900">{paymentMethod === 'bkash' ? settings?.bkashNumber : settings?.nagadNumber}</span> using the "Send Money" option.
                    </p>
                    <p className="text-xs text-primary font-bold">
                      * We will verify the payment before processing your order.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-primary" /> Order Summary
              </h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 font-bold">{item.quantity} x ৳{item.price}</p>
                    </div>
                    <div className="text-sm font-black text-gray-900">
                      ৳{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                {/* Coupon Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-bold ml-1">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                      <span className="text-[10px] text-green-600 font-black uppercase">Applied: {appliedCoupon.code}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold">Subtotal</span>
                    <span className="font-bold text-gray-900">৳{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold">Shipping</span>
                    <span className={cn("font-bold", shippingCharge === 0 ? "text-green-600" : "text-gray-900")}>
                      {shippingCharge === 0 ? 'FREE' : `৳${shippingCharge}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600 font-bold">Discount</span>
                      <span className="font-bold text-green-600">-৳{discount.toFixed(0)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-black text-gray-900">Grand Total</span>
                      <span className="text-2xl font-black text-primary">৳{grandTotal.toFixed(0)}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-green-600 font-bold bg-green-50 p-3 rounded-xl mb-6">
                      <ShieldCheck className="w-4 h-4" />
                      <span>100% Safe and Secure Payment</span>
                    </div>

                    <button
                      form="checkout-form"
                      disabled={loading || items.length === 0}
                      type="submit"
                      className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          CONFIRM ORDER
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
