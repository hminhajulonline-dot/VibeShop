import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import { ChevronRight, Home, AlertCircle } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'), 
          where('category', '==', categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1).toLowerCase())
        );
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-primary transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">{categoryName}</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 capitalize mb-2">{categoryName}</h1>
          <p className="text-gray-500">Explore our premium selection of {categoryName}.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <AlertCircle className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-md mb-8">We couldn't find any products in this category yet. Check back soon!</p>
            <Link to="/" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
