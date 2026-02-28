import { useState, useEffect, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const APP_A_URL = import.meta.env.VITE_APP_A_URL || "https://pwa-encontro-com-f.vercel.app";

// Supabase A — acesso via Edge Function, não direto no frontend
// A criação da conta no A é feita pela Edge Function provision-user-on-a

const BackgroundBlobs = memo(() => (
    <>
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #0d9488, transparent)" }} />
    </>
));

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pré-preenche email e nome vindos do ThankYouDialog
    useEffect(() => {
        const emailParam = searchParams.get("email");
        const nameParam = searchParams.get("name");
        if (emailParam) setEmail(decodeURIComponent(emailParam));
        if (nameParam) setName(decodeURIComponent(nameParam));
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Chama Edge Function do Supabase B que cria o usuário no Supabase A
            const { data, error } = await supabase.functions.invoke("provision-user-on-a", {
                body: { email, name, password },
            });

            if (error || !data?.ok) {
                throw new Error(error?.message || data?.error || "Erro ao criar conta.");
            }

            toast.success("Conta criada com sucesso! Redirecionando...");

            // Aguarda 2s e redireciona para login no app A
            setTimeout(() => {
                window.location.href = `${APP_A_URL}/login?email=${encodeURIComponent(email)}&welcome=1`;
            }, 2000);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erro inesperado.";

            if (message.includes("already registered") || message.includes("already exists")) {
                toast.error("Este e-mail já possui uma conta. Faça login no app.");
                setTimeout(() => {
                    window.location.href = `${APP_A_URL}/login?email=${encodeURIComponent(email)}`;
                }, 2000);
            } else {
                toast.error("Não foi possível criar sua conta. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
            <BackgroundBlobs />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm z-10"
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src="/3logo-nova1080x1080.png" alt="Encontro com Fé" className="w-16 h-16 object-contain" />
                </div>

                {/* Título */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
                    <p className="text-slate-400 text-sm">Você está a um passo de encontrar seu par ideal</p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Nome</label>
                        <Input
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">E-mail</label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Senha</label>
                        <Input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Confirmar Senha</label>
                        <Input
                            type="password"
                            placeholder="Repita a senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-base font-bold text-white mt-2"
                        style={{ background: "linear-gradient(135deg, #0d9488, #f59e0b)" }}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando conta...</>
                        ) : (
                            "CRIAR CONTA"
                        )}
                    </Button>
                </form>

                {/* Disclaimer */}
                <div className="mt-6 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
                    <p className="text-amber-400 text-xs text-center">
                        ⚠️ Não saia desta página. Uma cópia do acesso foi enviada ao seu e-mail.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
