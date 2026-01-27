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
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-amber-light">
          ESCOLHA SEU PLANO
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-4">
          Acesso completo à plataforma
        </p>
        
        {/* Countdown Timer with glassmorphism */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-flex items-center gap-2 bg-foreground/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20"
        >
          <i className="ri-timer-flash-line text-amber-light text-xl animate-pulse" />
          <span className="text-primary-foreground font-bold text-lg">
            Oferta expira em {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </motion.div>
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
