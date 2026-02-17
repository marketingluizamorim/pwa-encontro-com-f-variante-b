import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, Lock, Star, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PLANS, Plan } from "@/features/funnel/components/plans/PlansGrid";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanComparison } from "@/features/funnel/components/plans/PlanComparison";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface FeatureGateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    features: string[];
    icon?: React.ReactNode;
    price: number;
    onUpgrade?: (plan: { id: string; name: string; price: number }) => void;
}

export function FeatureGateDialog({
    open,
    onOpenChange,
    title,
    description,
    features,
    icon,
    price,
    onUpgrade,
}: FeatureGateDialogProps) {
    const navigate = useNavigate();
    const { data: subscription } = useSubscription();
    const [showComparison, setShowComparison] = useState(false);
    const { user } = useAuth();

    const isBronzeUser = subscription?.tier === 'bronze' || subscription?.tier === 'none';

    // Filter plans to show in carousel (Silver and Gold)
    const upgradeOptions = PLANS.filter(p => p.id === 'silver' || p.id === 'gold');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="w-[calc(100%-2rem)] max-w-md mx-auto border-none bg-transparent shadow-none p-0 overflow-hidden">
                <div
                    className="w-full h-full min-h-screen overflow-x-auto snap-x snap-mandatory flex gap-4 px-6 pb-12 pt-12 items-center"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onClick={() => onOpenChange(false)}
                >
                    {upgradeOptions.map((plan) => (
                        <div
                            key={plan.id}
                            className="relative flex-shrink-0 w-[85vw] max-w-[320px] snap-center pt-4"
                        >
                            {/* Floating Badge Label */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                                <div className={`text-[10px] font-black px-6 py-1.5 rounded-full border tracking-widest uppercase flex items-center ${plan.id === 'silver'
                                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#1e3a8a] border-amber-300/30 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                    : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-[#064e3b] border-emerald-300/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    }`}>
                                    {plan.id === 'silver' ? 'MAIS ESCOLHIDO' : '90% DESCONTO'}
                                </div>
                            </div>

                            <div
                                className="relative bg-[#0f172a] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-visible"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-7 pt-10 flex flex-col overflow-hidden rounded-[2.5rem]">
                                    {/* Header: Icon + Title Group */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-xl ${plan.id === 'silver'
                                            ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-500/20'
                                            : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20'
                                            }`}>
                                            {plan.id === 'silver' ? (
                                                <Star className="w-7 h-7 text-slate-900" strokeWidth={2.5} />
                                            ) : (
                                                <Crown className="w-7 h-7 text-[#422006]" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-2xl font-serif font-bold text-white leading-tight">{plan.name}</h3>
                                            <p className="text-amber-500/80 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                                                {plan.id === 'silver' ? 'COMECE PELO BÁSICO' : 'ECONOMIA COMPLETA'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Features Box */}
                                    <div className="w-full space-y-3.5 mb-8 text-left bg-white/[0.03] p-5 rounded-3xl border border-white/5">
                                        {plan.features.slice(0, 5).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="bg-emerald-500/20 p-1 rounded-full mt-0.5">
                                                    <Check className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-300 leading-tight">{feature}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pricing Row */}
                                    <div className="flex items-center justify-start gap-3 mb-6">
                                        <span className="text-slate-500 line-through text-lg font-medium opacity-50">
                                            R${plan.id === 'silver' ? '59,90' : '99,90'}
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-white text-lg font-bold">R$</span>
                                            <span className="text-white text-4xl font-extrabold tracking-tight">
                                                {plan.price.toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-slate-500 text-[0.85rem] font-medium">/mês</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => {
                                                if (onUpgrade) {
                                                    onUpgrade({
                                                        id: plan.id,
                                                        name: plan.name,
                                                        price: plan.price
                                                    });
                                                } else {
                                                    onOpenChange(false);
                                                    navigate(`/v1/planos?plan=${plan.id === 'gold' ? 'gold' : 'silver'}`);
                                                }
                                            }}
                                            className="w-full h-14 rounded-2xl gradient-button text-white font-bold text-base tracking-wide border-0 shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all"
                                        >
                                            Assinar Agora
                                        </Button>

                                        {plan.id === 'gold' && (
                                            <Button
                                                variant="ghost"
                                                onClick={(e) => { e.stopPropagation(); setShowComparison(true); }}
                                                className="w-full h-10 font-medium text-white/40 hover:text-white transition-all text-[0.85rem] underline decoration-white/20 underline-offset-4"
                                            >
                                                Comparar os Planos
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="w-4 shrink-0" />
                </div>
            </DialogContent>

            <PlanComparison
                open={showComparison}
                onOpenChange={setShowComparison}
                onSelectPlan={(p) => {
                    setShowComparison(false);
                    if (onUpgrade) {
                        onUpgrade({
                            id: p.id,
                            name: p.name,
                            price: p.price
                        });
                    } else {
                        onOpenChange(false);
                        navigate(`/v1/planos?plan=${p.id === 'gold' ? 'gold' : 'silver'}`);
                    }
                }}
            />


        </Dialog >
    );
}
