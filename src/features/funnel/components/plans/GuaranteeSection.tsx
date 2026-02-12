import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function GuaranteeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 mb-12 border border-white/10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <ShieldCheck className="w-32 h-32 text-amber-400" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/20">
          <ShieldCheck className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
        </div>
        <h3 className="text-3xl font-serif font-semibold mb-2 text-white tracking-tight">GARANTIA DE 7 DIAS</h3>
        <p className="text-amber-400/80 font-bold text-xs tracking-[0.2em] uppercase mb-6">SATISFAÇÃO GARANTIDA OU SEU INVESTIMENTO DE VOLTA</p>
        <p className="text-lg text-white/80 leading-relaxed">
          Você tem <span className="text-white font-semibold">7 dias completos</span> para testar nossa plataforma. Se não encontrar o que busca, devolvemos 100% do seu valor.
          Sem perguntas, sem burocracia.
        </p>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Reembolso Fácil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">Suporte 24/7</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
