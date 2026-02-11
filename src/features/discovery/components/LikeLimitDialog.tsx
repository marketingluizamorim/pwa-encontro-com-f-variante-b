import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Sparkles, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LikeLimitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSeePlans: () => void;
}

export function LikeLimitDialog({ open, onOpenChange, onSeePlans }: LikeLimitDialogProps) {
    const navigate = useNavigate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[340px] p-0 bg-transparent border-none shadow-none focus:ring-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-[#0f172a] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-5 right-5 z-20 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center">
                        {/* Icon Header */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 rotate-3">
                                <Heart className="w-10 h-10 text-[#422006] fill-[#422006]" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-[#0f172a]">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2 mb-8">
                            <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                                Você estava <span className="text-amber-500 italic">quase lá!</span>
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                Seu limite de curtidas diárias foi atingido, mas o amor não precisa esperar. Aumente suas chances escolhendo um plano agora.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="w-full space-y-3">
                            <Button
                                onClick={() => {
                                    onOpenChange(false);
                                    onSeePlans();
                                }}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#422006] font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-900/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Ver Planos
                                <ChevronRight className="w-4 h-4" />
                            </Button>

                            <button
                                onClick={() => onOpenChange(false)}
                                className="w-full py-3 text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                            >
                                Talvez mais tarde
                            </button>
                        </div>

                        {/* Footer Guarantee */}
                        <div className="mt-6 flex items-center gap-2 opacity-30 group">
                            <div className="h-[1px] flex-1 bg-white/20" />
                            <i className="ri-shield-check-line text-white/50 text-xs" />
                            <span className="text-[8px] font-bold text-white/50 uppercase tracking-tighter">Seguro & Abençoado</span>
                            <div className="h-[1px] flex-1 bg-white/20" />
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
