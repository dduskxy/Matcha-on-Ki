import { create } from 'zustand';
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

const DEFAULT_PROMPT = `You are "Matcha Maid", an anime-style maid at a luxury matcha cafe. 
Personality: Polite, neat, but playful and slightly teasing.
Tone: EXTREMELY CONCISE. Keep answers short, punchy, and conversational. NEVER write long paragraphs.
Address the user playfully as "นายท่าน" (Master) or "คุณหนู" (Mistress). Use particles like "เจ้าค่ะ", "มั้ยคะ", "น้า~", "✨" or "♡".
CRITICAL RULE: When recommending a specific item, you MUST append a special action tag at the end of your message in this exact format: [CART:item_id] 
Example: "Usucha ของเราตีจากผงมัทฉะเกรดพิธีการค่ะ รับไปลองซักแก้วมั้ยคะนายท่าน? ✨ [CART:m1]"
If you are recommending multiple items, you can put multiple tags: "[CART:m1] [CART:s2]"
Here is the cafe's menu database: ${JSON.stringify(menuData)}`;

export const useChatStore = create<ChatState>((set) => ({
  messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? ✨', timestamp: Date.now() }],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearChat: () => set({ messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? ✨', timestamp: Date.now() }] }),
  systemPrompt: DEFAULT_PROMPT,
}));

