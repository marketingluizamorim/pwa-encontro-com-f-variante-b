import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function GuaranteeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-amber-light" />
        <h3 className="text-3xl font-bold mb-4 text-primary-foreground">GARANTIA LEGAL</h3>
        <p className="text-xl mb-4 text-primary-foreground">Conforme Código de Defesa do Consumidor</p>
        <p className="text-lg text-primary-foreground/80">
          Você tem 7 dias para solicitar reembolso total, sem perguntas. 
          Sua satisfação é nossa prioridade.
        </p>
      </div>
    </motion.div>
  );
}
