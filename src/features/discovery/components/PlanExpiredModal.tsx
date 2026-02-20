import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import { PlanComparison } from '@/features/funnel/components/plans/PlanComparison';
import type { Plan } from '@/features/funnel/components/plans/PlansGrid';

// Import real plan data so benefits are always in sync
const PLAN_DATA: Record<string, {
    label: string;
    color: string;
    borderColor: string;
    price: number;
    features: string[];
    excludedFeatures?: string[];
    bonus?: string[];
}> = {
    bronze: {
        label: 'Bronze',
        color: 'text-orange-400',
        borderColor: 'border-orange-500/30',
        price: 12.90,
        features: [
            'A conversa só começa quando ambos curtirem',
            'Enviar e receber mensagens de texto',
            '20 curtidas por dia',
        ],
        excludedFeatures: [
            'Ver quem curtiu você',
            'Enviar mensagem sem curtir antes',
            'Enviar ou receber fotos e áudios',
            'Chamadas de voz e vídeo',
            'Destaque do perfil',
        ],
    },
    silver: {
        label: 'Prata',
        color: 'text-slate-300',
        borderColor: 'border-slate-400/30',
        price: 29.90,
        features: [
            'Ver quem curtiu você',
            'Curtidas ilimitadas',
            'Enviar ou receber fotos e áudios',
            'Filtro por cidade / região',
            'Chamadas de voz e vídeo',
        ],
        excludedFeatures: [
            'Enviar mensagem sem curtir antes',
            'Filtro por distância e idade',
            'Destaque do perfil',
            'Comunidade cristã no WhatsApp',
        ],
    },
    gold: {
        label: 'Ouro',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        price: 49.90,
        features: [
            'Todos os recursos do Plano Prata',
            'Enviar mensagem sem curtir antes',
            'Ver perfis online recentemente',
            'Filtro por distância e idade',
            'Filtro por objetivo e interesses',
            'Perfil em destaque',
        ],
        bonus: [
            'Comunidade cristã no WhatsApp',
            'Cursos bíblicos exclusivos',
            'Devocionais diários',
        ],
    },
};

interface PlanExpiredModalProps {
    open: boolean;
    previousTier?: string; // 'bronze' | 'silver' | 'gold'
}

export function PlanExpiredModal({ open, previousTier }: PlanExpiredModalProps) {
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number; source: 'in_app_upgrade' | 'in_app_renewal' } | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    const plan = PLAN_DATA[previousTier ?? 'silver'] ?? PLAN_DATA.silver;

    const openCheckout = (id: string) => {
        const p = PLAN_DATA[id];
        const isSamePlan = id === (previousTier ?? 'silver');
        setSelectedPlan({
            id,
            name: `Plano ${p.label}`,
            price: p.price,
            source: isSamePlan ? 'in_app_renewal' : 'in_app_upgrade',
        });
        setShowCheckout(true);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="plan-expired-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center"
                >
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                        className={`w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border ${plan.borderColor} overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto`}
                    >
                        <div className="p-6 space-y-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>

                            {/* Icon + header */}
                            <div className="text-center space-y-2.5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto">
                                    <RefreshCw className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl font-bold text-foreground">
                                        Seu plano expirou
                                    </h2>
                                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                                        Seu <span className={`font-bold ${plan.color}`}>Plano {plan.label}</span> chegou ao fim.
                                        Renove agora para continuar encontrando conexões cristãs.
                                    </p>
                                </div>
                            </div>

                            {/* Features included in this plan */}
                            <div className="bg-muted/30 rounded-2xl p-4 border border-border/30 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                    ✅ O que você vai recuperar
                                </p>
                                {plan.features.map((text, i) => (
                                    <div key={i} className="flex items-start gap-3 text-foreground/85">
                                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.color}`} />
                                        <span className="text-sm font-medium">{text}</span>
                                    </div>
                                ))}

                                {/* Bonus (gold only) */}
                                {plan.bonus && plan.bonus.length > 0 && (
                                    <>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-2">
                                            🎁 Bônus exclusivos
                                        </p>
                                        {plan.bonus.map((text, i) => (
                                            <div key={`bonus-${i}`} className="flex items-start gap-3 text-foreground/75">
                                                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                                                <span className="text-sm font-medium">{text}</span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Compare plans link */}
                                <button
                                    onClick={() => setShowComparison(true)}
                                    className="mt-3 w-full flex items-center justify-center gap-2 text-[#ffb400] text-xs font-semibold hover:text-amber-300 transition-colors py-1"
                                >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Ver comparativo de planos
                                </button>
                            </div>

                            {/* CTA buttons */}
                            <div className="space-y-3 pt-1">
                                {/* Primary — renew current plan (no icon) */}
                                <button
                                    onClick={() => openCheckout(previousTier ?? 'silver')}
                                    className="w-full py-4 rounded-2xl gradient-button text-white font-bold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform border-0 flex items-center justify-center"
                                >
                                    Renovar Plano {plan.label} — R${plan.price.toFixed(2).replace('.', ',')}
                                </button>

                                {/* Secondary — upgrade options side by side */}
                                {previousTier === 'bronze' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => openCheckout('silver')}
                                            className="py-3 rounded-2xl bg-slate-700/40 border border-slate-400/30 text-slate-300 font-semibold text-sm active:scale-[0.98] transition-transform flex flex-col items-center justify-center gap-0.5"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wide">Plano Prata</span>
                                            <span className="text-[11px] text-slate-400">R$29,90</span>
                                        </button>
                                        <button
                                            onClick={() => openCheckout('gold')}
                                            className="py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-sm active:scale-[0.98] transition-transform flex flex-col items-center justify-center gap-0.5"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1"><Crown className="w-3 h-3" />Plano Ouro</span>
                                            <span className="text-[11px] text-amber-500/70">R$49,90</span>
                                        </button>
                                    </div>
                                )}

                                {previousTier === 'silver' && (
                                    <button
                                        onClick={() => openCheckout('gold')}
                                        className="w-full py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                    >
                                        <Crown className="w-4 h-4" />
                                        Upgrade para o Plano Ouro — R$49,90
                                    </button>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Plan comparison dialog */}
            <PlanComparison
                open={showComparison}
                onOpenChange={setShowComparison}
                onSelectPlan={(p: Plan) => {
                    setShowComparison(false);
                    const isSamePlan = p.id === (previousTier ?? 'silver');
                    setSelectedPlan({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        source: isSamePlan ? 'in_app_renewal' : 'in_app_upgrade',
                    });
                    setShowCheckout(true);
                }}
            />

            {/* In-app checkout */}
            {showCheckout && selectedPlan && (
                <CheckoutManager
                    key={`renew-checkout-${selectedPlan.id}`}
                    open={showCheckout}
                    onOpenChange={setShowCheckout}
                    planId={selectedPlan.id}
                    planPrice={selectedPlan.price}
                    planName={selectedPlan.name}
                    purchaseSource={selectedPlan.source}
                />
            )}
        </AnimatePresence>
    );
}
