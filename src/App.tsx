import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Category } from './types';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider } from './CartContext';
import { SettingsProvider, useSettings } from './SettingsContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ShoppingBag, ArrowRight, Sparkles, ShieldCheck, Truck, AlertCircle, ChevronLeft, ChevronRight, Facebook, Instagram, Youtube, Twitter, MapPin, Package, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminCategories } from './pages/admin/AdminCategories';

// Public Pages
import { CategoryPage } from './pages/CategoryPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProductPage } from './pages/ProductPage';
import { StaticPage } from './pages/StaticPage';
import { CheckoutPage } from './pages/CheckoutPage';

const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: "Sundarban Honey 1kg",
    description: "100% natural, raw honey collected directly from the Sundarbans forest. Boosts immunity, rich in antioxidants, and effective for cough and sore throat.",
    price: 2200,
    oldPrice: 2500,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
      "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80"
    ],
    category: "Honey",
    stock: 50,
    featured: true,
    benefits: ["Boosts immunity", "Rich in antioxidants", "Natural source of energy", "Beneficial for skin and hair"],
    origin: "Sundarban (Bangladesh)",
    brand: "Honeyraj",
    rating: 4.8,
    reviewCount: 12
  },
  {
    name: "Deshi Mustard Oil 5 liter",
    description: "Cold-pressed mustard oil, perfect for traditional cooking. Extracted from high-quality mustard seeds.",
    price: 1550,
    oldPrice: 1800,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    category: "Oil",
    stock: 15,
    featured: true,
    benefits: ["Pure and natural", "No chemicals", "Rich aroma"],
    origin: "Bangladesh",
    brand: "PureNature"
  },
  {
    name: "Gawa Ghee 1kg",
    description: "Traditional grass-fed cow ghee, hand-churned. Rich in flavor and aroma.",
    price: 1700,
    oldPrice: 2000,
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80",
    category: "Ghee",
    stock: 30,
    featured: true,
    benefits: ["Hand-churned", "Grass-fed", "Rich in vitamins"],
    origin: "Bangladesh",
    brand: "Shosti"
  },
  {
    name: "Lachcha Semai 1kg",
    description: "Premium quality lachcha semai for your festive desserts.",
    price: 1300,
    oldPrice: 1500,
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80",
    category: "Dessert",
    stock: 100,
    featured: true
  },
  {
    name: "Black Seed Honey 1kg",
    description: "Natural honey infused with black seed extracts.",
    price: 1440,
    oldPrice: 1600,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    category: "Honey",
    stock: 45
  },
  {
    name: "Crystal Honey 1kg",
    description: "Pure crystal honey with a rich texture.",
    price: 1000,
    oldPrice: 1200,
    image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80",
    category: "Honey",
    stock: 60
  }
];

// Static Content
const ABOUT_US = (
  <div className="space-y-6">
    <p>PureNature is an e-commerce platform dedicated to providing safe and reliable food to every home. We believe that everyone deserves access to high-quality, natural products that promote a healthy lifestyle.</p>
    <p>Our journey started with a simple mission: to bridge the gap between nature and your kitchen. We work directly with farmers and producers to ensure that every item we sell meets our strict quality standards.</p>
    <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
    <p>To become the most trusted brand for organic and natural products in Bangladesh, known for our integrity, quality, and customer-centric approach.</p>
  </div>
);

const PRIVACY_POLICY = (
  <div className="space-y-6">
    <p>At PureNature, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
    <h3 className="text-xl font-bold text-gray-900">Information Collection</h3>
    <p>We collect information when you register on our site, place an order, or subscribe to our newsletter. This may include your name, email address, phone number, and shipping address.</p>
    <h3 className="text-xl font-bold text-gray-900">Data Usage</h3>
    <p>The information we collect is used to process transactions, improve our website, and send periodic emails regarding your order or other products and services.</p>
  </div>
);

const TERMS_CONDITIONS = (
  <div className="space-y-6">
    <p>By accessing this website, you agree to be bound by these terms and conditions. Please read them carefully.</p>
    <h3 className="text-xl font-bold text-gray-900">Use of Website</h3>
    <p>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</p>
    <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
    <p>We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.</p>
  </div>
);

const RETURN_POLICY = (
  <div className="space-y-6">
    <p>We want you to be completely satisfied with your purchase. If you are not happy with a product, you may return it within 7 days of delivery.</p>
    <h3 className="text-xl font-bold text-gray-900">Conditions for Return</h3>
    <p>1. The product must be unused and in the same condition as received.<br />2. The product must be in its original packaging.<br />3. Proof of purchase is required.</p>
  </div>
);

const REFUND_POLICY = (
  <div className="space-y-6">
    <p>Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.</p>
    <p>If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within a certain amount of days.</p>
  </div>
);

const SHIPPING_POLICY = (
  <div className="space-y-6">
    <p>We offer fast and reliable shipping across Bangladesh.</p>
    <h3 className="text-xl font-bold text-gray-900">Delivery Times</h3>
    <p>Inside Dhaka: 1-3 business days<br />Outside Dhaka: 3-5 business days</p>
    <h3 className="text-xl font-bold text-gray-900">Shipping Costs</h3>
    <p>Shipping costs are calculated based on the weight of your order and your location. You will see the final shipping cost at checkout.</p>
  </div>
);

