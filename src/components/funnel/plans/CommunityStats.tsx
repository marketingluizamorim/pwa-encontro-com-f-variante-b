import { motion } from 'framer-motion';

const STATS = [
  { value: '27', label: 'Estados' },
  { value: '92.000+', label: 'Membros' },
  { value: '200+', label: 'Grupos' },
  { value: '24/7', label: 'Suporte' },
];

export function CommunityStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10"
    >
      <h3 className="text-4xl font-bold text-primary-foreground text-center mb-6">
        Nossa Comunidade
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-4xl font-bold text-amber-light">{stat.value}</p>
            <p className="text-primary-foreground/80">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
