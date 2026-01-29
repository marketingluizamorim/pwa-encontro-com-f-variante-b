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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2.5rem] bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 text-white shadow-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden top-[5%] translate-y-0">
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 scrollbar-hide">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-center text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              PIX Gerado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Total Amount */}
            <div className="text-center">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Total a Pagar</p>
              <p className="text-3xl font-sans font-bold text-[#fcd34d] mt-1 drop-shadow-md">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            {/* Instructions Card */}
            <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/5 backdrop-blur-sm mx-2">
              <p className="text-sm font-bold text-white mb-2 font-serif tracking-tight text-center">
                Como finalizar seu pagamento:
              </p>
              <ol className="text-xs text-white/60 space-y-2 max-w-[240px] mx-auto">
                <li className="flex gap-2.5 items-center">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20">1</span>
                  <span>Abra o aplicativo do seu banco</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20">2</span>
                  <span className="leading-tight">Selecione PIX <span className="text-white font-semibold">Copia e Cola</span> ou <span className="text-white font-semibold">QR Code</span></span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20">3</span>
                  <span>Confirme o pagamento e aguarde</span>
                </li>
              </ol>
            </div>

            {/* QR Code */}
            <div className="flex justify-center -my-1">
              <div className="p-3 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] ring-2 ring-[#fcd34d]/10">
                {pixQrCode ? (
                  <img
                    src={pixQrCode}
                    alt="QR Code PIX"
                    className="w-32 h-32 rounded"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* PIX Code */}
            <div className="space-y-2 mt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">
                Ou copie o código:
              </p>
              <div className="relative group">
                <textarea
                  readOnly
                  value={pixCode}
                  className="w-full h-12 max-h-12 resize-none rounded-xl bg-black/40 border border-white/5 p-3 text-[10px] text-white/60 focus:outline-none transition-all font-mono scrollbar-hide"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            {/* Copy Button */}
            <div className="grid gap-3 pt-2">
              <Button
                onClick={copyToClipboard}
                className="w-full h-14 rounded-2xl gradient-button text-[#0f172a] font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/10 border border-white/20 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copiado!
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
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-xs uppercase font-bold tracking-widest transition-all"
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
            </div>

            {/* Timer */}
            <div className="flex justify-center items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
              <p className={`text-xs sm:text-sm font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-white/40'}`}>
                Código válido por {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
