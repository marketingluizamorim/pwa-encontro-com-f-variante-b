import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermosDeUso() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Sobre o Encontro com Fé',
      content: `O Encontro com Fé é um aplicativo de relacionamentos cristão operado como um PWA (Progressive Web App). Diferente de aplicativos tradicionais, ele funciona diretamente no seu navegador de internet e pode ser facilmente instalado na tela inicial do seu dispositivo sem a necessidade de baixar arquivos pesados em lojas oficiais como App Store ou Google Play. 

Nossa missão é oferecer um ambiente seguro, respeitoso e alinhado aos princípios bíblicos para que cristãos solteiros possam se conectar, compartilhar experiências e construir relacionamentos sérios com pessoas que possuem os mesmos valores.`,
    },
    {
      title: '2. Elegibilidade e Cadastro',
      content: `Para utilizar o serviço, você declara ter pelo menos 18 anos de idade e ser solteiro(a), divorciado(a) ou viúvo(a). O uso da plataforma por pessoas casadas é estritamente proibido.

Você se compromete a fornecer informações verdadeiras sobre seu perfil, fotos recentes e intenções reais de relacionamento sério. Perfis falsos, "fakes" ou com intenções comerciais/golpistas serão banidos imediatamente.`,
    },
    {
      title: '3. Planos e Funcionalidades',
      content: `O acesso a funcionalidades específicas depende do plano contratado:

• Plano Bronze: Acesso básico para conhecer a plataforma.
• Plano Prata: Acesso intermediário com mais visibilidade e recursos de comunicação.
• Plano Ouro: Acesso premium com todas as funcionalidades desbloqueadas, incluindo filtros avançados e prioridade.

A descrição detalhada de cada plano e seus benefícios está disponível na página de assinatura. Reservamo-nos o direito de alterar os benefícios dos planos, mantendo o acesso contratado até o fim do período vigente.`,
    },
    {
      title: '4. Regras de Conduta (Código de Valores)',
      content: `Como uma comunidade cristã, esperamos comportamento exemplar de todos os membros:

• Respeito e Modéstia: Fotos e conversas devem manter o decoro cristão. Conteúdo sexualmente explícito, vulgar ou nudez é proibido.
• Honestidade: Não minta sobre sua idade, estado civil, fé ou localização.
• Segurança: Nunca envie dinheiro a outros usuários. Reporte perfis suspeitos imediatamente.
• Zero Tolerância: Assédio, discurso de ódio, racismo ou qualquer forma de discriminação resultará no banimento imediato e sem reembolso.`,
    },
    {
      title: '5. Pagamentos e Renovação',
      content: `O acesso às funcionalidades premium da plataforma é realizado através de planos de assinatura recorrente. Atualmente, disponibilizamos modalidades de assinatura Semanal ou Mensal, cujos valores e benefícios específicos variam de acordo com a oferta selecionada no momento da adesão.

As assinaturas possuem renovação automática ao final de cada período contratado (7 ou 30 dias). Você tem total liberdade para cancelar a renovação automática a qualquer momento através das configurações da sua conta para evitar cobranças futuras. O cancelamento interrompe cobranças futuras, mas seu acesso premium permanecerá ativo até o final do período já pago.`,
    },
    {
      title: '6. Segurança e Responsabilidade',
      content: `Embora verifiquemos perfis e utilizemos tecnologia para segurança, não realizamos checagem de antecedentes criminais de todos os usuários. Você é o único responsável por suas interações.

Recomendamos cautela ao marcar encontros presenciais (sempre em locais públicos) e ao compartilhar informações pessoais sensíveis (endereço, dados financeiros). A Plataforma não se responsabiliza por condutas de usuários fora do ambiente digital.`,
    },
    {
      title: '7. Política de Cancelamento',
      content: `Conforme o Código de Defesa do Consumidor (Art. 49), você tem direito de se arrepender da compra no prazo de 7 dias corridos após a contratação inicial.

Para solicitar o cancelamento e reembolso dentro deste prazo, entre em contato com nosso suporte. Após 7 dias, não há reembolso de valores pagos, exceto em casos de falha técnica comprovada da plataforma que impeça o uso.`,
    },
    {
      title: '8. Proteção de Dados',
      content: `Sua privacidade é prioridade. Seus dados são tratados conforme a LGPD. Não vendemos suas informações para terceiros. Suas conversas no chat são privadas e criptografadas. Consulte nossa Política de Privacidade completa para mais detalhes.`,
    },
    {
      title: '9. Contato',
      content: `Dúvidas, denúncias ou solicitações de suporte devem ser enviadas para:
E-mail: suporte.encontrocomfe@gmail.com
WhatsApp Oficial: +55 62 9826-8199`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#0f172a] overflow-y-auto font-sans">
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
            <Shield className="w-6 h-6 text-[#fcd34d]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Termos de Uso</h1>
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
              onClick={() => navigate('/politica-de-reembolso')}
              variant="outline"
              className="border-white/20 text-white bg-white/10 hover:bg-white/20"
            >
              Ver Política de Reembolso
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
