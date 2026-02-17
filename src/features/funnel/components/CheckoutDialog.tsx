import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { ChevronDown, ChevronUp, Lock, ShieldCheck, Check } from 'lucide-react';

// Female display photos by age range
import femaleDisplay18_25 from '@/assets/match-female-18-25-display.jpg';
import femaleDisplay26_35 from '@/assets/match-female-26-35-display.jpg';
import femaleDisplay36_55 from '@/assets/match-female-36-55-display.jpg';
import femaleDisplay56Plus from '@/assets/match-female-56-plus-display.jpg';

// Male display photos by age range
import maleDisplay18_25 from '@/assets/match-male-18-25-display.jpg';
import maleDisplay26_35 from '@/assets/match-male-26-35-display.jpg';
import maleDisplay36_55 from '@/assets/match-male-36-55-display.jpg';
import maleDisplay56Plus from '@/assets/match-male-56-plus-display.jpg';

// Get display photo based on gender and age from quiz
const getDisplayPhoto = (gender: 'male' | 'female' | null, age: string | undefined): string => {
  // Show opposite gender photos
  if (gender === 'male') {
    // Male user sees female photos
    switch (age) {
      case '18-25': return femaleDisplay18_25;
      case '36-55': return femaleDisplay36_55;
      case '56+': return femaleDisplay56Plus;
      default: return femaleDisplay26_35;
    }
  } else {
    // Female user sees male photos
    switch (age) {
      case '18-25': return maleDisplay18_25;
      case '36-55': return maleDisplay36_55;
      case '56+': return maleDisplay56Plus;
      default: return maleDisplay26_35;
    }
  }
};

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planPrice: number;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  isLoading?: boolean;
  planName?: string;
  orderBumps?: { allRegions: boolean; grupoEvangelico: boolean; grupoCatolico: boolean };
  initialData?: { name: string; email: string; phone: string };
}

