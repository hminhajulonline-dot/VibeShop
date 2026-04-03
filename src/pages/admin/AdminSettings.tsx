import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SiteSettings } from '../../types';
import { 
  Save, 
  Globe, 
  Layout, 
  Image as ImageIcon, 
  Share2, 
  Mail, 
  Phone, 
  Plus, 
  Trash2,
  Check,
  AlertCircle,
  Search,
  Truck,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'PureNature Organic',
  logo: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
  headerText: 'Pure & Natural Organic Food',
  footerText: 'We provide 100% organic and pure products collected directly from the source. Your health is our priority.',
  contactEmail: 'support@purenature.com',
  contactPhone: '+880 1234 567890',
  metaTitle: 'PureNature - Best Organic Food in Bangladesh',
  metaDescription: 'Shop pure honey, ghee, dates and organic spices online.',
  metaPixelId: '',
  codEnabled: true,
  codInstructions: 'Pay with cash upon delivery.',
  shippingCharge: 60,
  freeShippingThreshold: 1000,
  bkashNumber: '',
  nagadNumber: '',
  slides: [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1920&q=80',
      title: 'Pure Sundarban Honey',
      subtitle: 'Collected directly from the deep forest of Sundarbans.',
      link: '/shop'
    }
  ],
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/purenature' },
    { platform: 'Twitter', url: 'https://twitter.com/purenature' },
    { platform: 'Facebook', url: 'https://facebook.com/purenature' }
  ],
  aboutUs: 'PureNature is an e-commerce platform dedicated to providing safe and reliable food to every home. We believe that everyone deserves access to high-quality, natural products that promote a healthy lifestyle.',
  privacyPolicy: 'At PureNature, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.',
  termsConditions: 'By accessing this website, you agree to be bound by these terms and conditions. Please read them carefully.',
  returnPolicy: 'We want you to be completely satisfied with your purchase. If you are not happy with a product, you may return it within 7 days of delivery.',
  refundPolicy: 'Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.',
  shippingPolicy: 'We offer fast and reliable shipping across Bangladesh.',
  faq: 'How do I place an order? Simply browse our products, add them to your cart, and proceed to checkout.',
  contactUs: 'We\'d love to hear from you! Whether you have a question about our products, an order, or anything else, our team is ready to help.',
  cancellationPolicy: 'You can cancel your order at any time before it has been shipped.',
  extraDiscountInfo: 'We offer various ways to save on your favorite organic products!',
  brands: [
    { id: '1', name: 'Ghorer Bazar', logo: 'https://ghorerbajar.com/wp-content/uploads/2022/10/Ghorer-Bajar-Logo.png' },
    { id: '2', name: 'Glarvest', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Glarvest-Logo.png' },
    { id: '3', name: 'Khejuri', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Khejuri-Logo.png' },
    { id: '4', name: 'Shosti', logo: 'https://ghorerbajar.com/wp-content/uploads/2023/05/Shosti-Logo.png' },
  ]
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      } else {
        // Initialize with defaults if not exists
        await setDoc(docRef, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      image: '',
      title: '',
      subtitle: '',
      link: ''
    };
    setSettings({ ...settings, slides: [...settings.slides, newSlide] });
  };

  const removeSlide = (id: string) => {
    setSettings({ ...settings, slides: settings.slides.filter(s => s.id !== id) });
  };

  const updateSlide = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      slides: settings.slides.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const addBrand = () => {
    const newBrand = {
      id: Date.now().toString(),
      name: '',
      logo: ''
    };
    setSettings({ ...settings, brands: [...(settings.brands || []), newBrand] });
  };

  const removeBrand = (id: string) => {
    setSettings({ ...settings, brands: (settings.brands || []).filter(b => b.id !== id) });
  };

  const updateBrand = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      brands: (settings.brands || []).map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-20 bg-white rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white rounded-2xl border border-gray-100" />
          <div className="h-96 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Site Settings</h1>
          <p className="text-gray-500">Customize your website's appearance and metadata.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center justify-center space-x-2 px-8 py-4 font-bold rounded-2xl shadow-xl transition-all",
            saveSuccess 
              ? "bg-green-600 text-white shadow-green-200" 
              : "bg-primary text-white shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saveSuccess ? 'Saved Successfully' : saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">General Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Website Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Logo URL</label>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Header & Footer</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Header Headline</label>
                <input
                  type="text"
                  value={settings.headerText}
                  onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Footer Description</label>
                <textarea
                  rows={3}
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Payment & Shipping</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-bold text-gray-900">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-gray-500">Enable or disable COD at checkout.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, codEnabled: !settings.codEnabled })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    settings.codEnabled ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    settings.codEnabled ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">COD Instructions</label>
                <input
                  type="text"
                  value={settings.codInstructions}
                  onChange={(e) => setSettings({ ...settings, codInstructions: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Shipping Charge (৳)</label>
                  <input
                    type="number"
                    value={settings.shippingCharge}
                    onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Free Shipping Threshold (৳)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">bKash Number</label>
                  <input
                    type="text"
                    value={settings.bkashNumber || ''}
                    onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nagad Number</label>
                  <input
                    type="text"
                    value={settings.nagadNumber || ''}
                    onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SEO & Social */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">SEO & Analytics</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Meta Pixel ID (Optional)</label>
                <input
                  type="text"
                  value={settings.metaPixelId}
                  onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. 1234567890"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Social Links</h2>
            </div>

            <div className="space-y-4">
              {settings.socialLinks.map((link, index) => (
                <div key={link.platform} className="flex items-center space-x-4">
                  <span className="w-24 text-sm font-bold text-gray-500">{link.platform}</span>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...settings.socialLinks];
                      newLinks[index].url = e.target.value;
                      setSettings({ ...settings, socialLinks: newLinks });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Slides Management */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Hero Sliders</h2>
          </div>
          <button 
            onClick={addSlide}
            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {settings.slides.map((slide) => (
            <div key={slide.id} className="relative group bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <button 
                onClick={() => removeSlide(slide.id)}
                className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Slide Image URL</label>
                  <input
                    type="url"
                    value={slide.image}
                    onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Button Link</label>
                  <input
                    type="text"
                    value={slide.link}
                    onChange={(e) => updateSlide(slide.id, 'link', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {slide.image && (
                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-gray-200">
                  <img src={slide.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Static Pages Content */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Our Brands</h2>
          </div>
          <button 
            onClick={addBrand}
            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(settings.brands || []).map((brand) => (
            <div key={brand.id} className="relative group bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <button 
                onClick={() => removeBrand(brand.id)}
                className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Brand Name</label>
                  <input
                    type="text"
                    value={brand.name}
                    onChange={(e) => updateBrand(brand.id, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Logo URL</label>
                  <input
                    type="url"
                    value={brand.logo}
                    onChange={(e) => updateBrand(brand.id, 'logo', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {brand.logo && (
                <div className="mt-4 h-16 flex items-center justify-center bg-white rounded-xl border border-gray-200 p-2">
                  <img src={brand.logo} alt="Preview" className="h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Static Pages Content */}
      <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Static Pages Content</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { id: 'aboutUs', label: 'About Us' },
            { id: 'privacyPolicy', label: 'Privacy Policy' },
            { id: 'termsConditions', label: 'Terms & Conditions' },
            { id: 'returnPolicy', label: 'Return Policy' },
            { id: 'refundPolicy', label: 'Refund Policy' },
            { id: 'shippingPolicy', label: 'Shipping Policy' },
            { id: 'faq', label: 'FAQ' },
            { id: 'contactUs', label: 'Contact Us' },
            { id: 'cancellationPolicy', label: 'Cancellation Policy' },
            { id: 'extraDiscountInfo', label: 'Extra Discount Info' }
          ].map((page) => (
            <div key={page.id} className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{page.label}</label>
              <textarea
                rows={4}
                value={(settings as any)[page.id] || ''}
                onChange={(e) => setSettings({ ...settings, [page.id]: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder={`Enter ${page.label} content...`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
