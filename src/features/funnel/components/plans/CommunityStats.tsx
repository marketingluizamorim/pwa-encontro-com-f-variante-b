import { motion } from 'framer-motion';

const STATS = [
  { value: '27', label: 'Estados' },
  { value: '92.000+', label: 'Membros' },
  { value: '200+', label: 'Grupos' },
  { value: '3.000+', label: 'Encontros Mensais' },
];

export function CommunityStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 mb-8 border border-white/10"
    >
      <h3 className="text-2xl font-serif font-bold text-white text-center mb-8 tracking-tight">
        Nossa Comunidade em Números
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.label} className="group cursor-default">
            <p className="text-4xl font-black bg-gradient-to-br from-amber-400 to-amber-200 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
              {stat.value}
            </p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
