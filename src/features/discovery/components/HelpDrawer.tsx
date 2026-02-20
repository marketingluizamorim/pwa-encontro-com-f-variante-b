import {
    Drawer,
    DrawerContent,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface HelpDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const helpItems = [
    {
        icon: 'ri-compass-3-line',
        title: 'Descobrir',
        description: 'Deslize para a direita se gostar, esquerda para passar ou para cima para um Super Like!',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/15',
        border: 'border-amber-500/20',
    },
    {
        icon: 'ri-heart-3-line',
        title: 'Curtidas',
        description: 'Veja quem curtiu seu perfil. Se você curtir de volta, vocês criar uma conexão e podem conversar.',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/15',
        border: 'border-rose-500/20',
    },
    {
        icon: 'ri-chat-3-line',
        title: 'Chat',
        description: 'Converse com suas conexões em um ambiente seguro e respeitoso, e cultive conexões reais.',
        color: 'text-sky-400',
        bgColor: 'bg-sky-500/15',
        border: 'border-sky-500/20',
    },
    {
        icon: 'ri-user-3-line',
        title: 'Perfil',
        description: 'Adicione fotos, bio e detalhes sobre você. Perfis completos aparecem para mais pessoas!',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
        border: 'border-emerald-500/20',
    },
];

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-[#0f172a] border-t border-white/10 outline-none rounded-t-3xl">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 shrink-0" />

                <div className="w-full max-w-md mx-auto flex flex-col" style={{ maxHeight: '82dvh' }}>

                    {/* ── Header ─────────────────────────── */}
                    <div className="flex items-start justify-between px-6 pt-4 pb-3 shrink-0">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white leading-tight">
                                Como funciona o App?
                            </h2>
                            <p className="text-sm text-white/50 mt-0.5">
                                Guia rápido para aproveitar ao máximo.
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white/80 active:scale-95 transition-all ml-4 mt-0.5 shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Scrollable content ──────────────── */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 overscroll-contain">
                        {helpItems.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.07, duration: 0.25 }}
                                className={cn(
                                    'flex items-start gap-4 p-4 rounded-2xl border',
                                    'bg-white/4',
                                    item.border
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                                    item.bgColor
                                )}>
                                    <i className={cn(item.icon, 'text-xl', item.color)} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="font-semibold text-[15px] text-white leading-snug mb-1">
                                        {item.title}
                                    </p>
                                    <p className="text-[13px] text-white/55 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Tip box */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/8 border border-primary/20">
                            <i className="ri-lightbulb-line text-lg text-primary mt-0.5" />
                            <p className="text-[13px] text-white/60 leading-relaxed">
                                <span className="text-primary font-semibold">Dica: </span>
                                Complete seu perfil com pelo menos 3 fotos para aparecer para muito mais pessoas!
                            </p>
                        </div>
                    </div>

                    {/* ── Fixed CTA ───────────────────────── */}
                    <div className="px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shrink-0 border-t border-white/6 bg-[#0f172a]">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full h-13 rounded-2xl bg-primary text-white font-bold text-[15px] shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
                            style={{ height: '52px' }}
                        >
                            Entendi!
                        </button>
                    </div>

                </div>
            </DrawerContent>
        </Drawer>
    );
}