const FAQ = (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900">How do I place an order?</h3>
    <p>Simply browse our products, add them to your cart, and proceed to checkout. You can also order via WhatsApp or phone.</p>
    <h3 className="text-xl font-bold text-gray-900">What payment methods do you accept?</h3>
    <p>We accept Cash on Delivery, bKash, Nagad, and major credit/debit cards.</p>
    <h3 className="text-xl font-bold text-gray-900">Can I track my order?</h3>
    <p>Yes, you can track your order using your Order ID on our Track Order page.</p>
  </div>
);

const CONTACT_US = (
  <div className="space-y-6">
    <p>We'd love to hear from you! Whether you have a question about our products, an order, or anything else, our team is ready to help.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
        <p className="flex items-center space-x-3 text-gray-600">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Rampura, Dhaka, Bangladesh</span>
        </p>
        <p className="flex items-center space-x-3 text-gray-600">
          <Phone className="w-5 h-5 text-primary" />
          <span>01234567890</span>
        </p>
        <p className="flex items-center space-x-3 text-gray-600">
          <Mail className="w-5 h-5 text-primary" />
          <span>support@purenature.com</span>
        </p>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
        <p className="text-gray-600">Saturday - Thursday: 10:00 AM - 8:00 PM</p>
        <p className="text-gray-600">Friday: Closed</p>
      </div>
    </div>
  </div>
);

const CANCELLATION = (
  <div className="space-y-6">
    <p>You can cancel your order at any time before it has been shipped. Once the order is shipped, the cancellation policy will no longer apply, and you will need to follow our return policy.</p>
    <h3 className="text-xl font-bold text-gray-900">How to Cancel</h3>
    <p>To cancel your order, please contact our customer support team as soon as possible with your Order ID.</p>
  </div>
);

const EXTRA_DISCOUNT = (
  <div className="space-y-6">
    <p>We offer various ways to save on your favorite organic products!</p>
    <h3 className="text-xl font-bold text-gray-900">Bulk Orders</h3>
    <p>Get extra discounts when you order in bulk. Contact us for wholesale pricing.</p>
    <h3 className="text-xl font-bold text-gray-900">Seasonal Offers</h3>
    <p>Keep an eye on our website and social media for seasonal promotions and coupon codes.</p>
  </div>
);

