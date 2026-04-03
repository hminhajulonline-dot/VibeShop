import React from 'react';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { motion } from 'motion/react';
import { useSettings } from '../SettingsContext';

interface StaticPageProps {
  title: string;
  content?: React.ReactNode;
  settingsKey?: string;
}

export const StaticPage: React.FC<StaticPageProps> = ({ title, content, settingsKey }) => {
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const { settings } = useSettings();

  const displayContent = settingsKey && (settings as any)?.[settingsKey] 
    ? <div className="whitespace-pre-wrap">{(settings as any)[settingsKey]}</div>
    : content;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
        >
          <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">{title}</h1>
          <div className="prose prose-primary max-w-none text-gray-600 leading-relaxed">
            {displayContent}
          </div>
        </motion.div>
      </main>
    </div>
  );
};
