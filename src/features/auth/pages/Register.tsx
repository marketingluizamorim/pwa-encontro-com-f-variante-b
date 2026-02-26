import { useState, useEffect, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { AccountCreatedDialog } from '@/features/auth/components/AccountCreatedDialog';

// Memoized background to prevent re-renders on every keystroke
const BackgroundBlobs = memo(() => (
  <>
    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none" style={{ willChange: 'filter' }} />
    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[80px] rounded-full pointer-events-none" style={{ willChange: 'filter' }} />
  </>
));

export default function Register() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pre-fill from checkout redirect
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) setName(decodeURIComponent(nameParam));
  }, [searchParams]);

  // No longer auto-redirecting here to allow handleSubmit to finish linking purchases
  // useEffect(() => {
  //   if (!loading && user) {
  //     navigate('/app/onboarding', { replace: true });
  //   }
  // }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem', { style: { marginTop: '50px' } });
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres', { style: { marginTop: '50px' } });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: signUpData, error } = await signUp(email, password, name);

      if (error) {
        console.error('Registration error:', error);
        let errorMessage = error.message || 'Erro ao criar conta';

        // Translate common Supabase errors
        if (errorMessage.includes('rate limit')) {
          errorMessage = 'Muitas tentativas recentes. Por favor, aguarde alguns minutos antes de tentar novamente.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
        }

        toast.error(errorMessage, { style: { marginTop: '50px' } });
      } else {
        // Account created successfully.
        // 1. Check if we need to manually sign in (usually signUp auto-logs in)
        if (!signUpData?.session) {
          const { error: signInError } = await signIn(email, password);
          if (signInError) {
            toast.success('Conta criada com sucesso! Faça login para continuar.', { style: { marginTop: '50px' } });
            navigate('/login');
            return;
          }
        }

        // Success
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
        setShowSuccessDialog(true);
      }
    } catch (err) {
      console.error('[Register] Unexpected error:', err);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/app/onboarding', { replace: true });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Divine Background Elements — memoized to avoid input lag */}
      <BackgroundBlobs />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        {/* Logo */}
        <div
          className="flex flex-col items-center gap-6 mb-8"
        >
          <div className="relative cursor-pointer">
            <img
              src="/3logo-nova1080x1080.png"
              alt="Encontro com Fé"
              className="w-20 h-20 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] logo-blend"
            />
          </div>

          <div className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-tight drop-shadow-lg">
              Crie sua conta
            </h1>
            <p className="text-white/80 mt-2 font-light">Você está a um passo de encontrar seu par ideal</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/90 text-sm mb-1 block">Nome</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400/60 focus-visible:ring-0"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-white/90 text-sm mb-1 block">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400/60 focus-visible:ring-0"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-white/90 text-sm mb-1 block">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400/60 focus-visible:ring-0"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="text-white/90 text-sm mb-1 block">Confirmar Senha</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400/60 focus-visible:ring-0"
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
                <i className="ri-loader-4-line animate-spin mr-2" />
              ) : null}
              Criar Conta
            </Button>
          </div>
        </form>

        {/* Disclaimer Area */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0 }}
          className="mt-6 text-center px-4"
        >
          <p className="text-white/40 text-[11px] flex items-center justify-center gap-2 bg-black/20 rounded-full py-1.5 px-4 backdrop-blur-sm inline-flex border border-white/5 mx-auto">
            <AlertTriangle className="w-3 h-3 text-amber-500/80 shrink-0" />
            <span>Não saia desta página. Uma cópia do acesso foi enviada ao seu e-mail.</span>
          </p>
        </motion.div>
      </div>

      <AccountCreatedDialog
        open={showSuccessDialog}
        name={name}
        onContinue={handleContinue}
      />
    </div>
  );
}
