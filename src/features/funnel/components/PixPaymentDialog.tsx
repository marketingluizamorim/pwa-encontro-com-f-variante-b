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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-[2rem] px-4 py-8 sm:px-6 sm:py-10 bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="font-serif text-center text-3xl font-bold text-white tracking-tight">
            PIX Gerado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="text-center">
            <p className="text-sm text-white/60 font-medium uppercase tracking-wider">Total a Pagar</p>
            <p className="text-4xl sm:text-5xl font-serif font-bold text-[#fcd34d] mt-2 drop-shadow-lg">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          {/* Instructions Card */}
          <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
            <p className="text-base sm:text-lg font-bold text-white mb-3 font-serif">
              Como finalizar seu pagamento:
            </p>
            <ol className="text-sm sm:text-base text-white/80 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-[#fcd34d]">1.</span> Abra o aplicativo do seu banco
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#fcd34d]">2.</span> Selecione PIX <span className="text-white font-semibold">Copia e Cola</span> ou <span className="text-white font-semibold">QR Code</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#fcd34d]">3.</span> Confirme o pagamento e aguarde
              </li>
            </ol>
          </div>

          {/* QR Code */}
          <div className="flex justify-center my-4">
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] ring-4 ring-[#fcd34d]/20 transition-transform hover:scale-105 duration-300">
              {pixQrCode ? (
                <img
                  src={pixQrCode}
                  alt="QR Code PIX"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded"
                />
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-gray-100 rounded">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* PIX Code */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Ou copie o código:
            </p>
            <div className="relative group">
              <textarea
                readOnly
                value={pixCode}
                className="w-full h-14 max-h-14 resize-none rounded-xl bg-black/30 border border-white/10 p-3 text-xs sm:text-sm text-white/80 focus:outline-none focus:border-[#fcd34d]/50 focus:ring-1 focus:ring-[#fcd34d]/50 transition-all font-mono shadow-inner"
              />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-xl" />
            </div>
          </div>

          {/* Copy Button */}
          <div className="grid gap-3">
            <Button
              onClick={copyToClipboard}
              className="w-full h-12 rounded-xl bg-[#fcd34d] hover:bg-[#d97706] text-[#0f172a] font-bold text-sm sm:text-base transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copiar Código PIX
                </>
              )}
            </Button>

            {/* Verify Payment Button */}
            <Button
              onClick={handleCheckPayment}
              disabled={isChecking}
              variant="outline"
              className="w-full h-12 rounded-xl border-white/20 text-white bg-transparent hover:bg-white/10 text-sm sm:text-base font-medium"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando pagamento...
                </>
              ) : (
                'Já realizei o pagamento'
              )}
            </Button>
          </div>

          {/* Timer */}
          <div className="flex justify-center items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
            <p className={`text-xs sm:text-sm font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-white/40'}`}>
              Código válido por {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
