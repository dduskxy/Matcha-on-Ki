import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCartStore } from '../store/useCartStore';
import { menuData } from '../data/menuData';
import { generateChatResponse } from '../services/aiService';
import { Loader2, X, Settings, Leaf } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ApiKeyManager from './Chat/ApiKeyManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function FloatingBarista() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const navigate = useNavigate();

  const { messages, addMessage, clearChat, systemPrompt } = useChatStore();
  const { apiKeys, selectedProvider } = useSettingsStore();
  const { addItem, isCartOpen } = useCartStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isOpen, showSettings]);

  useEffect(() => {
    // Hide tooltip automatically after 10 seconds
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim() || !apiKeys[selectedProvider]) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text, timestamp: Date.now() };
    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: text });
      const responseText = await generateChatResponse(history, systemPrompt);
      addMessage({ id: (Date.now()+1).toString(), role: 'assistant', content: responseText, timestamp: Date.now() });
    } catch (error: any) {
      addMessage({ id: (Date.now()+1).toString(), role: 'assistant', content: `*Apologies, an error occurred: ${error.message}*`, timestamp: Date.now() });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className={`fixed bottom-8 md:bottom-12 z-[999] font-sans transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCartOpen ? 'left-8 md:left-12' : 'right-8 md:right-12'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`mb-6 w-[350px] md:w-[400px] h-[550px] bg-luxury-cream/90 backdrop-blur-xl border border-luxury-charcoal/5 shadow-[0_30px_60px_rgba(0,0,0,0.1)] rounded-2xl flex flex-col overflow-hidden text-luxury-charcoal absolute bottom-full ${isCartOpen ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'}`}
          >
            {/* Minimal Header */}
            <div className="bg-transparent px-6 py-5 flex justify-between items-center z-10">
              <div>
                <h3 className="font-serif text-lg tracking-widest uppercase">Matcha Maid</h3>
                <p className="text-[9px] tracking-[0.2em] uppercase text-luxury-charcoal/40 mt-1">At your service ♡</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowSettings(!showSettings)} className="text-luxury-charcoal/30 hover:text-luxury-charcoal transition" title="Settings">
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-luxury-charcoal/30 hover:text-luxury-charcoal transition">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-luxury-charcoal/10 to-transparent"></div>

            {showSettings ? (
              <div className="flex-grow p-6 overflow-y-auto bg-luxury-cream z-10">
                <ApiKeyManager />
              </div>
            ) : (
              <>
                {/* Chat Area */}
                <div className="flex-grow p-6 overflow-y-auto bg-transparent z-10 scrollbar-hide" ref={scrollRef}>
                  <div className="flex justify-center pb-6">
                    <button onClick={() => clearChat()} className="text-[9px] tracking-[0.3em] uppercase text-luxury-charcoal/20 hover:text-luxury-charcoal transition border-b border-transparent hover:border-luxury-charcoal pb-1">
                      Start Anew
                    </button>
                  </div>

                  {messages.map(m => (
                    <div key={m.id} className={`mb-8 max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                      <div className="text-[9px] font-medium mb-2 tracking-[0.1em] uppercase text-luxury-charcoal/40">
                        {m.role === 'user' ? 'Master' : 'Maid'}
                      </div>
                      <div className={`p-4 text-sm font-light leading-relaxed shadow-sm backdrop-blur-md ${m.role === 'user' ? 'bg-luxury-charcoal text-luxury-cream rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl' : 'bg-white/60 border border-luxury-charcoal/5 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl'}`}>
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                          <ReactMarkdown
                            components={{
                              a: ({node, ...props}) => {
                                return (
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (props.href?.includes('add-to-cart')) {
                                        const url = new URL(props.href, window.location.origin);
                                        const id = url.searchParams.get('id');
                                        const item = menuData.find(m => m.id === id);
                                        if (item) addItem(item);
                                      } else if (props.href?.includes('menu')) {
                                        const hashUrl = props.href.startsWith('/#') ? props.href.substring(2) : props.href;
                                        navigate(hashUrl);
                                      } else if (props.href?.startsWith('/')) {
                                        navigate(props.href);
                                      } else {
                                        window.open(props.href, '_blank');
                                      }
                                    }}
                                    className="text-luxury-matcha border-b border-luxury-matcha/30 hover:border-luxury-matcha transition-colors"
                                  >
                                    {props.children}
                                  </button>
                                );
                              }
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="mb-8 flex items-center gap-3 text-[10px] tracking-widest text-luxury-charcoal/40 uppercase">
                      <Loader2 className="w-3 h-3 animate-spin" /> Preparing response...
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-transparent z-10">
                  <div className="flex gap-4 border-b border-luxury-charcoal/20 focus-within:border-luxury-charcoal transition-colors pb-2">
                    <input 
                      type="text" 
                      ref={inputRef}
                      value={input} 
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                      placeholder={apiKeys[selectedProvider] ? "Ask for a recommendation..." : "API key required to chat"}
                      disabled={!apiKeys[selectedProvider] || isLoading}
                      className="flex-grow bg-transparent outline-none text-sm text-luxury-charcoal placeholder-luxury-charcoal/30 font-light px-2"
                    />
                    <button onClick={() => handleSend(input)} disabled={!input.trim() || !apiKeys[selectedProvider] || isLoading} className="text-luxury-charcoal hover:text-luxury-matcha transition-colors disabled:opacity-30 text-[10px] tracking-widest uppercase font-medium pr-2">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-end">
        {/* Suggestion Tooltip */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div 
              initial={{ opacity: 0, x: isCartOpen ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isCartOpen ? -10 : 10 }}
              className={`absolute mr-6 bg-luxury-cream/90 backdrop-blur-md border border-luxury-charcoal/10 py-3 px-5 shadow-lg whitespace-nowrap hidden md:block rounded-xl ${isCartOpen ? 'left-full ml-6' : 'right-full mr-6'}`}
            >
              <div className="text-xs font-light text-luxury-charcoal tracking-wide flex items-center gap-3">
                <span className="w-1 h-1 bg-luxury-matcha rounded-full animate-pulse"></span>
                おかえりなさいませ! Welcome back, Master.
              </div>
              {/* Arrow pointer */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-luxury-cream/90 backdrop-blur-md border-luxury-charcoal/10 rotate-45 ${isCartOpen ? '-left-1.5 border-b border-l' : '-right-1.5 border-t border-r'}`}></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <button 
          onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-luxury-charcoal/5 ${isOpen ? 'bg-luxury-cream text-luxury-charcoal scale-90' : 'bg-white text-luxury-charcoal hover:bg-luxury-cream hover:scale-105'}`}
        >
          {isOpen ? <X className="w-5 h-5" strokeWidth={1} /> : <Leaf className="w-5 h-5" strokeWidth={1} />}
        </button>
      </div>
    </div>
  );
}
