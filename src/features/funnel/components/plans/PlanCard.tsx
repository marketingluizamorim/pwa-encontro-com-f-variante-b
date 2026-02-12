import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, X, Gift, ChevronsDown, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { PlanComparison } from './PlanComparison';
import { PLANS, Plan } from './PlansGrid';

interface PlanCardProps {
  plan: Plan;
  index: number;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, index, onSelect }: PlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const formattedPrice = plan.price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOriginalPrice = plan.originalPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Unique styles for each plan level with translucency
  // Unique styles with better conversion optimization
  // Unique styles with better conversion optimization
  const config = {
    bronze: {
      bg: 'bg-[#0a0f1d] border-orange-900/40',
      badge: 'bg-orange-900/40 text-orange-200 border border-orange-700/30',
      glow: 'bg-orange-500/5 opacity-20',
      button: 'bg-[#4a3425] text-orange-100 hover:bg-[#5c402d] border-0 shadow-sm',
      check: 'text-orange-300 bg-orange-900/20 border-orange-500/20',
      x: 'text-orange-900/40 bg-orange-900/10 border-orange-900/10'
    },
    silver: {
      bg: 'bg-[#0a0f1d] border-blue-400/30 shadow-[0_0_40px_rgba(30,58,138,0.2)]',
      badge: 'bg-blue-500/20 text-blue-100 border border-blue-400/30',
      glow: 'bg-blue-500/10 opacity-30',
      button: 'bg-gradient-to-r from-teal-500 to-amber-500 text-white font-bold hover:brightness-105 shadow-sm border-0',
      check: 'text-teal-300 bg-teal-900/30 border-teal-500/30',
      x: 'text-slate-600 bg-slate-800/20 border-slate-700/20'
    },
    gold: {
      bg: 'bg-[#0a0f1d] border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)]',
      badge: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
      glow: 'bg-amber-500/5 opacity-50',
      button: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-[#422006] font-bold hover:brightness-105 shadow-sm border-0',
      check: 'text-amber-300 bg-amber-900/30 border-amber-500/30',
      x: 'text-amber-900/40 bg-amber-900/10 border-amber-900/10'
    }
  }[plan.id as 'bronze' | 'silver' | 'gold'] || {
    bg: 'bg-white/10 border-white/10 backdrop-blur-md',
    badge: 'bg-white/5 text-white/40',
    glow: 'opacity-0',
    button: 'bg-white/10 text-white',
    check: 'text-teal-400',
    x: 'text-white/20'
  };

  return (
    <div
      className={`relative w-full h-full fade-in-fast ${plan.popular ? 'mt-2' : ''}`}
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

      {/* Card Container - Clean transition & Hover */}
      <div
        className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 border h-full flex flex-col group/card hover:-translate-y-1 hover:shadow-2xl ${config.bg} ${plan.popular ? 'shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-100 md:scale-105 z-10 border-opacity-60' : 'shadow-xl hover:border-white/20'
          }`}
      >
        {/* Interactive Gradient Glow on Hover */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-0 group-hover/card:opacity-100 bg-gradient-to-t from-white/[0.03] to-transparent`} />

        {/* Interior glow effect */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${config.glow}`} />

        <div className={`p-6 md:p-8 ${plan.popular ? 'pt-10 md:pt-12' : ''} relative z-10 flex flex-col flex-1`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-serif text-xl md:text-2xl font-semibold tracking-normal mb-1">{plan.name}</h3>
              <p className="text-amber-400 text-sm font-bold tracking-wide uppercase mb-4">{plan.period}</p>
            </div>
            {plan.savings && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
                {plan.savings}
              </div>
            )}
          </div>

          {/* Pricing Section - More Balanced Typography */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5 opacity-80">
              <span className="text-slate-400 text-base font-medium line-through decoration-slate-500/50">
                De R$ {formattedOriginalPrice}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-lg font-light">R$</span>
              <span className="text-white text-4xl font-extrabold font-sans tracking-tight drop-shadow-sm">{formattedPrice}</span>
              <span className="text-slate-500 text-sm font-bold ml-1">{plan.id === 'bronze' ? '/semana' : '/mês'}</span>
            </div>


          </div>

          {/* Scrollable Content Area - Cleaned up */}
          {/* Features Shortlist - Clean App Style */}
          <div className="space-y-5 flex-1 p-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 pl-1 mb-2">Principais Vantagens:</p>
            <div className="space-y-4">
              {plan.features.slice(0, isExpanded ? undefined : 4).map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all flex-shrink-0 mt-0.5 ${config.check}`}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className="text-slate-300 text-[15px] leading-snug font-medium pt-0.5">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Expandable Content (Remaining Features + Excluded + Bonus) */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-6 pt-4"
              >
                {/* Excluded Features - Clearer Grid */}
                {plan.excludedFeatures && plan.excludedFeatures.length > 0 && (
                  <div className="pt-2 opacity-90 transition-opacity duration-300">
                    <div className="h-px bg-white/10 w-full mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 pl-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600/50" />
                      Não incluso:
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                      {plan.excludedFeatures.map((feature, i) => (
                        <div key={i} className="flex items-start gap-1.5 min-w-0">
                          <X className="w-3 h-3 text-slate-500/60 flex-shrink-0 mt-0.5" strokeWidth={3} />
                          <span className="text-slate-400 text-xs font-medium leading-tight break-words">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bonus Section - Premium Box */}
                {plan.bonus && plan.bonus.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 mt-6 relative overflow-hidden group/bonus backdrop-blur-sm">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bonus:opacity-100 transition-opacity duration-500" />
                    <p className="relative flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/90 mb-3 pl-1">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      Bônus Exclusivos
                    </p>
                    <div className="relative space-y-3">
                      {plan.bonus.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 text-slate-300 text-[13px] font-medium leading-snug pl-1">
                          <span className="block w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Horizontal scroll of upgrades for Bronze plan */}

              </motion.div>
            )}

            {/* Toggle Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="w-full text-center text-sm text-amber-400 font-bold hover:text-amber-300 transition-colors py-4 mt-5 flex items-center justify-center gap-2 group/more focus:outline-none underline decoration-amber-400/30 hover:decoration-amber-300/60 underline-offset-4"
            >
              {isExpanded ? 'Ver menos benefícios' : 'Ver todos os benefícios'}
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 group-hover/more:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 group-hover/more:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Button
              onClick={() => onSelect(plan)}
              className={`w-full h-16 rounded-full font-bold text-lg transition-all duration-300 active:scale-[0.98] relative overflow-hidden group/btn ${config.button}`}
            >
              <span className="relative z-10">Assinar Agora</span>
            </Button>

            {plan.id === 'gold' && (
              <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); setShowComparison(true); }}
                className="w-full h-12 mt-4 font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Compare os Planos
              </Button>
            )}

            <div className="flex items-center justify-center gap-2 mt-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Simple Lock Icon for Trust */}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span className="text-[10px] text-white font-medium uppercase tracking-widest">Compra Segura</span>
            </div>
          </div>
        </div>
      </div>

      <PlanComparison
        open={showComparison}
        onOpenChange={setShowComparison}
        onSelectPlan={(p) => {
          setShowComparison(false);
          onSelect(p);
        }}
      />
    </div>
  );
}
