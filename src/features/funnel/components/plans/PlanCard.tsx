import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  gradient: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  index: number;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, index, onSelect }: PlanCardProps) {
  const formattedPrice = plan.price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOriginalPrice = plan.originalPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Unique styles for each plan level to create an attention-grabbing progression
  const cardConfigs = {
    weekly: {
      bg: 'bg-[#1e293b]/60 border-white/5',
      badge: 'bg-white/5 text-white/40',
      glow: 'opacity-0',
      button: 'bg-white/5 text-white hover:bg-white/10 border-white/10',
      check: 'text-white/40 border-white/10'
    },
    monthly: {
      bg: 'bg-[#042f2e]/90 border-teal-400/30',
      badge: 'bg-teal-400/20 text-teal-300',
      glow: 'bg-teal-400/5 opacity-50',
      button: 'bg-teal-500 text-[#042f2e] hover:bg-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]',
      check: 'text-teal-400 bg-teal-400/10 border-teal-400/20'
    },
    annual: {
      bg: 'bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8b] to-[#172554] border-amber-400/40',
      badge: 'bg-amber-400/20 text-amber-300',
      glow: 'bg-amber-400/10 opacity-70',
      button: 'gradient-button text-[#1e3a8a] hover:brightness-110 shadow-[0_10px_30px_rgba(245,158,11,0.3)]',
      check: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    }
  }[plan.id as 'weekly' | 'monthly' | 'annual'] || {
    bg: 'bg-white/10 border-white/10',
    badge: 'bg-white/5 text-white/40',
    glow: 'opacity-0',
    button: 'bg-white/10 text-white',
    check: 'text-teal-400'
  };

  return (
    <div
      className="relative w-full h-full fade-in-fast"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Popular Badge - Premium Design */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#1e3a8a] px-6 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-2 border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Oferta Imperdível
          </div>
        </div>
      )}

      {/* Card Container */}
      <div
        className={`relative rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 h-full ${cardConfigs.bg} ${plan.popular ? 'shadow-[0_20px_60px_rgba(0,0,0,0.4)] scale-105 md:scale-110 z-10' : 'shadow-2xl'
          }`}
      >
        {/* Interior glow effect */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${cardConfigs.glow}`} />

        <div className={`p-8 ${plan.popular ? 'pt-12' : ''} relative z-10 flex flex-col h-full`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-serif text-2xl font-bold tracking-tight mb-1">{plan.name}</h3>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">{plan.period}</p>
            </div>
            {plan.savings && (
              <div className="bg-emerald-500 text-[#064e3b] px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter shadow-lg">
                {plan.savings}
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 opacity-60">
              <span className="text-white/40 text-sm font-medium line-through">
                De R$ {formattedOriginalPrice}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-white/60 text-lg font-bold">R$</span>
              <span className="text-white text-6xl font-bold tracking-tighter">{formattedPrice}</span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8 flex-1">
            {plan.features.slice(0, 6).map((feature, i) => (
              <div key={i} className="flex items-start gap-3 group/item">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all flex-shrink-0 mt-0.5 ${cardConfigs.check}`}>
                  <Check className="w-3 h-3" strokeWidth={4} />
                </div>
                <span className="text-white/70 text-[13px] font-semibold leading-tight group-hover/item:text-white transition-colors">
                  {feature}
                </span>
              </div>
            ))}
            {plan.features.length > 6 && (
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest pl-8">
                + {plan.features.length - 6} recursos premium
              </p>
            )}
          </div>

          <Button
            onClick={() => onSelect(plan)}
            className={`w-full h-16 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] mt-auto ${cardConfigs.button}`}
          >
            Assinar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
