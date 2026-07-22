import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const { items, isCartOpen, toggleCart, updateQuantity, removeItem } = useCartStore();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-luxury-cream shadow-2xl z-[101] flex flex-col border-l border-luxury-charcoal/10"
          >
            <div className="p-6 border-b border-luxury-charcoal/10 flex justify-between items-center">
              <h2 className="font-serif text-2xl text-luxury-charcoal flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" /> Your Order
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-black/5 rounded-full transition-colors text-luxury-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-luxury-charcoal/40 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="font-light tracking-widest uppercase text-sm">Your order is empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-xl border border-luxury-charcoal/5">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-luxury-charcoal">{item.name}</h3>
                      <p className="text-xs tracking-widest text-luxury-charcoal/40 uppercase mb-3">{item.jpName}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-luxury-cream rounded-full px-3 py-1 border border-luxury-charcoal/10">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-luxury-matcha transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-luxury-matcha transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 underline">Remove</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg text-luxury-charcoal">{item.price * item.quantity}</p>
                      <p className="text-[9px] uppercase tracking-widest text-luxury-charcoal/40">THB</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-luxury-charcoal/10">
                <div className="flex justify-between items-end mb-6 text-luxury-charcoal">
                  <span className="font-light tracking-widest uppercase text-sm">Total</span>
                  <div className="text-right">
                    <span className="font-serif text-3xl">{total}</span>
                    <span className="text-xs uppercase tracking-widest text-luxury-charcoal/50 ml-2">THB</span>
                  </div>
                </div>
                <button className="w-full bg-luxury-charcoal text-luxury-cream py-4 rounded-xl tracking-[0.2em] uppercase text-xs hover:bg-luxury-matcha transition-colors shadow-lg">
                  Place Order
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
