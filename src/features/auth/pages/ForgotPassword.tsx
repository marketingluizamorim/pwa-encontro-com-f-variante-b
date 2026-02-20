import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabaseRuntime as supabase } from '@/integrations/supabase/runtimeClient';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setIsSubmitting(false);

        if (error) {
            toast.error('Não foi possível enviar o email. Verifique o endereço e tente novamente.', {
                style: { marginTop: '50px' },
            });
        } else {
            setSent(true);
        }
    };

    return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-y-auto">
            {/* Background glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-6 mb-8"
                >
                    <img
                        src="/3logo-nova1080x1080.png"
                        alt="Encontro com Fé"
                        style={{ width: '4rem', height: '4rem' }}
                        className="object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] logo-blend"
                    />
                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-serif text-white font-bold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                            Recuperar{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37]">
                                Senha
                            </span>
                        </h1>
                        <p className="text-white/70 text-sm font-light tracking-wide">
                            {sent
                                ? 'Verifique sua caixa de entrada'
                                : 'Digite seu email cadastrado'}
                        </p>
                    </div>
                </motion.div>

                {sent ? (
                    /* ── Success state ── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center">
                            <MailCheck className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <h2 className="text-white font-semibold text-lg">Email enviado!</h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Um link para redefinir sua senha foi enviado para{' '}
                            <span className="text-[#d4af37] font-medium">{email}</span>.
                            Verifique também a caixa de spam.
                        </p>
                        <Link
                            to="/login"
                            className="mt-2 w-full h-12 rounded-2xl gradient-button text-white font-bold uppercase tracking-wider text-sm flex items-center justify-center hover:opacity-90 transition-all"
                        >
                            Voltar para o login
                        </Link>
                    </motion.div>
                ) : (
                    /* ── Form state ── */
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <div>
                                <label className="text-white/90 text-sm mb-1 block">
                                    E-mail cadastrado
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                                    required
                                    autoComplete="email"
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
                                Enviar link de recuperação
                            </Button>
                        </div>
                    </motion.form>
                )}

                {/* Back link */}
                {!sent && (
                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-white/70 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para o login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
