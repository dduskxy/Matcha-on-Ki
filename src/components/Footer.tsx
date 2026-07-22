export default function Footer() {
  return (
    <footer className="bg-luxury-cream/40 text-luxury-charcoal py-16 border-t border-luxury-charcoal/10 font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 mb-12 text-center md:text-left">
        <div>
          <h3 className="text-2xl font-serif tracking-widest text-luxury-charcoal mb-6 uppercase">Matcha no Ki</h3>
          <p className="text-sm font-light leading-relaxed max-w-sm opacity-60 mx-auto md:mx-0">
            A sanctuary of stillness in the heart of the city. Experience the deep tradition of Uji matcha reimagined for the modern soul.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase text-luxury-charcoal/40 mb-6">Location</h4>
          <p className="text-sm font-light opacity-80 leading-relaxed uppercase">
            35.0116° N, 135.7681° E<br/>
            Sukhumvit 49, Bangkok<br/>
            Thailand 10110
          </p>
        </div>
        <div>
          <h4 className="text-[10px] tracking-[0.3em] uppercase text-luxury-charcoal/40 mb-6">Hours</h4>
          <p className="text-sm font-light opacity-80 leading-relaxed uppercase">
            Tue — Sun<br/>
            08:00 — 18:00<br/>
            <span className="text-luxury-charcoal/40 mt-2 block">Closed Mondays</span>
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-luxury-charcoal/5 flex flex-col md:flex-row justify-between items-center text-[10px] opacity-40 tracking-[0.3em] uppercase gap-4">
        <span>© 2026 Matcha no Ki</span>
        <span>Built for Stillness</span>
      </div>
    </footer>
  );
}
