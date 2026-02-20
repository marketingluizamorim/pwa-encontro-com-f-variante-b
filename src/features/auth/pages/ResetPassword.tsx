import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabaseRuntime as supabase } from '@/integrations/supabase/runtimeClient';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const navigate = useNavigate();

    // Supabase sends the recovery token via URL hash — we need to pick it up
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setSessionReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.', { style: { marginTop: '50px' } });
            return;
        }
        if (password !== confirm) {
            toast.error('As senhas não coincidem.', { style: { marginTop: '50px' } });
            return;
        }

        setIsSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password });
        setIsSubmitting(false);

        if (error) {
            toast.error('Erro ao atualizar a senha. O link pode ter expirado.', { style: { marginTop: '50px' } });
        } else {
            toast.success('Senha atualizada com sucesso! Faça login.', { style: { marginTop: '50px' } });
            setTimeout(() => navigate('/login', { replace: true }), 1500);
        }
    };

    if (!sessionReady) {
        return (
            <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-4">
                <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center max-w-sm w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                    <p className="text-white/80 text-sm">Verificando link de recuperação...</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                        Se nada acontecer, o link pode ter expirado. Solicite um novo na tela de recuperação.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-y-auto">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-sm relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-6 mb-8"
                >
                    <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center">
                        <KeyRound className="w-8 h-8 text-[#d4af37]" />
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-serif text-white font-bold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                            Nova{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37]">
                                Senha
                            </span>
                        </h1>
                        <p className="text-white/70 text-sm font-light tracking-wide">
                            Escolha uma senha segura
                        </p>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="text-white/90 text-sm mb-1 block">Nova senha</label>
                            <div className="relative">
                                <Input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 pr-10"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-white/90 text-sm mb-1 block">Confirmar senha</label>
                            <Input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repita a senha"
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 rounded-2xl gradient-button text-white font-bold uppercase tracking-wider text-sm border-0 shadow-none hover:opacity-90 transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : null}
                            Salvar nova senha
                        </Button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
