import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function VideoSection() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://fast.wistia.net/player.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://fast.wistia.net/player.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 mb-8 overflow-hidden relative shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight leading-tight mb-2">
          Veja como funciona
        </h2>
        <p className="text-white/60 text-sm font-light tracking-tight whitespace-nowrap">
          Conheça nosso <strong className="font-bold text-white">aplicativo</strong> e encontre seu par ideal.
        </p>
      </div>

      <div className="w-full rounded-2xl overflow-hidden">
        <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="rounded-[2rem] overflow-hidden">
          <div style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }}>
            <iframe
              src="https://fast.wistia.net/embed/iframe/6cib2lrqul?web_component=true&seo=true"
              title="Como funciona o Encontro com Fé"
              allow="autoplay; fullscreen"
              allowTransparency={true}
              frameBorder={0}
              scrolling="no"
              className="wistia_embed"
              name="wistia_embed"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
