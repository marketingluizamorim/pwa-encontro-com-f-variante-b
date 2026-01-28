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
import { Check, Gift } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, email, phone: '+55 ' + phone });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-center flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Finalizar Oferta Especial
          </DialogTitle>
        </DialogHeader>

        {/* Offer Summary */}
        <div className="bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Pacote Completo</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">R$ 9,90</span>
              <span className="text-sm text-muted-foreground line-through">R$ 24,90</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {SPECIAL_BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-foreground">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="special-name">Nome completo</Label>
            <Input
              id="special-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-email">Email</Label>
            <Input
              id="special-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-phone">Telefone</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                +55
              </span>
              <Input
                id="special-phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(XX) XXXXX-XXXX"
                className={`rounded-l-none ${errors.phone ? 'border-destructive' : ''}`}
                maxLength={15}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button text-primary-foreground py-6 text-lg font-semibold"
            >
              {isLoading ? (
                <><i className="ri-loader-4-line animate-spin mr-2" /> Processando...</>
              ) : (
                <>Pagar R$ 9,90 <i className="ri-lock-fill ml-2" /></>
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <i className="ri-shield-check-fill text-green-500" />
              <span>Pagamento 100% seguro via PIX</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
