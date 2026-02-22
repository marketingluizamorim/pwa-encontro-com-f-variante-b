import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBodyScroll } from '@/hooks/useBodyScroll';
import { Loader2, Lock, Mail, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useBodyScroll();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Sign in
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                toast.error('Credenciais inválidas');
                setIsLoading(false);
                return;
            }

            // 2. Check admin role
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', authData.user.id)
                .eq('role', 'admin')
                .single();

            if (!roleData) {
                // Not admin — sign out immediately
                await supabase.auth.signOut();
                toast.error('Acesso negado. Esta conta não tem permissões de administrador.');
                setIsLoading(false);
                return;
            }

            // 3. Redirect to admin panel
            navigate('/admin', { replace: true });
        } catch {
            toast.error('Erro inesperado. Tente novamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4">
            {/* Background glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
                    <p className="text-white/40 text-sm mt-1">Acesso restrito a administradores</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-sm">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email de administrador"
                                className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/30 rounded-xl h-12 focus:border-red-400/50"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha"
                                className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/30 rounded-xl h-12 focus:border-red-400/50"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl bg-red-500/90 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-[0_8px_30px_rgba(239,68,68,0.25)] transition-all active:scale-95 disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Verificando…
                            </>
                        ) : (
                            'Entrar no Painel'
                        )}
                    </Button>
                </form>

                <p className="text-center text-white/20 text-xs mt-6">
                    Encontro com Fé · Acesso Administrativo
                </p>
            </div>
        </div>
    );
}
