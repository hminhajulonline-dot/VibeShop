import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSettings } from '../SettingsContext';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden p-12 flex-col justify-between">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full -ml-20 -mb-20 blur-3xl" />
        
        <Link to="/" className="relative z-10 flex items-center space-x-2 text-white group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Shop</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-black text-white mb-6 leading-tight">
              Welcome to <br />
              <span className="text-secondary">{settings?.siteName || "VibeShop"}</span>
            </h1>
            <p className="text-xl text-accent/80 max-w-md mb-12">
              Join our community of organic enthusiasts and get access to exclusive deals and premium products.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold text-white">Premium Quality</h4>
                <p className="text-sm text-accent/60">100% Organic & Pure</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Truck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold text-white">Fast Delivery</h4>
                <p className="text-sm text-accent/60">Across the Country</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold text-white">Secure Payment</h4>
                <p className="text-sm text-accent/60">Safe & Encrypted</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-accent/40 text-sm">
          © {new Date().getFullYear()} {settings?.siteName || "VibeShop"}. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/5 rounded-[2rem] mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Access your account and manage your orders</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-primary/20 hover:bg-gray-50 transition-all shadow-sm group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-[#f8f9fa] text-gray-400">Secure Authentication</span>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use Google for secure authentication. Your password is never shared with us, and your data is protected.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our <br />
              <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
