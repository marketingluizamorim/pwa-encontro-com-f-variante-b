import { motion } from 'framer-motion';

export function PlansHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 mb-8 flex items-center justify-center gap-3 border border-white/10"
    >
      {/* Heart Logo */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
        <i className="ri-heart-fill text-white text-lg" />
      </div>
      {/* App Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
        <span>Encontro</span>{' '}
        <span className="text-amber-light">com Fé</span>
      </h1>
    </motion.div>
  );
}
