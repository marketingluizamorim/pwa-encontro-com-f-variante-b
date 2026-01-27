import { motion } from 'framer-motion';

export function VideoSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-20"
    >
      <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-2 text-center">
        Veja Como Funciona
      </h2>
      <p className="text-primary-foreground/80 text-sm md:text-base mb-6 text-center">
        Conheça nossa plataforma e encontre seu par ideal na fé
      </p>
      <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden">
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
