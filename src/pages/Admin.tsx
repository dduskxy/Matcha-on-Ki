import { useState, useEffect } from 'react';
import EnvironmentDiagnosticPanel from '../components/EnvironmentDiagnosticPanel';
import { useMenuStore } from '../store/useMenuStore';
import PageTransition from '../components/PageTransition';
import { Settings, Save, CheckCircle2, Lock, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const menuItems = useMenuStore(state => state.items);
  const updatePrice = useMenuStore(state => state.updatePrice);
  const [savedItemIds, setSavedItemIds] = useState<Record<string, boolean>>({});
  
  // Check session storage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'matcha2024') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPasscode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };
  
  const handlePriceChange = (id: string, value: string) => {
    const newPrice = parseInt(value, 10);
    if (!isNaN(newPrice) && newPrice >= 0) {
      updatePrice(id, newPrice);
      
      setSavedItemIds(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedItemIds(prev => ({ ...prev, [id]: false }));
      }, 1000);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageTransition className="bg-[#0a0a0a] min-h-screen flex items-center justify-center font-sans selection:bg-luxury-matcha selection:text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full px-6"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-luxury-matcha" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Restricted</h1>
            <p className="text-[9px] text-white/40 tracking-[0.3em] uppercase">Authorized personnel only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter Passcode"
                className={`w-full bg-[#111] border ${error ? 'border-red-500 text-red-400' : 'border-white/10 text-white'} rounded-xl px-5 py-4 text-center tracking-[0.5em] focus:outline-none focus:border-luxury-matcha transition-colors font-sans shadow-sm`}
              />
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 right-0 text-center text-[9px] text-red-500 tracking-widest uppercase"
                  >
                    Invalid Passcode
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              className="w-full bg-luxury-matcha text-white hover:bg-[#2c4a24] transition-colors duration-500 rounded-xl py-4 flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium shadow-md"
            >
              Authenticate <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="bg-[#0a0a0a] min-h-screen pt-32 pb-32 font-sans selection:bg-luxury-matcha selection:text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
              <Settings className="w-6 h-6 text-luxury-matcha animate-[spin_4s_linear_infinite]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-white tracking-widest uppercase">Management</h1>
              <p className="text-[9px] text-luxury-matcha tracking-[0.3em] uppercase mt-1">Live Database Connected</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors px-4 py-2 border border-white/10 rounded-full hover:bg-white/5 bg-transparent"
          >
            <LogOut className="w-3 h-3" /> Terminate Session
          </button>
        </div>

        <EnvironmentDiagnosticPanel />

        <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-6 bg-black/40 border-b border-white/10 text-[9px] tracking-[0.3em] uppercase text-white/50 font-medium">
            <div className="col-span-1">ID</div>
            <div className="col-span-4">Item Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3 text-right">Price (THB)</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {menuItems.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-colors group">
                <div className="col-span-1 text-white/30 text-[10px] tracking-widest uppercase">{item.id}</div>
                <div className="col-span-4">
                  <div className="text-white/90 font-serif text-lg tracking-wide group-hover:text-luxury-matcha transition-colors">{item.name}</div>
                  <div className="text-white/40 text-[9px] tracking-[0.2em] uppercase mt-1">{item.jpName}</div>
                </div>
                <div className="col-span-2">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] text-white/60 tracking-widest uppercase border border-white/5">
                    {item.category}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center items-center">
                  <button 
                    onClick={() => useMenuStore.getState().updateItem(item.id, { isSoldOut: !item.isSoldOut })}
                    className={`px-4 py-1.5 rounded-full text-[9px] tracking-[0.2em] uppercase border transition-all duration-300 ${item.isSoldOut ? 'bg-red-950/40 text-red-400 border-red-900/50 hover:bg-red-900/40' : 'bg-luxury-matcha/10 text-luxury-matcha border-luxury-matcha/20 hover:bg-luxury-matcha/20'}`}
                  >
                    {item.isSoldOut ? 'Sold Out' : 'Available'}
                  </button>
                </div>
                <div className="col-span-3 flex justify-end items-center gap-4">
                  <AnimatePresence mode="wait">
                    {savedItemIds[item.id] ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                        key="saved"
                      >
                        <CheckCircle2 className="w-5 h-5 text-luxury-matcha" strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        key="save"
                      >
                        <Save className="w-4 h-4 text-white/20" strokeWidth={1.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="w-24 bg-transparent border-b border-white/20 text-right px-2 py-1 text-white/90 font-serif text-xl tracking-wider outline-none focus:border-luxury-matcha transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
