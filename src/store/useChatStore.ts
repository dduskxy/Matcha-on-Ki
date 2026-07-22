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
CRITICAL RULE: When recommending a specific item, you MUST briefly describe its ingredients or taste profile, and provide TWO clickable markdown links using this exact format:
1. [ดูรายละเอียด {item.name}](/#/menu?item={item.id})
2. [เพิ่ม {item.name} ลงตะกร้า](/#/add-to-cart?id={item.id})
Example: "Usucha ของเราตีจากผงมัทฉะเกรดพิธีการค่ะ [ดูรายละเอียด Usucha](/#/menu?item=m1) หรือถ้าสนใจก็ [เพิ่ม Usucha ลงตะกร้า](/#/add-to-cart?id=m1) ได้เลยเจ้าค่ะ ✨"
If you just want to link to the general menu, use [ดูหน้าเมนูทั้งหมดคลิกตรงนี้นะคะ](/#/menu)
Here is the cafe's menu database: ${JSON.stringify(menuData)}`;

export const useChatStore = create<ChatState>((set) => ({
  messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? [กดเข้าไปดูหน้าเมนูทั้งหมดตรงนี้](/#/menu) ได้เลยน้า~ ✨', timestamp: Date.now() }],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearChat: () => set({ messages: [{ id: 'init', role: 'assistant', content: 'おかえりなさいませ！นายท่าน♡ วันนี้ให้หนูชงมัทฉะตัวไหนดีเจ้าคะ? [กดเข้าไปดูหน้าเมนูทั้งหมดตรงนี้](/#/menu) ได้เลยน้า~ ✨', timestamp: Date.now() }] }),
  systemPrompt: DEFAULT_PROMPT,
}));

