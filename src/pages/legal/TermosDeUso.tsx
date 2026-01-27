import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermosDeUso() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Quem somos',
      content: `Encontro com Fé ("Aplicativo") é uma plataforma de acesso digital que conecta pessoas com valores cristãos através de grupos no WhatsApp e conteúdos exclusivos de relacionamento, sendo o acesso realizado mediante contratação de planos.`,
    },
    {
      title: '2. Aceite dos termos',
      content: 'Ao criar uma conta, contratar um plano ou acessar qualquer conteúdo, você concorda com estes Termos e com a Política de Reembolso. Estes Termos constituem um acordo legal entre você e a plataforma.',
    },
    {
      title: '3. Serviços e planos',
      content: 'Oferecemos acesso a grupos e áreas exclusivas conforme o plano contratado (semanal, mensal ou anual).\n\nO Plano Adicional libera o grupo do seu próprio estado, além de bônus de acesso permanente à comunidade, independentemente da validade do plano principal.',
    },
    {
      title: '4. Cadastro e conta',
      content: 'Você é responsável por todas as atividades realizadas na sua conta.\n\nÉ proibido compartilhar acesso, praticar spam, assédio, ofensas, conteúdos impróprios ou qualquer violação à legislação vigente. O descumprimento gera sanções sem reembolso fora do período legal.',
    },
    {
      title: '5. Pagamentos e renovações',
      content: 'Os pagamentos podem ser realizados via PIX, cartão ou boleto, conforme opções disponíveis no checkout.\n\nApós a confirmação da compra, o acesso à comunidade é liberado automaticamente, e você será redirecionado para a página de acesso. Também enviamos um e-mail de confirmação e uma mensagem no WhatsApp com os dados do seu plano e instruções de uso.\n\nAlguns planos podem ter renovação automática, quando informado no momento da compra. Caso não deseje renovar, é possível cancelar antes da próxima cobrança pelos canais informados.',
    },
    {
      title: '6. Cancelamento e reembolso',
      content: 'Os reembolsos seguem o prazo legal de 7 (sete) dias contados a partir da contratação, conforme o Código de Defesa do Consumidor.\n\nApós esse período, não há obrigatoriedade legal de devolução, salvo casos previstos em lei ou falhas comprovadas no serviço. Veja a Política de Reembolso para mais detalhes.',
    },
    {
      title: '7. Uso adequado e sanções',
      content: 'A violação das regras ou condutas inadequadas poderá resultar em advertência, suspensão ou encerramento da conta, sem direito a reembolso fora do período legal.',
    },
    {
      title: '8. Limitação de responsabilidade',
      content: 'Os serviços são fornecidos "como estão", sem garantias de resultados pessoais. Interrupções temporárias podem ocorrer por motivos técnicos ou de manutenção.',
    },
    {
      title: '9. Privacidade',
      content: 'Tratamos seus dados conforme a Lei Geral de Proteção de Dados (LGPD). Para mais informações, consulte nossa Política de Privacidade.',
    },
    {
      title: '10. Alterações nos Termos',
      content: 'Podemos atualizar estes Termos periodicamente. A data de atualização será informada no topo do documento, e você poderá revisar as alterações antes de continuar usando a plataforma.',
    },
    {
      title: '11. Lei aplicável e foro',
      content: 'Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro da comarca do consumidor.',
    },
  ];

  return (
    <div className="min-h-screen gradient-welcome">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border-b border-white/10"
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
            <Shield className="w-6 h-6 text-amber-light" />
            <h1 className="text-xl font-bold text-white">Termos de Uso</h1>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
        >
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <FileText className="w-8 h-8 text-amber-light" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Termos de Uso
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
                className="bg-white/5 rounded-2xl p-5 border border-white/5"
              >
                <h3 className="text-lg font-semibold text-amber-light mb-3">
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
            className="mt-8 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20"
          >
            <p className="text-amber-light text-sm text-center font-medium">
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
              onClick={() => navigate('/politica-de-reembolso')}
              variant="outline"
              className="border-white/20 text-white bg-white/10 hover:bg-white/20"
            >
              Ver Política de Reembolso
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
