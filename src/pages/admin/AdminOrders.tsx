import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { 
  Search, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  TrendingUp,
  X,
  Package,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
      
      fetchOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'processing': return <Package className="w-4 h-4 text-indigo-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'returned': return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerInfo?.phone?.includes(searchTerm);
    
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-500">Track and manage customer orders.</p>
      </div>

      {/* Tabs and Search */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              )}
            >
              {tab} ({orders.filter(o => tab === 'all' || o.status === tab).length})
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{order.customerInfo?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">{order.customerInfo?.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                        order.paymentMethod === 'cod' ? "bg-gray-100 text-gray-600" :
                        order.paymentMethod === 'bkash' ? "bg-[#D12053]/10 text-[#D12053]" :
                        order.paymentMethod === 'nagad' ? "bg-[#F7941D]/10 text-[#F7941D]" : "bg-blue-50 text-blue-600"
                      )}>
                        {order.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">৳{order.grandTotal || order.total}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                        order.status === 'pending' && "bg-orange-50 text-orange-600",
                        order.status === 'confirmed' && "bg-blue-50 text-blue-600",
                        order.status === 'processing' && "bg-indigo-50 text-indigo-600",
                        order.status === 'shipped' && "bg-purple-50 text-purple-600",
                        order.status === 'delivered' && "bg-green-50 text-green-600",
                        order.status === 'cancelled' && "bg-red-50 text-red-600",
                        order.status === 'returned' && "bg-gray-50 text-gray-600",
                      )}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
                  <p className="text-gray-500 text-sm font-bold">Order #{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                {/* Order Status Update */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedOrder, status)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          selectedOrder.status === status
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Customer Information</span>
                    </h3>
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Name</p>
                        <input
                          type="text"
                          value={selectedOrder.customerInfo?.name || ''}
                          onChange={async (e) => {
                            const newName = e.target.value;
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { 'customerInfo.name': newName });
                              setSelectedOrder({ ...selectedOrder, customerInfo: { ...selectedOrder.customerInfo, name: newName } });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating customer name:', err);
                            }
                          }}
                          className="w-full text-sm font-bold text-gray-900 bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Email</p>
                        <input
                          type="email"
                          value={selectedOrder.customerInfo?.email || ''}
                          onChange={async (e) => {
                            const newEmail = e.target.value;
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { 'customerInfo.email': newEmail });
                              setSelectedOrder({ ...selectedOrder, customerInfo: { ...selectedOrder.customerInfo, email: newEmail } });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating customer email:', err);
                            }
                          }}
                          className="w-full text-sm font-bold text-gray-900 bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Phone</p>
                        <input
                          type="text"
                          value={selectedOrder.customerInfo?.phone || ''}
                          onChange={async (e) => {
                            const newPhone = e.target.value;
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { 'customerInfo.phone': newPhone });
                              setSelectedOrder({ ...selectedOrder, customerInfo: { ...selectedOrder.customerInfo, phone: newPhone } });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating customer phone:', err);
                            }
                          }}
                          className="w-full text-sm font-bold text-gray-900 bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Address</p>
                        <textarea
                          rows={2}
                          value={selectedOrder.customerInfo?.address || ''}
                          onChange={async (e) => {
                            const newAddress = e.target.value;
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { 'customerInfo.address': newAddress });
                              setSelectedOrder({ ...selectedOrder, customerInfo: { ...selectedOrder.customerInfo, address: newAddress } });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating customer address:', err);
                            }
                          }}
                          className="w-full text-sm font-bold text-gray-900 bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">City</p>
                        <input
                          type="text"
                          value={selectedOrder.customerInfo?.city || ''}
                          onChange={async (e) => {
                            const newCity = e.target.value;
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { 'customerInfo.city': newCity });
                              setSelectedOrder({ ...selectedOrder, customerInfo: { ...selectedOrder.customerInfo, city: newCity } });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating customer city:', err);
                            }
                          }}
                          className="w-full text-sm font-bold text-gray-900 bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Summary</span>
                    </h3>
                    <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-bold">Subtotal</span>
                        <span className="font-black text-gray-900">৳{selectedOrder.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-bold">Shipping</span>
                        <span className={cn("font-black", selectedOrder.shippingCharge === 0 ? "text-green-600" : "text-gray-900")}>
                          {selectedOrder.shippingCharge === 0 ? 'Free' : `৳${selectedOrder.shippingCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500 font-bold">Method</span>
                        <select
                          value={selectedOrder.paymentMethod || 'cod'}
                          onChange={async (e) => {
                            const newMethod = e.target.value as Order['paymentMethod'];
                            try {
                              await updateDoc(doc(db, 'orders', selectedOrder.id), { paymentMethod: newMethod });
                              setSelectedOrder({ ...selectedOrder, paymentMethod: newMethod });
                              fetchOrders();
                            } catch (err) {
                              console.error('Error updating payment method:', err);
                            }
                          }}
                          className="text-xs font-black text-primary uppercase bg-primary/5 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="cod">COD</option>
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="card">Card</option>
                        </select>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-between text-lg">
                        <span className="font-black text-gray-900">Total</span>
                        <span className="font-black text-primary">৳{selectedOrder.grandTotal || selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Order Items</span>
                  </h3>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                          <th className="px-6 py-3">Product</th>
                          <th className="px-6 py-3 text-center">Qty</th>
                          <th className="px-6 py-3 text-right">Price</th>
                          <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedOrder.items.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-center">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-right">৳{item.price.toFixed(0)}</td>
                            <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">৳{(item.price * item.quantity).toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
