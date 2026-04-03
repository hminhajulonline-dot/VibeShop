import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Order } from '../types';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Loader2,
  User,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
      case 'shipped': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'returned': return <XCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 text-center bg-primary/5">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl mx-auto mb-4 overflow-hidden">
                  <img 
                    src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt={profile?.displayName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-xl font-black text-gray-900">{profile?.displayName}</h2>
                <p className="text-sm text-gray-500 font-medium">{profile?.email}</p>
              </div>
              
              <div className="p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={cn(
                    "w-full flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all",
                    activeTab === 'orders' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "w-full flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all",
                    activeTab === 'profile' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-4 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Account Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-primary">{orders.length}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Total Orders</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Delivered</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {activeTab === 'orders' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">My Orders</h2>
                  <div className="text-sm text-gray-500 font-bold">Showing {orders.length} orders</div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                      You haven't placed any orders yet. Start shopping to see your orders here!
                    </p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                      >
                        <div className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                                <Package className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{order.id.slice(-8)}</p>
                                <p className="text-sm font-black text-gray-900">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={cn(
                                "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                order.status === 'delivered' ? "bg-green-50 text-green-600" :
                                order.status === 'cancelled' ? "bg-red-50 text-red-600" :
                                "bg-primary/5 text-primary"
                              )}>
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                              </span>
                              <Link 
                                to={`/track-order?id=${order.id}`}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Link>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Items</p>
                              <p className="text-sm font-bold text-gray-900">{order.items.length} Products</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Amount</p>
                              <p className="text-sm font-black text-primary">৳{order.grandTotal || order.total}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Payment</p>
                              <p className="text-sm font-bold text-gray-900 uppercase">{order.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Shipping</p>
                              <p className="text-sm font-bold text-gray-900 truncate">{order.customerInfo.city}</p>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex -space-x-2 overflow-hidden">
                              {order.items.slice(0, 3).map((item, i) => (
                                <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                  {item.name.charAt(0)}
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <Link 
                              to={`/track-order?id=${order.id}`}
                              className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{profile?.displayName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{profile?.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{profile?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Default Address</label>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="font-bold text-gray-900">{profile?.address || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-50">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start space-x-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">Account Verified</h4>
                        <p className="text-sm text-blue-700 mt-1">Your account is secured with Google Authentication. You can manage your profile details during checkout.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
