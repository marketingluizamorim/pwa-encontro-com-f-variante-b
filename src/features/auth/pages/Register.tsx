import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { AccountCreatedDialog } from '@/features/auth/components/AccountCreatedDialog';
import { applyQuizDataToStore } from '@/features/funnel/utils/syncQuizData';

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

  // Pre-fill from checkout redirect
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) setName(decodeURIComponent(nameParam));
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/app/discover', { replace: true });
    }
  }, [user, loading, navigate]);

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

    const { error } = await signUp(email, password, name);

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
      setIsSubmitting(false);
    } else {
      // Account created successfully.
      // 1. Try to auto-login immediately for better UX
      const { error: signInError } = await signIn(email, password);

      if (!signInError) {
        // Ensure profile is created with the provided name
        try {
          const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
          const { data: { user } } = await supabaseRuntime.auth.getUser();

          if (user) {
            await supabaseRuntime.from('profiles').upsert({
              user_id: user.id,
              display_name: name,
              is_profile_complete: false
            }, { onConflict: 'user_id' });
          }
        } catch (err) {
          console.error('Error creating profile row:', err);
        }

        // 2. Check for existing PAID purchases and link them
        try {
          const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
          const { data: { user } } = await supabaseRuntime.auth.getUser();

          if (user) {
            // Find PAID purchases for this email that don't have a user_id yet
            const { data: purchases } = await supabaseRuntime
              .from('purchases')
              .select('*')
              .eq('user_email', email)
              .eq('payment_status', 'PAID')
              .is('user_id', null);

            if (purchases && purchases.length > 0) {
              console.log('Found paid purchases to link:', purchases.length);

              for (const purchase of purchases) {
                // Link purchase to user
                await supabaseRuntime
                  .from('purchases')
                  .update({ user_id: user.id })
                  .eq('id', purchase.id);

                // Sync quiz_data from purchase into funnelStore (works cross-device)
                if (purchase.quiz_data && typeof purchase.quiz_data === 'object') {
                  applyQuizDataToStore(purchase.quiz_data as Record<string, unknown>);
                }

                // Force subscription activation via Edge Function
                await supabaseRuntime.functions.invoke('check-payment-status', {
                  body: { paymentId: purchase.payment_id }
                });
              }
            }
          }
        } catch (err) {
          console.error('Error linking purchase after registration:', err);
        }

        // Logged in! Show success dialog which will redirect to onboarding
        setShowSuccessDialog(true);
      } else {
        // Could not auto-login (likely verify email required), but account created.
        // Still show success, but maybe redirect to login instead?
        // User requested "popup to proceed creating profile", implying flow continuity.
        // We will show dialog, and if they click continue, we try ensuring flow.
        toast.success('Conta criada com sucesso!', { style: { marginTop: '50px' } });
        setShowSuccessDialog(true);
      }
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/app/onboarding', { replace: true });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Divine Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        {/* Logo */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
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
        </motion.div>

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
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
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
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
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
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
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
