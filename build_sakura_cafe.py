import os

def write_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Configuration
write_file('vite.config.ts', '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // For GitHub Pages
})
''')

write_file('vercel.json', '''{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
''')

# 2. Main Entry Points
write_file('src/index.css', '''@import "tailwindcss";

@theme {
  --color-matcha: #6B8E23;
  --color-sakura: #D8A7B1;
  --color-cream: #F6F1E7;
  --color-charcoal: #1F2937;
}

@layer base {
  body {
    @apply bg-cream text-charcoal font-sans antialiased;
    font-family: 'Noto Sans JP', sans-serif;
  }
}
''')

write_file('src/main.tsx', '''import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
''')

write_file('src/App.tsx', '''import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import AiBarista from './pages/AiBarista';
import About from './pages/About';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/ai-barista" element={<AiBarista />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
''')

# 3. Data & State
write_file('src/data/menuData.ts', '''export type MenuItem = {
  id: string;
  name: string;
  jpName: string;
  category: 'Coffee' | 'Tea' | 'Desserts';
  description: string;
  price: number;
  sweetness: number; // 0-5
  pairing: string;
  img: string;
};

export const menuData: MenuItem[] = [
  { id: '1', name: 'Matcha Latte', jpName: '抹茶ラテ', category: 'Coffee', description: 'Ceremonial grade Uji matcha with oat milk.', price: 140, sweetness: 2, pairing: 'Matcha Cheesecake', img: 'https://images.unsplash.com/photo-1515823662972-da6a2e1d3102?w=400' },
  { id: '2', name: 'Hojicha Latte', jpName: 'ほうじ茶ラテ', category: 'Coffee', description: 'Roasted green tea latte.', price: 135, sweetness: 2, pairing: 'Dorayaki', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
  { id: '3', name: 'Sakura Cappuccino', jpName: '桜カプチーノ', category: 'Coffee', description: 'Spring special cappuccino with cherry blossom notes.', price: 150, sweetness: 3, pairing: 'Sakura Roll Cake', img: 'https://images.unsplash.com/photo-1611077544837-79178f7fc1b4?w=400' },
  { id: '4', name: 'Cold Brew Kyoto Style', jpName: '京都風水出しコーヒー', category: 'Coffee', description: 'Slow-dripped cold brew coffee.', price: 130, sweetness: 0, pairing: 'Mochi Ice Cream', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400' },
  { id: '5', name: 'Sencha', jpName: '煎茶', category: 'Tea', description: 'Classic green tea.', price: 110, sweetness: 0, pairing: 'Dorayaki', img: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=400' },
  { id: '6', name: 'Matcha Cheesecake', jpName: '抹茶チーズケーキ', category: 'Desserts', description: 'Rich matcha infused basque cheesecake.', price: 180, sweetness: 4, pairing: 'Matcha Latte', img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400' }
];
''')

write_file('src/store/useSettingsStore.ts', '''import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  apiKeys: {
    gemini: string;
    openrouter: string;
    groq: string;
  };
  setApiKey: (provider: keyof SettingsState['apiKeys'], key: string) => void;
  deleteApiKey: (provider: keyof SettingsState['apiKeys']) => void;
  selectedProvider: 'gemini' | 'openrouter' | 'groq';
  setSelectedProvider: (provider: 'gemini' | 'openrouter' | 'groq') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: { gemini: '', openrouter: '', groq: '' },
      setApiKey: (provider, key) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
      deleteApiKey: (provider) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: '' } })),
      selectedProvider: 'gemini',
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
      selectedModel: 'gemini-1.5-flash',
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    { name: 'cafe-settings' }
  )
);
''')

write_file('src/store/useChatStore.ts', '''import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { menuData } from '../data/menuData';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type ChatState = {
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearChat: () => void;
  systemPrompt: string;
};

