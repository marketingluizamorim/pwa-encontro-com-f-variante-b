import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle } from 'lucide-react';

interface SuperLikeExplainerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onViewPlans: () => void;
    profileName?: string;
}

export function SuperLikeExplainerDialog({
    open,
    onOpenChange,
    onViewPlans,
    profileName = 'essa pessoa'
}: SuperLikeExplainerDialogProps) {
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="relative z-[99999]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Dialog Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 pt-8 flex flex-col items-center text-center space-y-5">

                                {/* Icon Wrapper */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-6">
                                        <Star className="w-8 h-8 text-white fill-white" />
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                            <MessageCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-foreground">
                                        Envie uma mensagem direta!
                                    </h2>
                                    <p className="text-muted-foreground text-sm leading-relaxed px-2">
                                        Com o <span className="text-blue-500 font-semibold">Super Like</span>, você pode enviar uma mensagem para {profileName} junto com sua curtida, antes mesmo do match.
                                    </p>
                                </div>

                                {/* Feature Box */}
                                <div className="w-full bg-secondary/50 rounded-xl p-3 border border-border/50">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                            <i className="ri-vip-crown-fill text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground uppercase tracking-wide">Exclusivo Plano Ouro</p>
                                            <p className="text-[11px] text-muted-foreground">Fure a fila e chame a atenção agora.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="w-full space-y-3 pt-2">
                                    <Button
                                        onClick={onViewPlans}
                                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all"
                                    >
                                        Quero enviar mensagem
                                    </Button>

                                    <button
                                        onClick={() => onOpenChange(false)}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                                    >
                                        Talvez depois
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
