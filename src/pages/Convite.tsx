import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBodyScroll } from '@/hooks/useBodyScroll';
import { toast } from 'sonner';
import {
    Heart, Star, CheckCircle2, Loader2, Lock, Mail, User,
    MessageCircle, Shield, Eye, EyeOff, ChevronRight, MapPin,
} from 'lucide-react';

const BENEFITS = [
    { icon: Star, text: '2 meses do Plano Prata grátis', color: 'text-amber-400' },
    { icon: MapPin, text: 'Encontre pessoas cristãs perto de você', color: 'text-rose-400' },
    { icon: Heart, text: 'Veja quem curtiu você', color: 'text-pink-400' },
    { icon: Shield, text: 'Curtidas ilimitadas', color: 'text-emerald-400' },
    { icon: MessageCircle, text: 'Filtros avançados de busca', color: 'text-blue-400' },
];

type Step = 'landing' | 'register' | 'activating' | 'done';

export default function Convite() {
    const navigate = useNavigate();
    const { signUp, signIn } = useAuth();

    const [step, setStep] = useState<Step>('landing');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Allow body to scroll on this page (global CSS has overflow:hidden)
    useBodyScroll();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não conferem');
            return;
        }
        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create account
            const { error: signUpError } = await signUp(email, password, name);
            if (signUpError) {
                let msg = signUpError.message;
                if (msg.includes('already registered')) msg = 'Este e-mail já está cadastrado. Tente fazer login.';
                if (msg.includes('rate limit')) msg = 'Muitas tentativas. Aguarde alguns minutos.';
                toast.error(msg);
                setIsSubmitting(false);
                return;
            }

            // 2. Auto sign-in
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
                toast.error('Conta criada! Faça o login para continuar.');
                navigate('/login');
                return;
            }

            // 3. Create profile row
            const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
            const { data: { user: newUser } } = await supabaseRuntime.auth.getUser();
            if (newUser) {
                await supabaseRuntime.from('profiles').upsert({
                    user_id: newUser.id,
                    display_name: name,
                    is_profile_complete: false,
                    acquisition_source: 'whatsapp_group',
                }, { onConflict: 'user_id' });
            }

            // 4. Activate WhatsApp group Silver plan (no quiz yet — done after profile setup)
            setStep('activating');
            const { data: { session } } = await supabaseRuntime.auth.getSession();
            await supabaseRuntime.functions.invoke('activate-group-invite', {
                headers: { Authorization: `Bearer ${session?.access_token}` },
                body: {},
            });

            setStep('done');
        } catch (err) {
            console.error('Invite registration error:', err);
            toast.error('Erro inesperado. Tente novamente.');
            setIsSubmitting(false);
        }
    };

    const handleContinueToProfile = () => {
        navigate('/app/onboarding', { replace: true });
    };



    return (
        <div className="min-h-[100dvh] bg-[#0a0f1e] flex flex-col items-center justify-center px-4 py-8 relative overflow-y-auto">
            {/* Decorative blobs — fixed so they never clip scrollable content */}
            <div className="fixed top-[-15%] right-[-15%] w-[60%] h-[60%] bg-amber-400/8 blur-[140px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-[-15%] left-[-15%] w-[60%] h-[60%] bg-rose-500/6 blur-[140px] rounded-full pointer-events-none z-0" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[40%] bg-amber-300/3 blur-[100px] rounded-full pointer-events-none z-0" />

            <div className="w-full max-w-sm relative z-10">
                <AnimatePresence mode="wait">

                    {/* ── LANDING ── */}
                    {step === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                                className="mb-6"
                            >
                                <img
                                    src="/3logo-nova1080x1080.png"
                                    alt="Encontro com Fé"
                                    className="w-24 h-24 object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                                />
                            </motion.div>

                            {/* Invite badge */}
                            <div className="inline-flex items-center bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-5">
                                <span className="text-amber-300 text-xs font-semibold tracking-wide">Convite Aplicativo — Grupo Tinder</span>
                            </div>

                            <h1 className="text-3xl font-serif font-bold text-white mb-3 leading-tight">
                                Bem-vindo ao<br />
                                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                    Encontro com Fé
                                </span>
                            </h1>

                            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                                Por ser membro do nosso grupo, você recebe <strong className="text-amber-300">2 meses do Plano Prata gratuitamente</strong>. Crie sua conta e comece agora!
                            </p>

                            {/* Benefits */}
                            <div className="w-full space-y-3 mb-8">
                                {BENEFITS.map((b, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.08 }}
                                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <b.icon className={`w-4 h-4 ${b.color}`} />
                                        </div>
                                        <span className="text-white/80 text-sm leading-snug">{b.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <Button
                                onClick={() => setStep('register')}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Criar Minha Conta Grátis
                                <ChevronRight className="w-5 h-5" />
                            </Button>

                            <p className="text-white/30 text-xs mt-4">
                                Já tem conta?{' '}
                                <button onClick={() => navigate('/login')} className="text-amber-400 hover:underline">
                                    Fazer login
                                </button>
                            </p>
                        </motion.div>
                    )}

                    {/* ── REGISTER FORM ── */}
                    {step === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* Header */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <img
                                    src="/3logo-nova1080x1080.png"
                                    alt="Encontro com Fé"
                                    className="w-16 h-16 object-contain mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                                />
                                <div className="inline-flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 mb-3">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-300 text-xs font-medium">2 meses grátis</span>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-white">Crie sua conta</h2>
                                <p className="text-white/50 text-sm mt-1">Rápido e gratuito</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-sm">
                                    {/* Name */}
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Seu nome"
                                            className="pl-10 !bg-[#1a2235] !border-white/20 !text-white placeholder:!text-white/40 rounded-xl h-12 focus:!border-amber-400/60"
                                            required
                                            autoComplete="name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="pl-10 !bg-[#1a2235] !border-white/20 !text-white placeholder:!text-white/40 rounded-xl h-12 focus:!border-amber-400/60"
                                            required
                                            autoComplete="username"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Senha (mín. 6 caracteres)"
                                            className="pl-10 pr-10 !bg-[#1a2235] !border-white/20 !text-white placeholder:!text-white/40 rounded-xl h-12 focus:!border-amber-400/60"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirmar senha"
                                            className="pl-10 !bg-[#1a2235] !border-white/20 !text-white placeholder:!text-white/40 rounded-xl h-12 focus:!border-amber-400/60"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Criando conta…
                                        </>
                                    ) : (
                                        'Criar Conta e Ativar Plano'
                                    )}
                                </Button>
                            </form>

                            <button
                                onClick={() => setStep('landing')}
                                className="w-full text-center text-white/30 text-xs mt-4 hover:text-white/50"
                            >
                                ← Voltar
                            </button>
                        </motion.div>
                    )}

                    {/* ── ACTIVATING ── */}
                    {step === 'activating' && (
                        <motion.div
                            key="activating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-12"
                        >
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                                <div className="relative w-20 h-20 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Ativando seu plano…</h2>
                            <p className="text-white/50 text-sm">Aguentei um segundo, quase pronto!</p>
                        </motion.div>
                    )}

                    {/* ── DONE ── */}
                    {step === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="flex flex-col items-center text-center"
                        >
                            {/* Success icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 border-2 border-emerald-400/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
                            >
                                <CheckCircle2 className="w-11 h-11 text-emerald-400" />
                            </motion.div>

                            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-amber-300 text-xs font-semibold">Plano Prata Ativado — 2 meses grátis</span>
                            </div>

                            <h2 className="text-2xl font-serif font-bold text-white mb-2">
                                Conta criada com sucesso! 🎉
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                                Agora complete seu perfil para que encontremos pessoas compatíveis com você. Leva menos de 2 minutos!
                            </p>

                            {/* What's next */}
                            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Próximos passos</p>
                                {[
                                    'Complete seu perfil com suas informações',
                                    'Veja as pessoas compatíveis com você',
                                    'Curta e converse com matches',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <span className="text-white/70 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleContinueToProfile}
                                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-bold text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                            >
                                Completar Meu Perfil
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
