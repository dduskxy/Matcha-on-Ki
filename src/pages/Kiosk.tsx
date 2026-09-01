import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { menuData } from '../data/menuData';

const KIOSK_ITEMS = [
  menuData.find((m) => m.id === 'm1') || menuData[0], // Matcha Usucha
  menuData.find((m) => m.id === 't3') || menuData[1], // Hojicha Latte
  { ...(menuData.find((m) => m.id === 't2') || menuData[2]), name: 'Yuzu Sencha', jpName: '柚子煎茶', id: 'k-yuzu' }
];

const SCAN_MESSAGES = [
  "Calibrating sensors...",
  "Reading your aura...",
  "Analyzing energy levels...",
  "Finding your perfect match..."
];

export const Kiosk: React.FC = () => {
  const [step, setStep] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [scanMsgIdx, setScanMsgIdx] = useState(0);
  const [recommendedItem, setRecommendedItem] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);

  const handleItemClick = (item: any) => {
    addItem(item);
    setFeedback(item.name);
    setTimeout(() => setFeedback(null), 2500);
  };

  const startAnalysis = () => {
    setStep('scanning');
    setScanMsgIdx(0);
    
    // Cycle messages
    const interval = setInterval(() => {
      setScanMsgIdx(prev => (prev + 1) % SCAN_MESSAGES.length);
    }, 1000);

    // Finish scanning after 4 seconds
    setTimeout(() => {
      clearInterval(interval);
      // Pick recommendation based on a pseudo-random factor (e.g. current millisecond to feel "calculated")
      const randomItem = KIOSK_ITEMS[Date.now() % KIOSK_ITEMS.length];
      setRecommendedItem(randomItem);
      setStep('results');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans overflow-hidden relative selection:bg-rose-200 flex flex-col items-center justify-center">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-5">
        <svg viewBox="0 0 100 100" className="w-[120vw] h-[120vh] text-stone-900 fill-current">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <AnimatePresence mode="wait">
          
          {step === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-6xl font-serif text-stone-800 mb-6 tracking-wider">
                Personalized Oracle
              </h1>
              <p className="text-stone-500 uppercase tracking-widest text-sm mb-12 max-w-md">
                Allow our sensory AI to analyze your current energy and recommend the perfect brew.
              </p>
              
              <button 
                onClick={startAnalysis}
                className="relative group bg-stone-900 text-white px-12 py-6 rounded-full font-serif text-xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                <div className="absolute inset-0 bg-rose-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-rose-400">✧</span> Begin Analysis
                </span>
              </button>
            </motion.div>
          )}

          {step === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center flex flex-col items-center"
            >
              <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                {/* Scanning Rings */}
                <motion.div 
                  className="absolute inset-0 border-2 border-rose-300 rounded-full opacity-50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute inset-4 border-2 border-stone-300 rounded-full opacity-50 border-dashed"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-8 border border-stone-800 rounded-full"
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="text-4xl">👁️</div>
              </div>
              
              <h2 className="text-2xl font-serif text-stone-800 mb-4 h-8">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={scanMsgIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="block"
                  >
                    {SCAN_MESSAGES[scanMsgIdx]}
                  </motion.span>
                </AnimatePresence>
              </h2>
            </motion.div>
          )}

          {step === 'results' && recommendedItem && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-5xl flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <p className="text-rose-600 uppercase tracking-widest text-sm mb-2 font-bold flex items-center justify-center gap-2">
                  <span>✧</span> Analysis Complete <span>✧</span>
                </p>
                <h2 className="text-3xl md:text-4xl font-serif text-stone-800">
                  Your energy aligns with...
                </h2>
              </div>

              {/* Highlighted Recommendation */}
              <div className="w-full max-w-2xl mb-16">
                <motion.button
                  onClick={() => handleItemClick(recommendedItem)}
                  className="w-full bg-stone-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden group text-left focus:outline-none focus:ring-4 focus:ring-rose-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-serif pointer-events-none transition-opacity group-hover:opacity-20 text-rose-100">
                    {recommendedItem.jpName}
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 shrink-0 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center">
                      <div className="text-6xl opacity-90">
                        {recommendedItem.icon === 'matcha' ? '🍵' : recommendedItem.icon === 'coffee' ? '☕' : recommendedItem.icon === 'cold' ? '🧊' : '🍡'}
                      </div>
                    </div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-rose-900/50 text-rose-200 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                        98% Match
                      </div>
                      <h3 className="text-4xl font-serif mb-3">{recommendedItem.name}</h3>
                      <p className="text-stone-300 text-lg mb-6 leading-relaxed">{recommendedItem.description}</p>
                      <div className="text-2xl font-medium text-rose-300">¥{recommendedItem.price}</div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Other Options */}
              <div className="w-full">
                <h4 className="text-stone-400 uppercase tracking-widest text-xs mb-6 text-center border-b border-stone-200 pb-4">
                  Or explore other options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {KIOSK_ITEMS.filter(item => item.id !== recommendedItem.id).map((item, idx) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="bg-white p-6 rounded-2xl shadow-lg shadow-stone-200/40 border border-stone-100 flex flex-col items-center text-center group focus:outline-none focus:ring-4 focus:ring-rose-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (idx * 0.1) }}
                    >
                      <div className="w-16 h-16 mb-4 rounded-full bg-stone-50 flex items-center justify-center">
                        <div className="text-2xl">
                          {item.icon === 'matcha' ? '🍵' : item.icon === 'coffee' ? '☕' : item.icon === 'cold' ? '🧊' : '🍡'}
                        </div>
                      </div>
                      <h3 className="text-lg font-serif text-stone-800 mb-1">{item.name}</h3>
                      <div className="text-sm font-medium text-rose-800">¥{item.price}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setStep('idle')}
                className="mt-12 text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest text-xs"
              >
                Start Over
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Selection Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl font-serif text-lg flex items-center gap-3"
          >
            <span className="text-rose-400">✨</span> Added {feedback} to cart
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Kiosk;
