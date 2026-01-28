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
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  orderBumps
}: CheckoutDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extrasExpanded, setExtrasExpanded] = useState(false);
  
  const { gender, quizAnswers } = useFunnelStore();
  const displayPhoto = getDisplayPhoto(gender, quizAnswers.age);
  
  // Calculate extras
  const hasExtras = orderBumps?.allRegions || orderBumps?.grupoEvangelico || orderBumps?.grupoCatolico;
  const extrasCount = (orderBumps?.allRegions ? 1 : 0) + (orderBumps?.grupoEvangelico ? 1 : 0) + (orderBumps?.grupoCatolico ? 1 : 0);
  const extrasTotal = (orderBumps?.allRegions ? 5 : 0) + (orderBumps?.grupoEvangelico ? 5 : 0) + (orderBumps?.grupoCatolico ? 5 : 0);
  const basePlanPrice = planPrice - extrasTotal;

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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-center">
            Finalizar Assinatura
          </DialogTitle>
        </DialogHeader>

        {/* Profile Preview Card - Compact with stacked avatars */}
        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-2">
          <div className="relative">
            {/* Stacked blurred avatars - offset to bottom-right */}
            <img 
              src={displayPhoto} 
              alt="" 
              className="absolute top-3 left-5 w-8 h-8 rounded-full object-cover blur-sm opacity-50 border border-muted"
            />
            <img 
              src={displayPhoto} 
              alt="" 
              className="absolute top-1.5 left-2.5 w-9 h-9 rounded-full object-cover blur-[2px] opacity-70 border border-muted"
            />
            {/* Main visible avatar */}
            <img 
              src={displayPhoto} 
              alt="Perfil" 
              className="relative z-10 w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 z-20 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">+5 perfis esperando por você</p>
            <p className="text-[11px] text-muted-foreground">Desbloqueie e comece a conversar</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-muted/30 rounded-xl p-3 mb-2">
          <h4 className="text-sm font-semibold mb-2">Resumo do pedido:</h4>
          <div className="space-y-1 text-sm">
            {planName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{planName}</span>
                <span>R$ {basePlanPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            {hasExtras && (
              <>
                <button
                  type="button"
                  onClick={() => setExtrasExpanded(!extrasExpanded)}
                  className="flex justify-between items-center w-full text-left hover:bg-muted/50 -mx-1 px-1 rounded transition-colors"
                >
                  <span className="text-muted-foreground flex items-center gap-1">
                    Extras ({extrasCount})
                    {extrasExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                  <span className="text-muted-foreground">R$ {extrasTotal.toFixed(2).replace('.', ',')}</span>
                </button>
                {extrasExpanded && (
                  <div className="pl-4 space-y-1 border-l-2 border-muted ml-1">
                    {orderBumps?.allRegions && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Desbloquear Região</span>
                        <span>R$ 5,00</span>
                      </div>
                    )}
                    {orderBumps?.grupoEvangelico && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Grupo Evangélico</span>
                        <span>R$ 5,00</span>
                      </div>
                    )}
                    {orderBumps?.grupoCatolico && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Grupo Católico</span>
                        <span>R$ 5,00</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                +55
              </span>
              <Input
                id="phone"
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">R$ {planPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button text-primary-foreground py-6 text-lg font-semibold"
            >
              {isLoading ? (
                <><i className="ri-loader-4-line animate-spin mr-2" /> Processando...</>
              ) : (
              <>Finalizar Pagamento <i className="ri-lock-fill ml-2" /></>
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