const DEFAULT_PROMPT = `You are an excellent Japanese café staff member for Sakura Brew Cafe. 
Always answer politely, warmly, and professionally. Keep responses short, clear, and helpful. 
Recommend menu items when appropriate, never invent unavailable items, and always prioritize excellent customer service.
Here is the menu: ${JSON.stringify(menuData.map(m => m.name + " (" + m.price + " THB)"))}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [{ id: 'init', role: 'assistant', content: 'いらっしゃいませ！ Welcome to Sakura Brew Cafe. How can I help you today?', timestamp: Date.now() }],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearChat: () => set({ messages: [{ id: 'init', role: 'assistant', content: 'いらっしゃいませ！ Welcome to Sakura Brew Cafe. How can I help you today?', timestamp: Date.now() }] }),
      systemPrompt: DEFAULT_PROMPT,
    }),
    { name: 'cafe-chat' }
  )
);
''')

# 4. Services
write_file('src/services/aiService.ts', '''import { useSettingsStore } from '../store/useSettingsStore';

export const generateChatResponse = async (messages: {role: string, content: string}[], systemPrompt: string) => {
  const { apiKeys, selectedProvider, selectedModel } = useSettingsStore.getState();
  const apiKey = apiKeys[selectedProvider];
  
  if (!apiKey) throw new Error('API Key missing for ' + selectedProvider);

  let url = '';
  let payload: any = {};
  let headers: any = { 'Content-Type': 'application/json' };

  if (selectedProvider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    payload = {
      contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };
  } else if (selectedProvider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    payload = { model: selectedModel, messages: [{ role: 'system', content: systemPrompt }, ...messages] };
  } else if (selectedProvider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    payload = { model: selectedModel, messages: [{ role: 'system', content: systemPrompt }, ...messages] };
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  
  const data = await res.json();
  if (selectedProvider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
};
''')

# 5. UI Components
write_file('src/components/Navbar.tsx', '''import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md z-50 shadow-sm border-b border-charcoal/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-matcha">
          <Coffee className="w-6 h-6" /> Sakura Brew
        </Link>
        <div className="hidden md:flex gap-6 font-medium text-sm">
          <Link to="/" className="hover:text-matcha transition">Home</Link>
          <Link to="/menu" className="hover:text-matcha transition">Menu</Link>
          <Link to="/ai-barista" className="hover:text-matcha transition">AI Barista</Link>
          <Link to="/about" className="hover:text-matcha transition">About</Link>
          <Link to="/privacy" className="hover:text-matcha transition">Security</Link>
        </div>
      </div>
    </nav>
  );
}
''')

write_file('src/components/Footer.tsx', '''export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl mb-4 text-matcha">Sakura Brew Cafe</h3>
          <p className="text-sm opacity-80">A premium Japanese cafe experience blending tradition with modern AI technology.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl mb-4">Visit Us</h3>
          <p className="text-sm opacity-80">123 Kyoto Street<br/>Bangkok, Thailand<br/>Open: Tue-Sun 08:00 - 18:00</p>
        </div>
        <div>
          <h3 className="font-serif text-xl mb-4">Legal</h3>
          <p className="text-sm opacity-80">Built for Demonstration.<br/>Uses BYOK (Bring Your Own Key) architecture for maximum privacy.</p>
        </div>
      </div>
    </footer>
  );
}
''')

# 6. Pages
write_file('src/pages/Home.tsx', '''import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544787219-7f47ccb76574')] bg-cover bg-center opacity-80 brightness-75"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white p-6">
          <h2 className="text-xl md:text-2xl mb-4 font-serif text-matcha">いらっしゃいませ</h2>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Welcome to Sakura Brew</h1>
          <Link to="/ai-barista" className="bg-matcha hover:bg-matcha/90 text-white px-8 py-3 rounded-full inline-block font-medium transition shadow-lg">Ask Our AI Barista</Link>
        </motion.div>
      </section>
      <section className="py-20 max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-serif mb-6 text-charcoal">The Art of Ma (間)</h2>
        <p className="text-lg text-charcoal/80 leading-relaxed">Experience the delicate balance of authentic Japanese tea and modern cafe culture. Our AI Barista is ready to guide you through our carefully curated menu, helping you find the perfect pairing for your mood.</p>
      </section>
    </div>
  );
}
''')

write_file('src/pages/Menu.tsx', '''import { menuData } from '../data/menuData';

export default function Menu() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif text-center mb-12 text-matcha">Our Selection</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {menuData.map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="text-sm text-charcoal/60 mb-1">{item.jpName}</div>
              <h3 className="text-xl font-bold mb-2 text-charcoal">{item.name}</h3>
              <p className="text-sm text-charcoal/80 mb-4">{item.description}</p>
              <div className="flex justify-between items-center font-medium">
                <span className="text-matcha">{item.price} THB</span>
                <span className="text-xs bg-cream px-2 py-1 rounded">Sweetness: {item.sweetness}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

write_file('src/components/Chat/ApiKeyManager.tsx', '''import { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Key, Save, Trash2 } from 'lucide-react';

export default function ApiKeyManager() {
  const { apiKeys, setApiKey, deleteApiKey, selectedProvider, setSelectedProvider, selectedModel, setSelectedModel } = useSettingsStore();
  const [inputKey, setInputKey] = useState('');

  const handleSave = () => {
    if (inputKey) {
      setApiKey(selectedProvider, inputKey);
      setInputKey('');
    }
  };

  const models = {
    gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'],
    groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    openrouter: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free', 'qwen/qwen-2.5-72b-instruct:free']
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/10 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-matcha"/> API Configuration (BYOK)</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1 text-charcoal/80">Provider</label>
          <select value={selectedProvider} onChange={(e) => { setSelectedProvider(e.target.value as any); setSelectedModel(models[e.target.value as keyof typeof models][0]); }} className="w-full p-2 rounded bg-cream border border-charcoal/20">
            <option value="gemini">Google Gemini</option>
            <option value="groq">Groq</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 text-charcoal/80">Model</label>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full p-2 rounded bg-cream border border-charcoal/20">
            {models[selectedProvider].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm mb-1 text-charcoal/80">API Key (Stored only in browser)</label>
        {apiKeys[selectedProvider] ? (
          <div className="flex items-center justify-between p-2 bg-green-50 text-green-700 rounded border border-green-200">
            <span className="text-sm font-mono">****{apiKeys[selectedProvider].slice(-4)}</span>
            <button onClick={() => deleteApiKey(selectedProvider)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="password" value={inputKey} onChange={(e) => setInputKey(e.target.value)} placeholder="Enter API Key..." className="flex-grow p-2 rounded bg-cream border border-charcoal/20" />
            <button onClick={handleSave} className="bg-charcoal text-white px-4 rounded hover:bg-matcha transition flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
          </div>
        )}
      </div>
      <p className="text-xs text-charcoal/60 mt-2">Get free keys from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-matcha hover:underline">Gemini</a>, <a href="https://console.groq.com/keys" target="_blank" className="text-matcha hover:underline">Groq</a>, or <a href="https://openrouter.ai/keys" target="_blank" className="text-matcha hover:underline">OpenRouter</a>.</p>
    </div>
  );
}
''')

write_file('src/components/Chat/ChatInterface.tsx', '''import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { generateChatResponse } from '../../services/aiService';
import { Send, Trash2, Loader2, Sparkles, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface() {
  const { messages, addMessage, clearChat, systemPrompt } = useChatStore();
  const { apiKeys, selectedProvider } = useSettingsStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

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
      addMessage({ id: (Date.now()+1).toString(), role: 'assistant', content: `Sorry, an error occurred: ${error.message}`, timestamp: Date.now() });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const confirmClear = () => {
    if(window.confirm("Are you sure you want to clear this conversation?")) {
      clearChat();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = ["Recommend a matcha drink", "What dessert goes with hojicha?", "I want something not too sweet", "What is your signature menu?"];

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-charcoal/10 h-[600px] overflow-hidden">
      <div className="bg-matcha text-white p-4 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-5 h-5"/> AI Barista</h3>
        <div className="flex gap-2">
            <button onClick={confirmClear} className="text-white/80 hover:text-white hover:bg-white/10 transition p-2 rounded flex items-center gap-1 text-sm" title="New Chat">
              <MessageSquarePlus className="w-4 h-4" /> New Chat
            </button>
            <button onClick={confirmClear} className="text-white/80 hover:text-red-200 hover:bg-red-500/20 transition p-2 rounded" title="Clear Chat">
              <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto" ref={scrollRef}>
        {messages.map(m => (
          <div key={m.id} className={`mb-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
            <div className={`p-3 rounded-2xl ${m.role === 'user' ? 'bg-charcoal text-cream rounded-br-sm' : 'bg-cream text-charcoal rounded-bl-sm'}`}>
              <ReactMarkdown className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-charcoal/5">{m.content}</ReactMarkdown>
            </div>
            <div className={`text-xs mt-1 text-charcoal/40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 max-w-[85%] mr-auto bg-cream p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-charcoal/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Barista is typing...
          </div>
        )}
      </div>

      <div className="p-3 bg-cream/50 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {quickPrompts.map(p => (
          <button key={p} onClick={() => handleSend(p)} disabled={!apiKeys[selectedProvider] || isLoading} className="text-xs bg-white border border-charcoal/10 px-3 py-1.5 rounded-full hover:border-matcha transition disabled:opacity-50">
            {p}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-charcoal/10 bg-white">
        <div className="flex gap-2">
          <input 
            type="text" 
            ref={inputRef}
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder={apiKeys[selectedProvider] ? "Ask anything..." : "Configure API key first..."}
            disabled={!apiKeys[selectedProvider] || isLoading}
            className="flex-grow p-3 rounded-xl bg-cream border border-charcoal/20 outline-none focus:border-matcha transition disabled:opacity-50"
          />
          <button onClick={() => handleSend(input)} disabled={!input.trim() || !apiKeys[selectedProvider] || isLoading} className="bg-matcha text-white p-3 rounded-xl hover:bg-matcha/90 transition disabled:opacity-50 disabled:hover:bg-matcha flex items-center justify-center min-w-[48px]">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
''')

write_file('src/pages/AiBarista.tsx', '''import ApiKeyManager from '../components/Chat/ApiKeyManager';
import ChatInterface from '../components/Chat/ChatInterface';

export default function AiBarista() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-charcoal mb-2">Virtual Barista</h1>
      <p className="text-charcoal/60 mb-8 max-w-2xl">Ask for recommendations, pairings, or learn about our tea selection. Powered by your preferred AI model.</p>
      
      <div className="grid md:grid-cols-[350px_1fr] gap-6 items-start">
        <div className="sticky top-24">
          <ApiKeyManager />
          <div className="bg-sakura/20 p-4 rounded-xl text-sm text-charcoal/80 mb-6 border border-sakura/30">
            <strong>Privacy Note:</strong> Your API keys are stored securely in your browser's local storage and never sent to our servers.
          </div>
        </div>
        <div>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
''')

write_file('src/pages/About.tsx', '''export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone">
      <h1 className="font-serif text-matcha">About Sakura Brew</h1>
      <p>Sakura Brew Cafe was born from a desire to blend the timeless tradition of Japanese tea ceremony with modern accessibility. We source our ceremonial-grade matcha directly from Uji, Kyoto.</p>
      <h2 className="font-serif text-charcoal">Location & Hours</h2>
      <p>123 Kyoto Street, Sukhumvit 49, Bangkok, Thailand 10110</p>
      <ul>
        <li>Tuesday - Sunday: 08:00 AM - 06:00 PM</li>
        <li>Monday: Closed for rest</li>
      </ul>
    </div>
  );
}
''')

write_file('src/pages/Privacy.tsx', '''export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone">
      <h1 className="font-serif text-matcha">Security & Architecture</h1>
      <h2>Bring Your Own Key (BYOK)</h2>
      <p>This application implements a secure BYOK architecture. Your API keys (Gemini, Groq, OpenRouter) are saved directly in your browser's <code>localStorage</code>.</p>
      <h2>Data Privacy</h2>
      <p>We do not track your conversations. Chat history is saved locally using Zustand persist. You can clear your data at any time using the "Clear Chat" and "Delete Key" features.</p>
      <h2>Deployment</h2>
      <p>This site is statically generated and hosted on GitHub Pages, ensuring no backend servers are capturing your requests.</p>
    </div>
  );
}
''')

print("Files written successfully.")
