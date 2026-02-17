import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/discover';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Erro ao fazer login');
      setIsSubmitting(false);
    } else {
      toast.success('Login realizado com sucesso!', {
        style: {
          marginTop: '50px',
        },
      });
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Divine Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#d4af37]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#14b8a6]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="flex flex-col items-center gap-6 mb-8"
        >
          <div className="relative group cursor-pointer">
            {/* Divine Halo Effect */}
            <div className="absolute inset-0 bg-[#d4af37]/40 blur-3xl rounded-full scale-150 animate-pulse-slow" style={{ animationDuration: '4s' }} />
            <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-3xl flex items-center justify-center border border-white/30 shadow-inner overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine pointer-events-none" />
                <Heart className="w-10 h-10 text-white fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-3xl font-serif text-white font-bold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
              Encontro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37] drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">com Fé</span>
            </h1>
            <p className="text-white/90 text-sm font-light tracking-wide drop-shadow-md">
              Faça login para continuar
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass rounded-2xl p-6 space-y-4">
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
                placeholder="••••••••"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                required
                autoComplete="current-password"
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
              Entrar
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="text-center mt-6 space-y-2">
          <Link to="/forgot-password" className="text-white/80 hover:text-white text-sm block">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
