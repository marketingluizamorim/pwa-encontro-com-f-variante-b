import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCcw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PoliticaDeReembolso() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Sua Satisfação Garantida (7 Dias)',
      content: `Queremos que você tenha certeza de que o Encontro com Fé é o lugar certo para você. Por isso, oferecemos uma Garantia Incondicional de 7 Dias.

Se por qualquer motivo você não ficar satisfeito(a) com a plataforma nos primeiros 7 dias após a assinatura do seu plano, você pode solicitar o reembolso total do valor pago. Sem letras miúdas, sem burocracia.`,
    },
    {
      title: '2. Como Funciona o Reembolso',
      content: `O reembolso é válido para a primeira contratação de qualquer plano (Bronze, Prata ou Ouro).

1. Solicitação: Entre em contato conosco dentro do prazo de 7 dias corridos após a compra.
2. Processamento: Nossa equipe confirmará seus dados e iniciará o estorno.
3. Devolução:
   • Cartão de Crédito: O estorno aparecerá na sua fatura (pode levar de 1 a 2 faturas dependendo do banco).
   • PIX: Devolução na conta de origem em até 3 dias úteis.
   
Após o reembolso, seu acesso às funcionalidades pagas será encerrado e sua conta voltará ao status gratuito ou será inativada, a seu critério.`,
    },
    {
      title: '3. Cancelamento de Assinatura',
      content: `Se você possui um plano com renovação automática (Semanal, Mensal), você pode cancelar a renovação a qualquer momento para evitar futuras cobranças.

Como fazer: Acesse as Configurações do seu Perfil > Assinatura > Cancelar Renovação.

Importante: O cancelamento da renovação não gera reembolso dos dias restantes do período já pago. Você continuará tendo acesso normal ao plano até a data de expiração, e ele simplesmente não será renovado depois disso.`,
    },
    {
      title: '4. Exceções',
      content: `• Solicitações feitas após o prazo de 7 dias não são elegíveis para reembolso, exceto em casos de problemas técnicos comprovados que impeçam o uso da plataforma e que não puderam ser resolvidos pelo suporte.
• Banimento por violação dos Termos de Uso (ex: comportamento ofensivo, nudez, golpes) anula o direito ao reembolso, pois constitui quebra de contrato.`,
    },
    {
      title: '5. Canais de Solicitação',
      content: `Para pedir seu reembolso ou tirar dúvidas sobre pagamentos, utilize exclusivamente nossos canais oficiais:

E-mail: suporte.encontrocomfe@gmail.com
WhatsApp: +55 62 9826-8199

Ao solicitar, informe seu e-mail de cadastro e o motivo (opcional, apenas para melhorarmos nosso serviço).`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Background Ambience - Clean & Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main ambient light - Top Center (Teal/Blue mix) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-[#0f172a]/0 to-transparent blur-[90px]" />

        {/* Bottom warm light - (Amber/Gold mix) for grounding */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/15 via-[#0f172a]/0 to-transparent blur-[110px]" />

        {/* Global Noise Texture for cinematic feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-2xl border-b border-white/10"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-6 h-6 text-[#fcd34d]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Política de Reembolso</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 border border-white/10"
        >
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#fcd34d]/20 to-[#b45309]/20 mb-4 ring-1 ring-[#fcd34d]/30">
              <FileText className="w-8 h-8 text-[#fcd34d]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tight">
              Política de Reembolso
            </h2>
            <p className="text-white/60 text-sm">
              Última atualização: 12/04/2025
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-xl font-serif font-bold text-[#fcd34d] mb-3">
                  {section.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 bg-[#fcd34d]/10 rounded-2xl border border-[#fcd34d]/20"
          >
            <p className="text-[#fcd34d] text-sm text-center font-medium">
              ⚠️ Aviso Legal: Este conteúdo é um resumo prático e não substitui aconselhamento jurídico.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm"
          >
            <Mail className="w-4 h-4" />
            <span>suporte.encontrocomfe@gmail.com</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={() => navigate('/termos-de-uso')}
              variant="outline"
              className="border-white/20 text-white bg-white/10 hover:bg-white/20"
            >
              Ver Termos de Uso
            </Button>
            <Button
              onClick={() => navigate('/v1/planos')}
              className="bg-gradient-to-r from-[#14b8a6] via-[#0d9488] to-[#f59e0b] hover:opacity-90 text-white border border-white/20 shadow-lg shadow-orange-500/20"
            >
              Voltar para Planos
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
