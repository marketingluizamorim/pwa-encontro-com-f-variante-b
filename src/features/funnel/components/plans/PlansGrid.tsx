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
          Acesso completo à maior comunidade do Brasil.
        </p>

        {/* Countdown Timer - Crystal Premium Design */}
        <div className="relative inline-block">
          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 transition-all duration-300 hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500/80"></span>
              </span>
              <span className="text-white/80 text-[10px] font-bold tracking-[0.15em] uppercase">Oferta Exclusiva</span>
            </div>

            <div className="w-px h-3 bg-white/10" />

            <span className="text-[#fcd34d] font-sans font-bold text-[15px] leading-none tabular-nums drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-6">
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
