import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLANS, Plan } from './PlansGrid';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface PlanComparisonProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectPlan: (plan: Plan) => void;
}

export function PlanComparison({ open, onOpenChange, onSelectPlan }: PlanComparisonProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expansion when dialog closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => setIsExpanded(false), 300);
        }
    }, [open]);

    const features = [
        { name: 'Curtidas Diárias', values: ['20', 'Ilimitadas', 'Ilimitadas'] },
        { name: 'Mensagens de Texto', values: [true, true, true] },
        { name: 'Fotos e Áudios', values: [false, true, true] },
        { name: 'Chamadas de voz e vídeo', values: [false, true, true] },
        { name: 'Ver quem te curtiu', values: [false, true, true] },
        { name: 'Filtro por Cidade', values: [false, true, true] },
        { name: 'Mandar Mensagem Direta', values: [false, false, true] },
        { name: 'Perfil em Destaque', values: [false, false, true] },
        { name: 'Ver Perfis Online', values: [false, false, true] },
        { name: 'Filtros: Idade, Distância e Interesses', values: [false, false, true] },
        { name: 'Comunidade WhatsApp', values: [false, true, true] },
        { name: 'Cursos e Devocionais', values: [true, true, true] },
    ];

    const planColors = {
        bronze: 'text-orange-400 bg-orange-900/10 border-orange-500/20',
        silver: 'text-blue-400 bg-blue-900/10 border-blue-500/20',
        gold: 'text-amber-400 bg-amber-900/10 border-amber-500/20',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl p-0 bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] focus:ring-0 outline-none">
                <DialogHeader className="p-8 border-b border-white/5">
                    <DialogTitle className="text-2xl font-serif text-center text-white font-medium">
                        Comparativo de Planos
                    </DialogTitle>
                </DialogHeader>

                <div
                    className={`flex-1 overflow-y-scroll scrollbar-visible ${!isExpanded ? 'cursor-pointer h-[320px]' : ''}`}
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)',
                    }}
                    onClick={() => {
                        if (!isExpanded) {
                            setIsExpanded(true);
                        }
                    }}
                >
                    <style>{`
                        .scrollbar-visible::-webkit-scrollbar {
                            width: 6px;
                            display: block !important;
                        }
                        .scrollbar-visible::-webkit-scrollbar-track {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 10px;
                        }
                        .scrollbar-visible::-webkit-scrollbar-thumb {
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 10px;
                        }
                        .scrollbar-visible::-webkit-scrollbar-thumb:hover {
                            background: rgba(255, 255, 255, 0.3);
                        }
                    `}</style>
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-20 bg-[#0f172a] shadow-lg">
                            <tr>
                                <th className="p-3 text-xs font-bold uppercase tracking-widest text-slate-500 bg-black/40 border-b border-white/5">Recurso</th>
                                {PLANS.map((plan) => (
                                    <th key={plan.id} className={`p-3 text-center border-b border-white/5 ${plan.id === 'bronze' ? 'bg-orange-900/10' : plan.id === 'silver' ? 'bg-blue-900/10' : 'bg-amber-900/10'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-tighter ${plan.id === 'bronze' ? 'text-orange-400' : plan.id === 'silver' ? 'text-blue-400' : 'text-amber-400'}`}>
                                            {plan.name.replace('PLANO ', '')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {features.slice(0, isExpanded ? undefined : 6).map((feature, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3 text-xs font-semibold text-slate-300 bg-black/20 border-b border-white/5">
                                        {feature.name}
                                    </td>
                                    {feature.values.map((value, planIdx) => {
                                        const planId = PLANS[planIdx].id;
                                        const bgColor = planId === 'bronze' ? 'bg-orange-900/5' : planId === 'silver' ? 'bg-blue-900/5' : 'bg-amber-900/5';

                                        return (
                                            <td key={planIdx} className={`p-3 text-center border-b border-white/5 ${bgColor}`}>
                                                {typeof value === 'boolean' ? (
                                                    value ? (
                                                        <Check className={`w-4 h-4 mx-auto ${planId === 'bronze' ? 'text-orange-500' : planId === 'silver' ? 'text-blue-400' : 'text-amber-400'}`} strokeWidth={3} />
                                                    ) : (
                                                        <X className="w-3.5 h-3.5 mx-auto text-slate-700/30" strokeWidth={2} />
                                                    )
                                                ) : (
                                                    <span className="text-xs font-bold text-white">{value}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>

                        {!isExpanded && (
                            <tbody className="border-t-0">
                                <tr>
                                    <td colSpan={4} className="p-0">
                                        <button
                                            onClick={() => setIsExpanded(true)}
                                            className="w-full py-8 text-amber-500 font-bold text-sm bg-gradient-to-t from-[#0f172a] to-transparent hover:text-amber-400 transition-all flex items-center justify-center gap-2 underline decoration-amber-500/30 underline-offset-8"
                                        >
                                            Ver todos os benefícios
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        )}
                        <tfoot className="sticky bottom-0 z-20 bg-[#0f172a] shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
                            <tr>
                                <td className="p-3 bg-black/20 border-t border-white/5"></td>
                                {PLANS.map((plan) => (
                                    <td key={plan.id} className={`p-3 text-center border-t border-white/5 ${plan.id === 'bronze' ? 'bg-orange-900/10' : plan.id === 'silver' ? 'bg-blue-900/10' : 'bg-amber-900/10'}`}>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectPlan(plan);
                                            }}
                                            className={`h-8 px-4 text-[10px] font-bold uppercase rounded-full transition-all active:scale-95 w-full ${plan.id === 'bronze' ? 'bg-orange-900/80 text-orange-100 hover:bg-orange-800' :
                                                plan.id === 'silver' ? 'bg-blue-600 text-white hover:bg-blue-500' :
                                                    'bg-amber-500 text-amber-950 hover:bg-amber-400'
                                                }`}
                                        >
                                            Assinar
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
