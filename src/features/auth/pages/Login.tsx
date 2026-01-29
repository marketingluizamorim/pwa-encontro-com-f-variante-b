import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/discover';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Erro ao fazer login');
      setLoading(false);
    } else {
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen gradient-welcome flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <i className="ri-hearts-fill text-4xl text-white" />
          </div>
          <h1 className="font-display text-3xl text-white font-bold">Encontro com Fé</h1>
          <p className="text-white/80 mt-2">Faça login para continuar</p>
        </div>

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
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-button text-white font-semibold py-6"
            >
              {loading ? (
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
          <p className="text-white/80 text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-white font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Back to funnel */}
        <div className="text-center mt-8">
          <Link to="/" className="text-white/60 hover:text-white text-sm inline-flex items-center gap-1">
            <i className="ri-arrow-left-line" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
