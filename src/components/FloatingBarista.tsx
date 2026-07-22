import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCartStore } from '../store/useCartStore';
import { menuData } from '../data/menuData';
import { generateChatResponse } from '../services/aiService';
import { Loader2, X, Settings, Leaf, ShoppingBag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ApiKeyManager from './Chat/ApiKeyManager';

export default function FloatingBarista() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { messages, addMessage, clearChat, systemPrompt } = useChatStore();
  const { apiKeys, selectedProvider, selectedModel } = useSettingsStore();
  const addItem = useCartStore((state) => state.addItem); // Atomic selector to prevent global re-renders
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom (only when messages length or loading state changes)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length, isLoading]);
  
  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !apiKeys[selectedProvider] || isLoading) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    const userText = input;
    setInput('');
    addMessage({ id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() });
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: userText });
      const responseText = await generateChatResponse(
        history, 
        systemPrompt,
        apiKeys[selectedProvider],
        selectedProvider,
        selectedModel,
        abortControllerRef.current.signal
      );
      addMessage({ id: (Date.now()+1).toString(), role: 'assistant', content: responseText, timestamp: Date.now() });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      addMessage({ id: (Date.now()+1).toString(), role: 'assistant', content: `Error: ${error.message}`, timestamp: Date.now() });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Render a chat message, extracting [CART:id] tags into actual buttons
  const renderMessageContent = (content: string, role: string) => {
    if (role === 'user') return <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-relaxed">{content}</ReactMarkdown>;

    // Regex to find all [CART:id] tags
    const cartRegex = /\[CART:([a-zA-Z0-9_-]+)\]/g;
    const cartIds: string[] = [];
    let match;
    while ((match = cartRegex.exec(content)) !== null) {
      cartIds.push(match[1]);
    }
    
    // Remove the tags from the display text
    const cleanContent = content.replace(cartRegex, '').trim();

    return (
      <div className="flex flex-col gap-3">
        <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-relaxed">
          {cleanContent}
        </ReactMarkdown>
        
        {/* Render extracted cart buttons */}
        {cartIds.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-luxury-charcoal/10">
            {cartIds.map((id, idx) => {
              const item = menuData.find(m => m.id.toLowerCase() === id.toLowerCase());
              if (!item) return null;
              return (
                <button
                  key={idx}
                  onClick={() => addItem(item)}
                  className="flex items-center gap-2 bg-luxury-matcha text-white px-4 py-2 rounded-lg text-xs tracking-wider uppercase font-medium hover:bg-[#3d6530] transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Add {item.name} (¥{item.price})
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999] font-sans">
      
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute bottom-0 right-0 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl border border-luxury-charcoal/5 z-50 ${isOpen ? 'bg-luxury-cream text-luxury-charcoal scale-90' : 'bg-white text-luxury-charcoal hover:bg-luxury-cream hover:scale-105'}`}
      >
        {isOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Leaf className="w-5 h-5" strokeWidth={1.5} />}
      </button>

      {/* Chat Window */}
      <div 
        className={`absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[550px] bg-luxury-cream/98 border border-luxury-charcoal/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
      >
        {/* Header */}
        <div className="bg-transparent px-6 py-5 flex justify-between items-center z-10 border-b border-luxury-charcoal/10">
          <div>
            <h3 className="font-serif text-lg tracking-widest uppercase text-luxury-charcoal">Matcha Maid</h3>
            <p className="text-[9px] tracking-[0.2em] uppercase text-luxury-charcoal/40 mt-1">At your service ♡</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-luxury-charcoal/40 hover:text-luxury-charcoal transition p-2">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {showSettings ? (
          <div className="flex-grow p-6 overflow-y-auto bg-luxury-cream z-10">
            <ApiKeyManager />
          </div>
        ) : (
          <>
            {/* Scrollable Chat Area */}
            {/* IMPORTANT: Added onWheel={(e) => e.stopPropagation()} to physically block Lenis or any parent scroller from hijacking this div */}
            <div 
              className="flex-grow p-6 overflow-y-auto bg-transparent z-10 custom-scrollbar" 
              ref={scrollRef} 
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              <div className="flex justify-center pb-6">
                <button onClick={() => clearChat()} className="text-[9px] tracking-[0.3em] uppercase text-luxury-charcoal/30 hover:text-luxury-charcoal transition border-b border-transparent hover:border-luxury-charcoal pb-1">
                  Start Anew
                </button>
              </div>

              {messages.map(m => (
                <div key={m.id} className={`mb-8 max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                  <div className="text-[9px] font-medium mb-2 tracking-[0.1em] uppercase text-luxury-charcoal/40">
                    {m.role === 'user' ? 'Master' : 'Maid'}
                  </div>
                  <div className={`p-4 text-sm font-light leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-luxury-charcoal text-luxury-cream rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl' : 'bg-white/95 border border-luxury-charcoal/10 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl'}`}>
                    {renderMessageContent(m.content, m.role)}
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
            <div className="p-4 bg-white/50 border-t border-luxury-charcoal/10 z-10">
              <div className="flex gap-4 border border-luxury-charcoal/20 focus-within:border-luxury-matcha transition-colors rounded-full px-5 py-3 bg-white shadow-sm">
                <input 
                  type="text" 
                  ref={inputRef}
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={apiKeys[selectedProvider] ? "Ask for a recommendation..." : "API key required"}
                  disabled={!apiKeys[selectedProvider] || isLoading}
                  className="flex-grow bg-transparent outline-none text-sm text-luxury-charcoal placeholder-luxury-charcoal/30 font-light"
                />
                <button onClick={handleSend} disabled={!input.trim() || !apiKeys[selectedProvider] || isLoading} className="text-luxury-charcoal hover:text-luxury-matcha transition-colors disabled:opacity-30">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="text-[10px] tracking-widest uppercase font-medium">Send</div>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
