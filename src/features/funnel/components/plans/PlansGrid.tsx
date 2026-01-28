import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlanCard } from './PlanCard';

const PLANS = [
  {
    id: 'weekly',
    name: 'PLANO SEMANAL',
    price: 9.90,
    originalPrice: 47,
    period: '7 dias de acesso',
    gradient: 'gradient-plan-1',
    features: [
      'Perfil completo + fotos',
      'Chat básico',
      'Suporte por email',
    ],
  },
  {
    id: 'monthly',
    name: 'PLANO MENSAL',
    price: 14.90,
    originalPrice: 97,
    period: '30 dias de acesso',
    gradient: 'gradient-plan-2',
    features: [
      'Todos os recursos semanal',
      'Conexões ilimitadas',
      'Chat + ligações',
      'Grupos por estado',
      'Filtros avançados',
      'Suporte WhatsApp',
    ],
  },
  {
    id: 'annual',
    name: 'PLANO ANUAL',
    price: 20,
    originalPrice: 197,
    period: '365 dias de acesso',
    gradient: 'gradient-plan-3',
    popular: true,
    savings: 'Economia de 90%',
    features: [
      'Todos os recursos mensal',
      'Chamadas de vídeo',
      'Todos os grupos',
      'Filtros avançados de interesses',
      'Filtros por idade e distância',
      'Perfil destaque',
      '+5.000 materiais exclusivos',
      'Suporte 24h',
      'Eventos exclusivos',
    ],
  },
];

interface PlansGridProps {
  onSelectPlan: (planId: string, price: number) => void;
}

export function PlansGrid({ onSelectPlan }: PlansGridProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 10 * 60; // Reset to 10 minutes
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSelect = (plan: typeof PLANS[0]) => {
    onSelectPlan(plan.id, plan.price);
  };

  return (
    <div className="mb-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
          Desbloqueie sua conexão ideal
        </h2>
        <p className="text-white/60 text-[14px] sm:text-base font-medium tracking-tight mb-6 whitespace-nowrap">
          Acesso completo e exclusivo à maior comunidade do Brasil.
        </p>

        {/* Countdown Timer - High contrast redesign */}
        <div className="relative inline-block group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-2xl rounded-full px-6 py-2.5 border border-white/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute inset-0" />
              <div className="w-2 h-2 rounded-full bg-amber-400 relative" />
            </div>
            <span className="text-white/90 font-bold text-sm tracking-tight">
              Oferta especial expira em:
              <span className="text-amber-400 ml-1.5 font-mono text-base tracking-tighter">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {PLANS.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export { PLANS };
