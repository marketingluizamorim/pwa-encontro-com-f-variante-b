import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlanCard } from './PlanCard';

export interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  gradient: string;
  popular?: boolean;
  savings?: string;
  features: string[];
  excludedFeatures?: string[];
  bonus?: string[];
  pricingDetails?: { label: string; price: string }[];
}

const PLANS: Plan[] = [
  {
    id: 'bronze',
    name: 'PLANO BRONZE',
    price: 12.90,
    originalPrice: 29.90,
    period: 'Teste por 7 dias',
    gradient: 'gradient-plan-1',
    features: [
      'A conversa só começa quando ambos curtirem',
      'Enviar e receber mensagens de texto',
      '20 curtidas por dia'
    ],
    excludedFeatures: [
      'Ver quem curtiu você',
      'Enviar mensagem sem curtir antes',
      'Enviar ou receber fotos e áudios',
      'Chamadas de voz e vídeo',
      'Destaque do perfil',
      'Comunidade cristã no WhatsApp',
      'Uso de filtros'
    ]
  },
  {
    id: 'silver',
    name: 'PLANO PRATA',
    price: 29.90,
    originalPrice: 59.90,
    period: 'Mais escolhido',
    gradient: 'gradient-plan-2',
    popular: true,
    features: [
      'Ver quem curtiu você',
      'Curtidas ilimitadas',
      'Enviar ou receber fotos e áudios na mensagem',
      'Filtro por cidade / região',
      'Chamadas de voz e vídeo'
    ],
    excludedFeatures: [
      'Enviar mensagem sem curtir antes',
      'Filtro por idade e distância',
      'Destaque do perfil',
      'Filtro por interesses cristãos',
      'Filtro por online recentemente',
      'Comunidade cristã no WhatsApp'
    ]
  },
  {
    id: 'gold',
    name: 'PLANO OURO',
    price: 49.90,
    originalPrice: 99.90,
    period: 'Economia Completa',
    gradient: 'gradient-plan-3',
    savings: '90% DESCONTO',
    features: [
      'Todos os recursos do Plano Prata',
      'Enviar mensagem sem curtir antes',
      'Ver perfis online recentemente',
      'Filtro por distância e idade',
      'Filtro por objetivo de relacionamento e interesses',
      'Perfil em destaque'
    ],
    bonus: [
      'Comunidade cristã no WhatsApp',
      'Cursos bíblicos exclusivos',
      'Devocionais diários',
      'Dicas de relacionamento cristão'
    ]
  },
];

interface PlansGridProps {
  onSelectPlan: (planId: string, price: number) => void;
}

export function PlansGrid({ onSelectPlan }: PlansGridProps) {
  const [timeLeft, setTimeLeft] = useState(7 * 60 + 34); // 07:34 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 7 * 60 + 34; // Reset to 07:34
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
      {/* Section Header - Clean & Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase">Oferta por tempo limitado</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-serif text-white font-medium tracking-tight leading-tight">
          Escolha o plano ideal<br />
          <span className="text-white/60">para sua jornada</span>
        </h2>

        <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
          Desbloqueie acesso completo à maior comunidade cristã do Brasil.
        </p>

        {/* Elegant Timer */}
        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono bg-slate-900/40 px-4 py-1.5 rounded-lg border border-white/5">
            <span>Expira em:</span>
            <span className="text-white font-bold tracking-widest">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Plans Vertical Stack for Accessibility */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 pt-6 px-4 md:px-0 max-w-lg mx-auto md:max-w-none">
        {PLANS.map((plan, index) => (
          <div key={plan.id} className="w-full h-full transform transition-transform hover:scale-[1.02] duration-300">
            <PlanCard
              plan={plan}
              index={index}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { PLANS };
