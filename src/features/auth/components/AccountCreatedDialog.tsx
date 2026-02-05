import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountCreatedDialogProps {
    open: boolean;
    name: string;
    onContinue: () => void;
}

export function AccountCreatedDialog({ open, name, onContinue }: AccountCreatedDialogProps) {
    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto border-none bg-transparent shadow-none p-0 overflow-hidden [&>button]:hidden">
                <div className="relative bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl overflow-hidden ring-1 ring-white/5">

                    {/* Animated Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#14b8a6]/20 rounded-full blur-[80px]" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#d4af37]/15 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Success Icon Animation */}
                        <div className="relative mb-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f59e0b] p-[3px] shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                            >
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent" />
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <UserCheck className="w-8 h-8 text-[#fcd34d] stroke-[2.5]" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Floating Sparkles */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <Sparkles className="absolute top-0 right-0 w-5 h-5 text-[#fcd34d] fill-[#fcd34d] animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <Sparkles className="absolute bottom-1 left-0 w-3 h-3 text-[#fcd34d] fill-[#fcd34d] animate-pulse" style={{ animationDelay: '1.5s' }} />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-3 mb-8"
                        >
                            <h2 className="text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                                Bem-vindo(a), {name}!
                            </h2>

                            <p className="text-white/70 text-sm font-light leading-relaxed max-w-[260px] mx-auto">
                                Sua conta foi criada com sucesso. <br />
                                Vamos agora configurar seu perfil para que você possa encontrar conexões reais.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full"
                        >
                            <Button
                                onClick={onContinue}
                                className="w-full h-12 rounded-xl gradient-button text-white font-bold tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all text-sm uppercase flex items-center justify-center gap-2 group"
                            >
                                <span>Criar Meu Perfil</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