const BRANDS = [
  { id: '1', name: 'Ghorer Bazar', logo: 'https://ghorerbajar.com/wp-content/uploads/2022/10/Ghorer-Bajar-Logo.png' },
  { id: '2', name: 'Glarvest', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Glarvest-Logo.png' },
  { id: '3', name: 'Khejuri', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Khejuri-Logo.png' },
  { id: '4', name: 'Shosti', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Shosti-Logo.png' },
];

const TESTIMONIALS = [
  {
    name: "Sultana Yesmin",
    role: "Housewife",
    content: "Thanks Ghorerbazar for free Honeyraj. Of course, I got it for being a regular customer.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sultana"
  },
  {
    name: "Ayesha Khan",
    role: "Banker",
    content: "২য় বার Ghorerbazar থেকে অর্ডার করলাম। আগের মতো এবারও দারুণ কোয়ালিটি আর দ্রুত ডেলিভারি পেয়েছি। একদম সন্তুষ্ট!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha"
  },
  {
    name: "Fariha Akter Tumpa",
    role: "Entrepreneur",
    content: "এই অবিশ্বাসের জগতে আস্থাশীল একটি প্রতিষ্ঠান ঘরের বাজার।",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fariha"
  }
];

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')))
        ]);

        if (productsSnap.empty) {
          const seededProducts: Product[] = [];
          for (const p of INITIAL_PRODUCTS) {
            const docRef = await addDoc(collection(db, 'products'), p);
            seededProducts.push({ ...p, id: docRef.id });
          }
          setProducts(seededProducts);
        } else {
          setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
        }

        setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please check your connection or try again later.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'products');
        } catch (e) {
          // Error is already logged by handleFirestoreError
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const slides = settings?.slides && settings.slides.length > 0 ? settings.slides : [
    {
      image: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=1200&q=80",
      title: "বড় বাজারে বড় উপহার!",
      subtitle: "আপনার প্রিয় পণ্য কিনুন আর জিতে নিন আকর্ষণীয় সব উপহার!"
    },
    {
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&q=80",
      title: "১০০% খাঁটি সুন্দরবনের মধু",
      subtitle: "প্রকৃতির সেরা উপহার এখন আপনার হাতের নাগালে।"
    }
  ];

  const brands = settings?.brands && settings.brands.length > 0 ? settings.brands : BRANDS;

  return (
    <div className="min-h-screen bg-[#f8f9fa] selection:bg-primary/10 selection:text-primary">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main>
        {/* Hero Section - Carousel Style */}
        <section className="bg-white py-4 md:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Slider */}
              <div className="lg:col-span-8 relative group">
                <div className="relative aspect-[21/9] md:aspect-[21/7] rounded-2xl overflow-hidden shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  
                  {/* Slide Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent flex items-center px-8 md:px-16">
                    <motion.div
                      key={currentSlide + 'content'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="max-w-md text-white"
                    >
                      <h2 className="text-2xl md:text-4xl font-black mb-2 drop-shadow-md">{slides[currentSlide].title}</h2>
                      <p className="text-sm md:text-lg font-bold drop-shadow-md opacity-90">{slides[currentSlide].subtitle}</p>
                    </motion.div>
                  </div>

                  {/* Controls */}
                  <button 
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button 
                    onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentSlide === i ? "bg-secondary w-6" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Banner */}
              <div className="hidden lg:col-span-4 lg:flex flex-col gap-4">
                <div className="flex-1 rounded-2xl overflow-hidden shadow-sm relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80" 
                    alt="Side Banner 1" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest bg-secondary text-primary px-2 py-1 rounded w-fit mb-2">New Arrival</span>
                    <h3 className="text-xl font-black">Premium Ghee</h3>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden shadow-sm relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&q=80" 
                    alt="Side Banner 2" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest bg-orange-500 text-white px-2 py-1 rounded w-fit mb-2">Best Seller</span>
                    <h3 className="text-xl font-black">Medjool Dates</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-widest">Featured Categories</h2>
            <div className="flex items-center justify-center flex-wrap gap-8 md:gap-12">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.name.toLowerCase()}`} className="group flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-300 border border-gray-100">
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Top Selling Products */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Top Selling Products</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mt-4 rounded-full" />
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-500 max-w-md mb-8">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-white font-bold rounded-xl">Try Again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {products.filter(p => p.featured).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Our Brands */}
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-widest">Our Brands</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brands.map((brand) => (
                <div key={brand.id || brand.name} className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <img src={brand.logo} alt={brand.name} className="h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Just For You Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Just For You</h2>
            <Link to="/products" className="text-sm font-bold text-primary hover:underline flex items-center">
              VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                >
                  <p className="text-gray-600 italic mb-6">"{t.content}"</p>
                  <div className="flex items-center space-x-4">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full bg-gray-100" />
                    <div>
                      <h4 className="font-bold text-gray-900">{t.name}</h4>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black mb-4">Join our community</h2>
                <p className="text-accent/80">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              </div>
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button className="px-8 py-4 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary/90 transition-all">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                {settings?.logo ? (
                  <img src={settings.logo} alt={settings.siteName} className="h-10 w-auto" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl font-black text-primary">{settings?.siteName || "PureNature"}</span>
                )}
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                {settings?.footerText || "Premium organic and pure products for a healthy lifestyle. We believe in quality, nature, and exceptional customer service."}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-sm">Rampura, Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-sm">01234567890</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-8">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"><Youtube className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Information</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/about-us" className="hover:text-primary transition-colors">About us</Link></li>
                <li><Link to="/contact-us" className="hover:text-primary transition-colors">Contact us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/track-order" className="hover:text-primary transition-colors">Order Tracking</Link></li>
                <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
                <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-widest">Consumer Policy</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                <li><Link to="/cancellation" className="hover:text-primary transition-colors">Cancellation</Link></li>
                <li><Link to="/extra-discount" className="hover:text-primary transition-colors">Extra Discount</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-400">Copyright © 2026 {settings?.siteName || "PureNature"} - All Rights Reserved</p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <img src="https://ghorerbajar.com/wp-content/uploads/2022/10/payment-methods.png" alt="Payment Methods" className="h-8 object-contain" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';

import { WishlistProvider } from './WishlistContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              
              {/* Static Pages */}
              <Route path="/about-us" element={<StaticPage title="About Us" content={ABOUT_US} settingsKey="aboutUs" />} />
              <Route path="/contact-us" element={<StaticPage title="Contact Us" content={CONTACT_US} settingsKey="contactUs" />} />
              <Route path="/privacy-policy" element={<StaticPage title="Privacy Policy" content={PRIVACY_POLICY} settingsKey="privacyPolicy" />} />
              <Route path="/terms-conditions" element={<StaticPage title="Terms & Conditions" content={TERMS_CONDITIONS} settingsKey="termsConditions" />} />
              <Route path="/return-policy" element={<StaticPage title="Return Policy" content={RETURN_POLICY} settingsKey="returnPolicy" />} />
              <Route path="/refund-policy" element={<StaticPage title="Refund Policy" content={REFUND_POLICY} settingsKey="refundPolicy" />} />
              <Route path="/shipping-policy" element={<StaticPage title="Shipping Policy" content={SHIPPING_POLICY} settingsKey="shippingPolicy" />} />
              <Route path="/faq" element={<StaticPage title="FAQ" content={FAQ} settingsKey="faq" />} />
              <Route path="/cancellation" element={<StaticPage title="Cancellation" content={CANCELLATION} settingsKey="cancellationPolicy" />} />
              <Route path="/extra-discount" element={<StaticPage title="Extra Discount" content={EXTRA_DISCOUNT} settingsKey="extraDiscountInfo" />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </SettingsProvider>
    </AuthProvider>
  </Router>
  );
}
