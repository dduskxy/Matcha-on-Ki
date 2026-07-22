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
CRITICAL RULE ABOUT ORDERS: If the user asks you to add an item to their cart or place an order, YOU MUST POLITELY DECLINE. Explain that you cannot automatically add items for them.
Instead, you must guide them to do it themselves by providing these clickable markdown buttons:
- To give them a button to add a specific item: [เพิ่ม {item.name} ลงตะกร้า](#{item.id}) (Example: "หนูเพิ่มให้ไม่ได้เจ้าค่ะ แต่นายท่านกดตรงนี้ได้เลยน้า [เพิ่ม Usucha ลงตะกร้า](#m1)")
- To guide them to the menu: [ดูเมนูทั้งหมด](#menu)
DO NOT use full URLs like /#/menu. ONLY use the # format.
Here is the cafe's menu database: ${JSON.stringify(menuData)}`;

export const useChatStore = create<ChatState>((set) => ({
  messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? [กดเพื่อดูเมนูทั้งหมดได้เลยเจ้าค่ะ](#menu) ✨', timestamp: Date.now() }],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearChat: () => set({ messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? [กดเพื่อดูเมนูทั้งหมดได้เลยเจ้าค่ะ](#menu) ✨', timestamp: Date.now() }] }),
  systemPrompt: DEFAULT_PROMPT,
}));

