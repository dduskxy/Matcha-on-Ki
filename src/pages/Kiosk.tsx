import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { menuData } from '../data/menuData';

const KIOSK_ITEMS = [
  menuData.find((m) => m.id === 'm1') || menuData[0], // Matcha Usucha
  menuData.find((m) => m.id === 't3') || menuData[1], // Hojicha Latte
  { ...(menuData.find((m) => m.id === 't2') || menuData[2]), name: 'Yuzu Sencha', jpName: '柚子煎茶', id: 'k-yuzu' }
];

export const Kiosk: React.FC = () => {
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);

  const handleItemClick = (item: any) => {
    addItem(item);
    setFeedback(item.name);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans overflow-hidden relative selection:bg-rose-200">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-5">
        <svg viewBox="0 0 100 100" className="w-[120vw] h-[120vh] text-stone-900 fill-current">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-16 mt-20">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-800 mb-4 tracking-wider">
            Gestural Ordering
          </h1>
          <p className="text-stone-500 uppercase tracking-widest text-sm">
            Hover over an item to add to cart
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {KIOSK_ITEMS.map((item, idx) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group w-full text-left focus:outline-none focus:ring-4 focus:ring-rose-200"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.8, ease: 'easeOut' }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-serif pointer-events-none transition-opacity group-hover:opacity-20">
                {item.jpName}
              </div>
              <div className="w-24 h-24 mb-6 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 transition-transform duration-500 group-hover:scale-110">
                <div className="text-4xl opacity-80">
                  {item.icon === 'matcha' ? '🍵' : item.icon === 'coffee' ? '☕' : item.icon === 'cold' ? '🧊' : '🍡'}
                </div>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-2">{item.name}</h3>
              <p className="text-stone-500 text-sm mb-6 flex-grow">{item.description}</p>
              <div className="text-lg font-medium text-rose-800">¥{item.price}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selection Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl font-serif text-lg flex items-center gap-3"
          >
            <span className="text-rose-400">✨</span> Added {feedback} to cart
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Kiosk;
