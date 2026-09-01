import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { audio } from '../utils/audio';

export default function LiveToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const channel = new BroadcastChannel('menu-sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_ITEMS') {
        setMessage('The collection has been elegantly refreshed');
        setShow(true);
        audio.playChime();
        setTimeout(() => setShow(false), 3000);
      }
    };
    return () => channel.close();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, mass: 1 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-black/90 text-white px-5 py-3 rounded-full shadow-2xl border border-luxury-matcha/30 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-luxury-matcha animate-pulse" />
          <span className="text-[10px] tracking-widest uppercase font-medium">{message}</span>
          <button onClick={() => setShow(false)} className="ml-2 text-white/50 hover:text-white transition-colors">
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
