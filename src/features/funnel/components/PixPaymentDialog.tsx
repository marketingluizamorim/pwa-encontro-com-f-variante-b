import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Loader2 } from 'lucide-react';

interface PixPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pixCode: string;
  pixQrCode: string;
  paymentId: string;
  totalAmount: number; // Value in BRL (e.g., 97.00)
  onPaymentConfirmed: () => void;
  checkPaymentStatus: () => Promise<'PENDING' | 'PAID' | 'FAILED'>;
}

const CHECK_INTERVALS = [15, 30, 45, 60, 90, 120, 120, 120, 120, 120];

export function PixPaymentDialog({
  open,
  onOpenChange,
  pixCode,
  pixQrCode,
  paymentId,
  totalAmount,
  onPaymentConfirmed,
  checkPaymentStatus,
}: PixPaymentDialogProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const handleCheckPayment = useCallback(async () => {
    setIsChecking(true);
    try {
      const status = await checkPaymentStatus();
      if (status === 'PAID') {
        onPaymentConfirmed();
      } else if (status === 'FAILED') {
        toast.error('Pagamento falhou. Tente novamente.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkPaymentStatus, onPaymentConfirmed]);

  // Timer countdown
  useEffect(() => {
    if (!open) {
      setTimeLeft(600);
      setCheckCount(0);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Auto-check payment status
  useEffect(() => {
    if (!open || !paymentId) return;

    const currentInterval = CHECK_INTERVALS[Math.min(checkCount, CHECK_INTERVALS.length - 1)];
    
    const checkTimer = setTimeout(() => {
      handleCheckPayment();
      setCheckCount((prev) => prev + 1);
    }, currentInterval * 1000);

    return () => clearTimeout(checkTimer);
  }, [open, paymentId, checkCount, handleCheckPayment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl px-3 py-8 sm:px-4 sm:py-12">
        <DialogHeader>
          <DialogTitle className="font-display text-center text-2xl sm:text-3xl">
            PIX Gerado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Total Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          {/* Instructions Card */}
          <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
            <p className="text-base sm:text-lg font-medium text-foreground mb-2">
              Como pagar:
            </p>
            <ol className="text-sm sm:text-base text-muted-foreground space-y-1">
              <li>1. Abra seu app do banco</li>
              <li>
                2. Escolha PIX com <span className="font-medium text-primary">Copia e Cola</span> ou{' '}
                <span className="font-medium text-primary">QR Code</span>
              </li>
              <li>3. Confirme o pagamento</li>
            </ol>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            {pixQrCode ? (
              <img 
                src={pixQrCode} 
                alt="QR Code PIX" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-muted rounded-lg">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
            )}
          </div>

          {/* PIX Code */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Ou copie o código:
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={pixCode}
                className="w-full h-14 max-h-14 resize-none rounded-lg bg-muted p-3 text-xs sm:text-sm text-foreground/80 focus:outline-none overflow-hidden"
              />
            </div>
          </div>

          {/* Copy Button */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-white border-0 text-sm sm:text-base font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar código
              </>
            )}
          </Button>

          {/* Verify Payment Button */}
          <Button
            onClick={handleCheckPayment}
            disabled={isChecking}
            className="w-full h-10 text-sm sm:text-base font-medium"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              'Já realizei o pagamento'
            )}
          </Button>

          {/* Timer */}
          <p className={`text-xs sm:text-sm text-center ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Válido por {formatTime(timeLeft)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