function generateTempEmail(): string {
  const random = Math.random().toString(36).substring(2, 6);
  const timestamp = Date.now().toString(36).slice(-4);
  return `user${random}${timestamp}@temporario.com`;
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  planPrice,
  onSubmit,
  isLoading,
  planName,
  orderBumps,
  initialData
}: CheckoutDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Update fields when initialData changes
  // Resetar estados internos quando o plano ou a abertura mudarem
  useEffect(() => {
    if (open) {
      setErrors({});
      setExtrasExpanded(false);

      if (initialData) {
        setName(initialData.name || '');
        setEmail(initialData.email || '');
        const cleanPhone = initialData.phone.replace('+55 ', '').replace('+55', '');
        setPhone(formatPhone(cleanPhone));
      }
    }
  }, [open, initialData, planPrice, planName]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extrasExpanded, setExtrasExpanded] = useState(false);

  const { gender, quizAnswers } = useFunnelStore();
  const displayPhoto = getDisplayPhoto(gender, quizAnswers.age);

  // Calculate extras
  // Identificação robusta do plano
  const cleanPlanName = planName?.toLowerCase() || '';
  const isOuroPlan = cleanPlanName.includes('ouro') || planPrice >= 40;
  const isSilverPlan = cleanPlanName.includes('prata') || (planPrice >= 20 && planPrice < 40);
  const isBronzePlan = cleanPlanName.includes('bronze') || planPrice < 20;

  const hasExtras = orderBumps?.allRegions || orderBumps?.grupoEvangelico || orderBumps?.grupoCatolico;
  const extrasCount = (orderBumps?.allRegions ? 1 : 0) + (orderBumps?.grupoEvangelico ? 1 : 0) + (orderBumps?.grupoCatolico ? 1 : 0);

  // Se for Prata ou Ouro, não cobra extras (já estão inclusos)
  const isPackagePlan = isOuroPlan || isSilverPlan;
  const extrasTotal = isPackagePlan ? 0 : ((orderBumps?.allRegions ? 5 : 0) + (orderBumps?.grupoEvangelico ? 5 : 0) + (orderBumps?.grupoCatolico ? 5 : 0));

  // O basePlanPrice deve ser o preço do plano sem os bumps opcionais (apenas se não for pacote)
  const basePlanPrice = isPackagePlan ? planPrice : (planPrice - extrasTotal);

  const handleGenerateTempEmail = () => {
    setEmail(generateTempEmail());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, email, phone: '+55 ' + phone });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2rem] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden top-[5%] translate-y-0 data-[state=open]:slide-in-from-top-[0%] data-[state=closed]:slide-out-to-top-[0%]">
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-serif text-center text-2xl font-semibold text-white tracking-tight">
              Finalizar Assinatura
            </DialogTitle>
          </DialogHeader>

          {/* Profile Preview Card - Compact */}
          <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-xl mb-3 backdrop-blur-sm">
            <div className="relative">
              {/* Stacked blurred avatars - offset to bottom-right */}
              <img src={displayPhoto} alt="" className="absolute top-2 left-6 w-8 h-8 rounded-full object-cover blur-sm opacity-40 border border-white/10" />
              <img src={displayPhoto} alt="" className="absolute top-1 left-3 w-9 h-9 rounded-full object-cover blur-[2px] opacity-60 border border-white/20" />

              {/* Main visible avatar */}
              <div className="relative z-10 w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-[#fcd34d] to-[#b45309]">
                <img src={displayPhoto} alt="Perfil" className="w-full h-full rounded-full object-cover border-2 border-[#0f172a]" />
              </div>

              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 z-20 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-semibold text-white">+5 perfis esperando</p>
              <p className="text-[10px] text-white/60 font-light mt-0.5">Desbloqueie para conversar</p>
            </div>
          </div>

          {/* Order Summary - Compact */}
          <div className="bg-black/20 rounded-xl p-3 mb-3 border border-white/5">
            <h4 className="text-xs font-semibold text-white/90 mb-2 border-b border-white/5 pb-1">Resumo:</h4>
            <div className="space-y-1 text-xs">
              {planName && (
                <div className="flex justify-between">
                  <span className="text-white/70">{planName} {planName.toLowerCase().includes('bronze') ? '(Semanal)' : '(Mensal)'}</span>
                  <span className="text-white font-medium">R$ {basePlanPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {hasExtras && (
                <>
                  <button
                    type="button"
                    onClick={() => setExtrasExpanded(!extrasExpanded)}
                    className="flex justify-between items-center w-full text-left hover:bg-white/5 -mx-1 px-1 rounded transition-colors group"
                  >
                    <span className="text-[#fcd34d]/80 text-[10px] flex items-center gap-1 group-hover:text-[#fcd34d] transition-colors font-medium">
                      {isPackagePlan ? 'Recursos Incluídos' : `Extras (${extrasCount})`}
                      {extrasExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                    {!isPackagePlan && <span className="text-[#fcd34d] font-medium text-[10px]">R$ {extrasTotal.toFixed(2).replace('.', ',')}</span>}
                  </button>
                  {extrasExpanded && (
                    <div className="pl-2 space-y-1 border-l-2 border-[#fcd34d]/20 ml-1 py-1 mt-1">
                      {isOuroPlan ? (
                        <>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Todos os recursos do Plano Prata</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Enviar mensagem sem curtir antes</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Ver perfis online recentemente</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Filtro por distância e interesses</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Perfil em destaque</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Filtros avançados (idade e distância)</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Filtro por objetivo (Namoro ou Casamento)</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          {/* Bônus Exclusivos Ouro */}
                          <div className="mt-2 pt-2 border-t border-white/5">
                            <p className="text-[#fcd34d] text-[9px] font-bold uppercase tracking-wider mb-1">Bônus Exclusivos:</p>
                            <div className="space-y-1">
                              <p className="text-white/40 text-[9px]">• Comunidade cristã no WhatsApp</p>
                              <p className="text-white/40 text-[9px]">• Cursos bíblicos exclusivos</p>
                              <p className="text-white/40 text-[9px]">• Devocionais diários</p>
                              <p className="text-white/40 text-[9px]">• Dicas de relacionamento cristão</p>
                            </div>
                          </div>
                        </>
                      ) : isSilverPlan ? (
                        <>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Ver quem curtiu você</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Curtidas ilimitadas</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Enviar ou receber fotos e áudios</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Filtro por cidade / região</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Fazer chamadas de voz e vídeo</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="flex justify-between text-white/60 text-[10px]">
                            <span>Comunidade cristã no WhatsApp</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                        </>
                      ) : (
                        <>
                          {orderBumps?.allRegions && (
                            <div className="flex justify-between text-white/60 text-[10px]">
                              <span>Desbloquear Região</span>
                              <span>R$ 5,00</span>
                            </div>
                          )}
                          {orderBumps?.grupoEvangelico && (
                            <div className="flex justify-between text-white/60 text-[10px]">
                              <span>Grupo Evangélico</span>
                              <span>R$ 5,00</span>
                            </div>
                          )}
                          {orderBumps?.grupoCatolico && (
                            <div className="flex justify-between text-white/60 text-[10px]">
                              <span>Grupo Católico</span>
                              <span>R$ 5,00</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pb-40">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-white/90 pl-1 text-sm font-medium">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo..."
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] h-14 rounded-xl backdrop-blur-md transition-all text-sm ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 pl-1">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/90 pl-1 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] h-14 rounded-xl backdrop-blur-md transition-all text-sm ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400 pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/90 pl-1 text-sm font-medium">Telefone</Label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/20 rounded-l-xl text-sm text-white/80 font-medium h-14">
                  +55
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className={`rounded-l-none bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] h-14 rounded-r-xl backdrop-blur-md transition-all text-sm ${errors.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  maxLength={15}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400 pl-1">{errors.phone}</p>}
            </div>
          </form>
        </div>

        {/* Footer (Fixed) */}
        <div className="p-3 bg-[#0f172a] border-t border-white/10 absolute bottom-0 left-0 right-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 font-medium text-sm">Total:</span>
            <span className="text-xl font-sans font-semibold text-[#fcd34d] drop-shadow-md">R$ {planPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl gradient-button text-white transition-all uppercase tracking-wide text-sm font-semibold border-0 hover:opacity-90"
          >
            {isLoading ? (
              <><i className="ri-loader-4-line animate-spin mr-2" /> Processando...</>
            ) : (
              <div className="flex items-center gap-2">
                <span>Finalizar Pagamento</span>
                <Lock className="w-5 h-5" />
              </div>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/50">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Pagamento 100% seguro via PIX</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
