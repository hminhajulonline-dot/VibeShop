import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Product } from '../../types';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10))),
          getDocs(collection(db, 'products'))
        ]);

        setOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'returned').reduce((sum, order) => sum + (order.grandTotal || order.total), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const outOfStockProducts = products.filter(p => p.stock <= 0).length;

  const stats = [
    { label: 'Total Revenue', value: `৳${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Delivered', value: deliveredOrders.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending', value: pendingOrders.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Out of Stock', value: outOfStockProducts.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-2xl border border-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl transition-colors group-hover:scale-110 duration-300", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">Recent Orders</h2>
          <button className="text-sm font-bold text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.id.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.userId.slice(-6)}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                      order.status === 'pending' && "bg-orange-50 text-orange-600",
                      order.status === 'processing' && "bg-blue-50 text-blue-600",
                      order.status === 'shipped' && "bg-primary/10 text-primary",
                      order.status === 'delivered' && "bg-green-50 text-green-600",
                      order.status === 'cancelled' && "bg-red-50 text-red-600",
                    )}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
