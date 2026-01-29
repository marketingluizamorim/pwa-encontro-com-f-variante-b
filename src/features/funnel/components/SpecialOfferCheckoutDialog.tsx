import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Lock, ShieldCheck } from 'lucide-react';

interface SpecialOfferCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  isLoading?: boolean;
}

const SPECIAL_BENEFITS = [
  'Desbloquear Região',
  'Grupo Evangélico',
  'Grupo Católico',
  'Acesso Vitalício',
];

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export function SpecialOfferCheckoutDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: SpecialOfferCheckoutDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onSubmit({ name, email, phone: '+55 ' + phone });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2rem] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden top-[5%] translate-y-0 data-[state=open]:slide-in-from-top-[0%] data-[state=closed]:slide-out-to-top-[0%]">
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-serif text-center text-2xl font-bold text-white tracking-tight">
              Finalizar Oferta Especial
            </DialogTitle>
          </DialogHeader>

          {/* Offer Summary */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white/90">Pacote Completo</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-sans font-bold text-[#fcd34d] drop-shadow-md">R$ 9,90</span>
                <span className="text-xs text-white/40 line-through">R$ 24,90</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-white/80">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pb-40">
            <div className="space-y-1.5">
              <Label htmlFor="special-name" className="text-white/90 pl-1 text-sm font-medium">Nome completo</Label>
              <Input
                id="special-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo..."
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] h-14 rounded-xl backdrop-blur-md transition-all text-sm ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 pl-1">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="special-email" className="text-white/90 pl-1 text-sm font-medium">Email</Label>
              <Input
                id="special-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-[#fcd34d] focus:ring-1 focus:ring-[#fcd34d] h-14 rounded-xl backdrop-blur-md transition-all text-sm ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400 pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="special-phone" className="text-white/90 pl-1 text-sm font-medium">Telefone</Label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/20 rounded-l-xl text-sm text-white/80 font-medium h-14">
                  +55
                </span>
                <Input
                  id="special-phone"
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
            <span className="text-xl font-sans font-bold text-[#fcd34d] drop-shadow-md">R$ 9,90</span>
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl gradient-button text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all uppercase tracking-wide text-sm font-bold border border-white/20"
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
