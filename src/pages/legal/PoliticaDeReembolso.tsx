import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCcw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PoliticaDeReembolso() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Visão geral',
      content: `Respeitamos o Código de Defesa do Consumidor (CDC). Para compras digitais realizadas online, o consumidor tem direito ao arrependimento em até 7 (sete) dias corridos a contar da contratação, podendo solicitar reembolso integral do valor pago.

Após a compra e confirmação do pagamento, o acesso ao serviço é disponibilizado automaticamente por meio de redirecionamento, além de um e-mail de confirmação e uma mensagem no WhatsApp com as instruções de uso.`,
    },
    {
      title: '2. Quem tem direito',
      content: `Todos os planos (semanal, mensal e anual) são reembolsáveis em até 7 dias após a contratação.

O Plano Adicional (Estado + Acesso Permanente à Comunidade) também segue esse mesmo prazo legal.`,
    },
    {
      title: '3. Como solicitar',
      content: `Para pedir reembolso, envie um e-mail para o nosso suporte com os seguintes dados:

Para: suporte@encontrocomfe.com
Assunto: "Reembolso – [seu e-mail ou telefone cadastrado]"

Inclua no corpo do e-mail:
• Nome completo
• E-mail ou telefone usado na compra
• Data da compra
• Plano adquirido
• Motivo do cancelamento (opcional)

Após o envio, nossa equipe irá confirmar os dados e cancelar seu acesso.`,
    },
    {
      title: '4. Prazos de devolução',
      content: `Após a confirmação do cancelamento:

• PIX ou transferência: devolução em até 3 dias corridos
• Cartão, boleto ou outros métodos (quando aplicável): conforme regras do intermediador de pagamento ou bandeira

Sempre que possível, o reembolso será feito pelo mesmo meio utilizado na compra.`,
    },
    {
      title: '5. Após 7 dias',
      content: `Passado o prazo legal de 7 dias, não há obrigatoriedade de reembolso, salvo em casos previstos em lei — por exemplo, falha comprovada na entrega do serviço ("vício").

Nessas situações, analisaremos o caso e aplicaremos a solução adequada conforme o CDC: correção da falha, abatimento proporcional ou cancelamento.`,
    },
    {
      title: '6. Condutas vedadas',
      content: 'Em caso de uso indevido, como spam, assédio, ofensas, violação das regras da comunidade ou da legislação, o acesso pode ser suspenso ou encerrado, sem direito a reembolso fora do prazo legal.',
    },
    {
      title: '7. Suporte e dúvidas',
      content: `E-mail: suporte@encontrocomfe.com
WhatsApp: +55 62 9826-8199`,
    },
  ];

  return (
    <div className="min-h-screen gradient-welcome">
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
            <span>suporte@encontrocomfe.com</span>
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
              className="gradient-button text-white"
            >
              Voltar para Planos
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
