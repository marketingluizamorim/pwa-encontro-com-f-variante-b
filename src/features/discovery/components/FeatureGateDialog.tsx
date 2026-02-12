import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, Lock, Star, Crown } from "lucide-react";
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
                            className="relative flex-shrink-0 w-[85vw] max-w-[320px] snap-center"
                        >
                            <div
                                className="relative bg-[#0f172a] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button inside Card */}
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="absolute top-5 right-5 z-10 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>

                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className={`text-[10px] font-bold px-4 py-1.5 rounded-full border mb-6 tracking-widest uppercase ${plan.id === 'silver'
                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                        }`}>
                                        {plan.id === 'silver' ? 'MAIS ESCOLHIDO' : '90% DESCONTO'}
                                    </div>

                                    <div className={`w-16 h-15 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform rotate-3 ${plan.id === 'silver'
                                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-500/20'
                                        : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20'
                                        }`}>
                                        {plan.id === 'silver' ? (
                                            <Star className="w-8 h-8 text-slate-900" strokeWidth={2.5} />
                                        ) : (
                                            <Crown className="w-8 h-8 text-[#422006]" strokeWidth={2.5} />
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-serif font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-amber-500/80 font-bold text-[11px] uppercase tracking-widest mb-8">
                                        {plan.id === 'silver' ? 'COMECE PELO BÁSICO' : 'DESBLOQUEIE TODO O POTENCIAL'}
                                    </p>

                                    <div className="w-full space-y-4 mb-8 text-left bg-white/[0.03] p-6 rounded-3xl border border-white/5">
                                        {plan.features.slice(0, 5).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="bg-emerald-500/20 p-1 rounded-full mt-0.5">
                                                    <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-300 leading-tight">{feature}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="text-center">
                                            <p className="text-xs font-medium text-slate-500 line-through mb-1">
                                                De R$ {plan.id === 'silver' ? '59,90' : '99,90'}
                                            </p>
                                            <div className="flex items-end justify-center gap-1">
                                                <span className="text-3xl font-bold text-white tracking-tight">
                                                    R$ {plan.price.toFixed(2).replace('.', ',')}
                                                </span>
                                                <span className="text-sm text-slate-500 font-medium mb-1.5">/mês</span>
                                            </div>
                                        </div>

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
                                            className="w-full h-14 rounded-2xl gradient-button text-white font-bold text-sm tracking-wide border-0 shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all"
                                        >
                                            Assinar Agora
                                        </Button>


                                        {plan.id === 'gold' && (
                                            <Button
                                                variant="ghost"
                                                onClick={(e) => { e.stopPropagation(); setShowComparison(true); }}
                                                className="w-full h-10 mt-1 font-medium bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all text-xs"
                                            >
                                                Compare os Planos
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
                    navigate(`/v1/planos?plan=${p.id === 'gold' ? 'gold' : 'silver'}`);
                }}
            />


        </Dialog>
    );
}
