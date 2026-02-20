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
  totalAmount: number;
  onPaymentConfirmed: () => void;
  checkPaymentStatus: () => Promise<'PENDING' | 'PAID' | 'FAILED'>;
  /** When true, shows Pix Automático UI with recurring info */
  isPixAutomatic?: boolean;
  /** 'WEEKLY' | 'MONTHLY' */
  planCycle?: string;
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
  isPixAutomatic = false,
  planCycle = 'MONTHLY',
}: PixPaymentDialogProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showPaymentNotFound, setShowPaymentNotFound] = useState(false);
  const [showCopyInstructions, setShowCopyInstructions] = useState(false);
  const [retryCooldown, setRetryCooldown] = useState(0);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setShowCopyInstructions(true);
      setTimeout(() => setCopied(false), 6000);
    } catch {
      toast.error('Erro ao copiar código', { style: { marginTop: '50px' } });
    }
  };

  const checkPayment = useCallback(async (isManual: boolean = false) => {
    if (isManual && retryCooldown > 0) return;

    if (isManual) setIsChecking(true);

    try {
      // If manual, we want a minimum delay for UX. If auto, we don't care about delay.
      const statusPromise = checkPaymentStatus();
      const delayPromise = isManual ? new Promise(resolve => setTimeout(resolve, 1500)) : Promise.resolve();

      const [status] = await Promise.all([statusPromise, delayPromise]);

      if (status === 'PAID') {
        onPaymentConfirmed();
      } else if (isManual) {
        // Only show error if manual check
        setShowPaymentNotFound(true);
        setRetryCooldown(CHECK_INTERVALS[0]);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      if (isManual) toast.error('Erro ao verificar pagamento', { style: { marginTop: '50px' } });
    } finally {
      if (isManual) setIsChecking(false);
    }
  }, [checkPaymentStatus, onPaymentConfirmed, retryCooldown]);

  // Handle retry cooldown
  useEffect(() => {
    if (retryCooldown <= 0) return;

    const timer = setInterval(() => {
      setRetryCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [retryCooldown]);

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
      checkPayment(false);
      setCheckCount((prev) => prev + 1);
    }, currentInterval * 1000);

    return () => clearTimeout(checkTimer);
  }, [open, paymentId, checkCount, checkPayment]);

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
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2.5rem] bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 text-white shadow-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden top-[5%] translate-y-0 selection:bg-amber-500/30">


        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5 scrollbar-hide">
          <DialogHeader className="mb-3">
            <DialogTitle className="font-serif text-center text-xl font-bold text-white tracking-tight drop-shadow-sm">
              {isPixAutomatic ? 'Pix Automático' : 'PIX Gerado'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5">
            {/* Total Amount */}
            <div className="text-center">
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">Total a Pagar</p>
              <p className="text-2xl font-sans font-bold text-white mt-0.5 drop-shadow-md">
                {formatCurrency(totalAmount)}
              </p>
            </div>


            {/* Instructions Card */}
            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 backdrop-blur-sm mx-1">
              <p className="text-sm font-bold text-white mb-3 font-serif tracking-tight">
                Como finalizar seu pagamento:
              </p>
              <ol className="text-xs text-white/70 space-y-2.5">
                <li className="flex gap-3 items-center whitespace-nowrap">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20">1</span>
                  <span>Abra o aplicativo do seu banco</span>
                </li>
                <li className="flex gap-3 items-center whitespace-nowrap">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20">2</span>
                  <span>Selecione PIX <span className="text-white font-semibold">Copia e Cola</span> ou <span className="text-white font-semibold">QR Code</span></span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#fcd34d]/10 flex items-center justify-center text-[#fcd34d] text-[9px] font-black border border-[#fcd34d]/20 mt-0.5">3</span>
                  <span>Confirme os dados e autorize a cobrança</span>
                </li>
              </ol>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-2.5 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-[#fcd34d]/10">
                {pixQrCode ? (
                  <img
                    src={pixQrCode}
                    alt="QR Code PIX"
                    className="w-12 h-12 rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* PIX Code */}
            <div className="space-y-1.5 px-1">
              <div className="flex justify-center items-end px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">
                  Ou copie o código:
                </p>
              </div>
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
            <div className="grid gap-2.5 pt-1">
              <Button
                onClick={copyToClipboard}
                className="w-full h-12 rounded-2xl gradient-button text-[#0f172a] font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/10 border border-white/20 active:scale-95"
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

              <Button
                onClick={() => checkPayment(true)}
                disabled={isChecking || retryCooldown > 0}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-xs uppercase font-bold tracking-widest transition-all"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : retryCooldown > 0 ? (
                  `Tente novamente em ${retryCooldown}s`
                ) : (
                  'Já realizei o pagamento'
                )}
              </Button>
            </div>

            {/* Payment Not Found Bubble */}
            {showPaymentNotFound && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center ring-1 ring-white/5">
                  <h3 className="text-white font-serif font-bold text-lg mb-2">
                    Pagamento não encontrado
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed mb-4">
                    O banco ainda não confirmou a transação. Aguarde alguns instantes.
                  </p>
                  <Button
                    onClick={() => setShowPaymentNotFound(false)}
                    className="w-full h-10 rounded-xl gradient-button text-[#0f172a] font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all"
                  >
                    Entendi
                  </Button>
                </div>
              </div>
            )}

            {/* Copy Instructions Bubble */}
            {showCopyInstructions && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center ring-1 ring-white/5">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <h3 className="text-white font-serif font-bold text-lg mb-2">
                    Código Copiado!
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed mb-4">
                    Agora abra o app do seu banco, escolha <strong>Pix Copia e Cola</strong> e cole o código para finalizar.
                  </p>
                  <Button
                    onClick={() => setShowCopyInstructions(false)}
                    className="w-full h-10 rounded-xl gradient-button text-[#0f172a] font-bold text-xs uppercase tracking-wide shadow-lg active:scale-95 transition-all"
                  >
                    Entendi
                  </Button>
                </div>
              </div>
            )}

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
