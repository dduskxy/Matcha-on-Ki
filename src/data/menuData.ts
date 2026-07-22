export type MenuItem = {
  id: string;
  name: string;
  jpName: string;
  category: 'Matcha' | 'Coffee' | 'Tea' | 'Sweets';
  price: number;
  description: string;
  icon: 'matcha' | 'coffee' | 'tea' | 'cold' | 'sweet';
  origin: string;
  brewTemp: string;
  tastingNotes: string[];
};

export const menuData: MenuItem[] = [
  // --- MATCHA ---
  { id: 'm1', name: 'Usucha (Thin Tea)', jpName: '薄茶', category: 'Matcha', price: 180, description: 'Ceremonial grade, whisked to a light froth.', icon: 'matcha', origin: 'Uji, Kyoto', brewTemp: '80°C', tastingNotes: ['Sweet grass', 'Umami', 'Light floral'] },
  { id: 'm2', name: 'Koicha (Thick Tea)', jpName: '濃茶', category: 'Matcha', price: 250, description: 'Premium ceremonial grade, dense and intense.', icon: 'matcha', origin: 'Yame, Fukuoka', brewTemp: '75°C', tastingNotes: ['Deep umami', 'Dark chocolate', 'Seaweed'] },
  { id: 'm3', name: 'Matcha Latte', jpName: '抹茶ラテ', category: 'Matcha', price: 150, description: 'Matcha layered with rich oat milk.', icon: 'coffee', origin: 'Nishio, Aichi', brewTemp: '70°C', tastingNotes: ['Creamy', 'Nutty', 'Mellow green'] },
  { id: 'm4', name: 'Matcha Espresso', jpName: '抹茶エスプレッソ', category: 'Matcha', price: 160, description: 'A bold fusion of matcha and espresso shot.', icon: 'coffee', origin: 'Uji & Sidamo Blend', brewTemp: '90°C', tastingNotes: ['Earthy', 'Bold roast', 'Complex'] },
  { id: 'm5', name: 'Yuzu Matcha Sparking', jpName: '柚子抹茶', category: 'Matcha', price: 160, description: 'Refreshing sparkling matcha with Japanese citrus.', icon: 'cold', origin: 'Kagoshima', brewTemp: 'Cold', tastingNotes: ['Citrus zest', 'Crisp', 'Invigorating'] },
  
  // --- COFFEE ---
  { id: 'c1', name: 'Kyoto Cold Brew', jpName: '水出し珈琲', category: 'Coffee', price: 140, description: 'Slow-dripped for 12 hours, smooth and low acidity.', icon: 'cold', origin: 'Antigua, Guatemala', brewTemp: 'Cold', tastingNotes: ['Milk chocolate', 'Caramel', 'Smooth finish'] },
  { id: 'c2', name: 'Hand Drip Pour Over', jpName: 'ハンドドリップ', category: 'Coffee', price: 180, description: 'Single origin beans, meticulously brewed.', icon: 'coffee', origin: 'Yirgacheffe, Ethiopia', brewTemp: '92°C', tastingNotes: ['Jasmine', 'Bergamot', 'Bright acidity'] },
  { id: 'c3', name: 'Black Americano', jpName: 'アメリカーノ', category: 'Coffee', price: 110, description: 'Classic espresso over filtered water.', icon: 'coffee', origin: 'Huila, Colombia', brewTemp: '93°C', tastingNotes: ['Dark cocoa', 'Roasted nuts', 'Balanced'] },
  { id: 'c4', name: 'Charcoal Latte', jpName: '炭ラテ', category: 'Coffee', price: 150, description: 'Activated charcoal with espresso and milk.', icon: 'coffee', origin: 'House Blend', brewTemp: '85°C', tastingNotes: ['Smoky', 'Vanilla', 'Velvety'] },
  
  // --- TEA ---
  { id: 't1', name: 'Gyokuro', jpName: '玉露', category: 'Tea', price: 220, description: 'Shade-grown green tea, rich in umami.', icon: 'tea', origin: 'Asahina, Shizuoka', brewTemp: '60°C', tastingNotes: ['Broth-like umami', 'Marine', 'Sweet finish'] },
  { id: 't2', name: 'Sencha', jpName: '煎茶', category: 'Tea', price: 130, description: 'Traditional roasted green tea, perfectly balanced.', icon: 'tea', origin: 'Shizuoka', brewTemp: '75°C', tastingNotes: ['Grassy', 'Refreshing', 'Subtle astringency'] },
  { id: 't3', name: 'Hojicha Latte', jpName: 'ほうじ茶ラテ', category: 'Tea', price: 140, description: 'Roasted green tea with steamed milk.', icon: 'coffee', origin: 'Uji, Kyoto', brewTemp: '90°C', tastingNotes: ['Roasted caramel', 'Earthy', 'Warm'] },
  { id: 't4', name: 'Genmaicha', jpName: '玄米茶', category: 'Tea', price: 120, description: 'Green tea blended with roasted brown rice.', icon: 'tea', origin: 'Kagoshima', brewTemp: '85°C', tastingNotes: ['Toasted popcorn', 'Nutty', 'Mild green'] },
  
  // --- SWEETS ---
  { id: 's1', name: 'Seasonal Nerikiri', jpName: '練り切り', category: 'Sweets', price: 120, description: 'Artisanal wagashi shaped to reflect the season.', icon: 'sweet', origin: 'Local Artisan', brewTemp: 'N/A', tastingNotes: ['Delicate sweet bean', 'Subtle floral', 'Silky texture'] },
  { id: 's2', name: 'Warabimochi', jpName: 'わらび餅', category: 'Sweets', price: 140, description: 'Bracken-starch mochi with kinako and kuromitsu.', icon: 'sweet', origin: 'Kyoto Tradition', brewTemp: 'N/A', tastingNotes: ['Toasted soybean', 'Rich molasses', 'Chewy'] },
  { id: 's3', name: 'Matcha Basque', jpName: '抹茶バスク', category: 'Sweets', price: 180, description: 'Rich, melt-in-your-mouth matcha cheesecake.', icon: 'sweet', origin: 'Uji Matcha Infusion', brewTemp: 'N/A', tastingNotes: ['Caramelized crust', 'Deep matcha', 'Creamy cheese'] },
  { id: 's4', name: 'Daifuku', jpName: '大福', category: 'Sweets', price: 90, description: 'Soft mochi stuffed with red bean paste.', icon: 'sweet', origin: 'Hokkaido Azuki', brewTemp: 'N/A', tastingNotes: ['Sweet adzuki', 'Soft rice', 'Comforting'] },
];
