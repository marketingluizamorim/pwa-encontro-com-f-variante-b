import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLANS, Plan } from './PlansGrid';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface PlanComparisonProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectPlan: (plan: Plan) => void;
}

export function PlanComparison({ open, onOpenChange, onSelectPlan }: PlanComparisonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Reset expansion when dialog closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => setIsExpanded(false), 300);
        }
    }, [open]);

    // Auto-scroll when unlocked
    useEffect(() => {
        if (isExpanded && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [isExpanded]);

    const features = [
        { name: 'Curtidas Diárias', values: ['20', 'Sem limite', 'Sem limite'] },
        { name: 'Mensagens de Texto', values: [true, true, true] },
        { name: 'Fotos e Áudios', values: [false, true, true] },
        { name: 'Chamadas Voz/Vídeo', values: [false, true, true] },
        { name: 'Ver quem te curtiu', values: [false, true, true] },
        { name: 'Filtro por Cidade', values: [false, true, true] },
        { name: 'Mensagem Direta', values: [false, false, true] },
        { name: 'Perfil em Destaque', values: [false, false, true] },
        { name: 'Ver Perfis Online', values: [false, false, true] },
        { name: 'Filtros: Idade, Distância e Interesses', values: [false, false, true] },
        { name: 'Comunidade WhatsApp', values: [false, true, true] },
        { name: 'Cursos e Devocionais', values: [true, true, true] },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[340px] p-0 bg-[#13191f] border border-white/5 overflow-hidden flex flex-col rounded-[20px] focus:ring-0 outline-none gap-0">

                {/* Custom Close Button for the design */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-3.5 top-3.5 w-[22px] h-[22px] rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 z-50 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>

                <DialogHeader className="p-4 px-[18px] pt-[16px] text-center shrink-0">
                    <DialogTitle className="text-[16px] font-[800] text-white tracking-[0.2px] font-sans">
                        Comparativo de Planos
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={scrollContainerRef}
                    className={`px-[14px] pt-3 h-[500px] overscroll-y-contain relative flex flex-col ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`}
                >
                    <table className="w-full border-collapse table-fixed">
                        <thead>
                            <tr>
                                <th className="text-left text-[9.5px] font-bold uppercase tracking-[1px] text-white/30 py-2 w-[38%]">Recurso</th>
                                <th className="text-center text-[10.5px] font-bold uppercase tracking-[1px] text-[#c0622a] py-2">Bronze</th>
                                <th className="text-center text-[10.5px] font-bold uppercase tracking-[1px] text-[#7eb8ff] py-2">Prata</th>
                                <th className="text-center text-[10.5px] font-bold uppercase tracking-[1px] text-[#ffb400] py-2">Ouro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(isExpanded ? features : features.slice(0, 8)).map((feature, idx) => (
                                <tr key={idx} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-2.5 pr-2 text-[12.5px] font-medium text-white/70 leading-[1.3] text-left">
                                        {feature.name}
                                    </td>
                                    {feature.values.map((value, planIdx) => (
                                        <td key={planIdx} className="py-2.5 text-center align-middle">
                                            {typeof value === 'boolean' ? (
                                                value ? (
                                                    <div className={`flex items-center justify-center ${planIdx === 0 ? 'text-[#c0622a]' : planIdx === 1 ? 'text-[#7eb8ff]' : 'text-[#ffb400]'
                                                        }`}>
                                                        <Check className="w-[15px] h-[15px]" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-white/15">✕</span>
                                                )
                                            ) : (
                                                <span className={`text-[11px] font-bold ${planIdx === 1 ? 'text-[#7eb8ff]' : planIdx === 2 ? 'text-[#ffb400]' : 'text-white'
                                                    }`}>
                                                    {value}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isExpanded && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full py-4 flex items-center justify-center gap-1.5 text-[#ffb400] font-sans text-[12px] font-bold hover:opacity-80 transition-opacity bg-transparent border-0"
                        >
                            Ver todos os benefícios
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Footer Buttons Grid */}
                <div className="p-[14px] pt-2.5 grid grid-cols-3 gap-1.5 border-t border-white/[0.05] bg-[#13191f] shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                    {PLANS.map((plan, planIdx) => (
                        <Button
                            key={plan.id}
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectPlan(plan);
                            }}
                            className={`h-[38px] px-1 rounded-[10px] text-[10px] font-bold tracking-[0.5px] transition-all active:scale-[0.96] border-0 shadow-none font-sans ${planIdx === 0 ? 'bg-[#c0622a] text-white hover:bg-[#a85524]' :
                                planIdx === 1 ? 'bg-[#3b7fd4] text-white hover:bg-[#2e69b5]' :
                                    'bg-gradient-to-r from-[#e8a020] to-[#ffcd60] text-[#1a1000] hover:brightness-105'
                                }`}
                        >
                            ASSINAR
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
