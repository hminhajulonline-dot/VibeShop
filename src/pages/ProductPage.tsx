import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { ProductCard } from '../components/ProductCard';
import { 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Zap, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  Share2,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);

          // Fetch related products
          const q = query(
            collection(db, 'products'),
            where('category', '==', productData.category),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          const related = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(p => p.id !== id);
          setRelatedProducts(related);

          // Fetch reviews
          const reviewsQ = query(
            collection(db, 'reviews'),
            where('productId', '==', id)
          );
          const reviewsSnapshot = await getDocs(reviewsQ);
          const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
          setReviews(reviewsList);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setIsCartOpen(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !product) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      setReviews(prev => [reviewData as Review, ...prev]);
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{error || 'Product not found'}</h2>
        <Link to="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 15;
  const oldPrice = product.oldPrice || (product.price / (1 - discount / 100));

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              <div className="absolute top-4 left-4">
                <div className="bg-primary text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
                  Save {discount}%
                </div>
              </div>

              <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                    activeImage === i ? "border-primary shadow-md" : "border-transparent hover:border-gray-200"
                  )}
                >
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-secondary">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-4 h-4 fill-current", s > (product.rating || 0) && "text-gray-200")} />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">({reviews.length} Reviews)</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-sm font-bold text-green-600">In Stock</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-primary">৳{product.price.toFixed(0)}</span>
                <span className="text-lg text-gray-400 line-through">৳{oldPrice.toFixed(0)}</span>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Save {discount}%</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex items-center justify-center space-x-2 bg-white border-2 border-primary text-primary font-black py-4 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>ADD TO CART</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCart();
                      navigate('/checkout');
                    }}
                    className="flex items-center justify-center space-x-2 bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    <span>BUY NOW</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a 
                    href={`https://wa.me/8801234567890?text=I want to order ${product.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-[#25D366] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Order On WhatsApp</span>
                  </a>
                  <a 
                    href="tel:+8801234567890"
                    className="flex items-center justify-center space-x-2 bg-[#075E54] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>Call For Order</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Brand:</span>
                  <span className="font-bold text-primary">{product.brand || 'Honeyraj'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-primary transition-colors"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: More Products */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 uppercase tracking-tight">More Products</h3>
                <div className="flex space-x-1">
                  <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-6">
                {relatedProducts.slice(0, 3).map(p => (
                  <Link key={p.id} to={`/product/${p.id}`} className="flex items-center space-x-4 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-1">{p.name}</h4>
                      <p className="text-sm font-black text-primary">৳{p.price.toFixed(0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <section className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button className="px-8 py-6 text-sm font-black text-primary border-b-2 border-primary uppercase tracking-widest">Product Details</button>
              <button className="px-8 py-6 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Reviews ({reviews.length})</button>
            </div>
          </div>
          <div className="p-8 md:p-12">
            <div className="max-w-4xl space-y-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Benefits</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start space-x-3 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Country of Origin</h3>
                <p className="text-gray-600">{product.origin || 'Bangladesh'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Review Stats */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-black text-gray-900 mb-2">{(product.rating || 0).toFixed(1)}</h2>
              <div className="flex justify-center text-secondary mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-5 h-5 fill-current", s > (product.rating || 0) && "text-gray-200")} />
                ))}
              </div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-sm font-bold text-primary mt-2">100% Recommended</p>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-xs font-bold text-gray-600">{rating}</span>
                    <Star className="w-3 h-3 text-gray-300 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary" 
                      style={{ width: `${reviews.length ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0}%` }} 
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {reviews.length ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Review */}
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Submit Your Review</h3>
            
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Your Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          s <= reviewRating ? "bg-secondary text-primary shadow-md scale-110" : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                        )}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Your Opinion</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 max-w-xs">Your email address will not be published. Required fields are marked *</p>
                  <button
                    disabled={submittingReview}
                    className="px-10 py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>SUBMIT REVIEW</span>}
                  </button>
                </div>

                {reviewSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Review submitted successfully!</span>
                  </motion.div>
                )}
              </form>
            ) : (
              <div className="bg-gray-50 p-12 rounded-3xl text-center border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4 font-medium">Please sign in to leave a review</p>
                <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl">Sign In Now</button>
              </div>
            )}

            {/* Reviews List */}
            <div className="mt-12 space-y-8">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm border-b border-gray-100 pb-4">Recent Reviews</h4>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-primary">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-gray-900">{review.userName}</h5>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-secondary">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-3 h-3 fill-current", s > review.rating && "text-gray-200")} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      <button className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-400 italic">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Related Products</h2>
            <Link to={`/category/${product.category.toLowerCase()}`} className="text-sm font-bold text-primary hover:underline flex items-center">
              MORE PRODUCTS <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
