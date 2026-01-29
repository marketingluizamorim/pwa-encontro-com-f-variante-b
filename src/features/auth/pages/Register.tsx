import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Pre-fill from checkout redirect
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (nameParam) setName(decodeURIComponent(nameParam));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
      setLoading(false);
    } else {
      toast.success('Conta criada com sucesso!');
      // New users go to onboarding first
      navigate('/app/onboarding', { replace: true });
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
          <h1 className="font-display text-3xl text-white font-bold">Crie sua conta</h1>
          <p className="text-white/80 mt-2">E encontre seu par ideal</p>
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
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                required
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
              Criar Conta
            </Button>
          </div>
        </form>

        {/* Links */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Faça login
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
