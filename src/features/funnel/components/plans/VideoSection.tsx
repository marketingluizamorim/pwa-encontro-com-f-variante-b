import { motion } from 'framer-motion';

export function VideoSection() {
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
        <p className="text-white/60 text-sm font-medium tracking-tight">
          Conheça nossa plataforma e encontre seu par ideal.
        </p>
      </div>

      <div className="relative w-full pb-[56.25%] rounded-[1.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10">
        <iframe
          src="https://www.youtube.com/embed/QTvgTq9cq8E"
          title="Como funciona o Encontro com Fé"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}
