import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Lock, Check, ShieldCheck, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

interface FloatingInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    maxLength?: number;
    error?: string;
    className?: string;
    isValid?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatPhone(value: string): string {
    const n = value.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
}

function toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const OLD_PRICES: Record<string, number> = {
    bronze: 24.90,
    weekly: 24.90,
    silver: 59.90,
    prata: 59.90,
    monthly: 59.90,
    gold: 99.90,
    ouro: 99.90,
    annual: 99.90,
};

// ─────────────────────────────────────────────
// FloatingInput — MUST stay at module level so
// React never remounts it on parent re-renders
// (would cause focus loss after 1 keystroke)
// ─────────────────────────────────────────────
function FloatingInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    inputMode,
    maxLength,
    error,
    className = '',
    isValid = false,
}: FloatingInputProps) {
    return (
        <div className={`relative ${className}`}>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder=" "
                inputMode={inputMode}
                maxLength={maxLength}
                className={`
          peer w-full rounded-[10px]
          bg-white/[0.05] border
          pt-[20px] pb-[7px] px-3 pr-9
          text-[14px] text-white outline-none
          transition-all duration-200
          placeholder:text-transparent
          ${error
                        ? 'border-red-500/40 focus:border-red-400/60'
                        : 'border-white/[0.07] focus:border-[#fcd34d]/40 focus:bg-white/[0.07]'
                    }
        `}
            />
            <label
                htmlFor={id}
                className="
          absolute left-3 top-1/2 -translate-y-1/2
          text-[13px] text-white/30 pointer-events-none
          transition-all duration-200 origin-left
          peer-focus:top-[8px] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-white/50
          peer-[:not(:placeholder-shown)]:top-[8px]
          peer-[:not(:placeholder-shown)]:translate-y-0
          peer-[:not(:placeholder-shown)]:text-[10px]
          peer-[:not(:placeholder-shown)]:text-white/50
        "
            >
                {label}
            </label>

            {/* Valid checkmark */}
            <span
                className={`
          absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
          transition-opacity duration-250
          ${isValid ? 'opacity-100' : 'opacity-0'}
        `}
            >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
            </span>

            {error && <p className="text-[10px] text-red-400 mt-1 pl-1">{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function CheckoutDialog({
    open,
    onOpenChange,
    planPrice,
    onSubmit,
    isLoading,
    planName,
    orderBumps,
    initialData,
}: CheckoutDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [extrasExpanded, setExtrasExpanded] = useState(false);

    useEffect(() => {
        if (open) {
            setErrors({});
            setExtrasExpanded(false);
            if (initialData) {
                setName(initialData.name || '');
                setEmail(initialData.email || '');
                const clean = initialData.phone.replace('+55 ', '').replace('+55', '');
                setPhone(formatPhone(clean));
            }
        }
    }, [open, initialData, planPrice, planName]);

    // Plan detection
    const cleanPlanName = planName?.toLowerCase() || '';
    const isOuroPlan = cleanPlanName.includes('ouro') || planPrice >= 40;
    const isSilverPlan = cleanPlanName.includes('prata') || (planPrice >= 20 && planPrice < 40);
    const isPackagePlan = isOuroPlan || isSilverPlan;

    const extrasTotal = isPackagePlan
        ? 0
        : (orderBumps?.allRegions ? 5 : 0)
        + (orderBumps?.grupoEvangelico ? 5 : 0)
        + (orderBumps?.grupoCatolico ? 5 : 0);

    const basePlanPrice = isPackagePlan ? planPrice : planPrice - extrasTotal;

    const hasExtras = orderBumps?.allRegions || orderBumps?.grupoEvangelico || orderBumps?.grupoCatolico;

    // Label: "Plano Prata · Mensal"
    const planPeriod = cleanPlanName.includes('bronze') ? 'Semanal' : 'Mensal';
    const planLabel = planName ? `${toTitleCase(planName)} · ${planPeriod}` : '';

    // Old (crossed-out) price
    const oldPriceKey = Object.keys(OLD_PRICES).find(k => cleanPlanName.includes(k));
    const oldPrice = oldPriceKey ? OLD_PRICES[oldPriceKey] : Math.round(basePlanPrice * 2);

    // Resources
    const ouroResources = [
        'Todos os recursos do Plano Prata',
        'Enviar mensagem sem curtir antes',
        'Ver perfis online recentemente',
        'Filtro por distância e interesses',
        'Perfil em destaque',
        'Filtros avançados (idade e distância)',
    ];
    const silverResources = [
        'Ver quem curtiu você',
        'Curtidas ilimitadas',
        'Enviar ou receber fotos e áudios',
        'Filtro por cidade / região',
        'Fazer chamadas de voz e vídeo',
        'Comunidade cristã no WhatsApp',
    ];
    const resources = isOuroPlan ? ouroResources : isSilverPlan ? silverResources : [];

    // Validation helpers
    const isNameValid = name.trim().length >= 3;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = phone.replace(/\D/g, '').length >= 10;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Nome é obrigatório';
        if (!email.trim()) e.email = 'Email é obrigatório';
        else if (!isEmailValid) e.email = 'Email inválido';
        if (!phone.trim()) e.phone = 'Telefone é obrigatório';
        else if (!isPhoneValid) e.phone = 'Telefone inválido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev?: React.FormEvent) => {
        ev?.preventDefault();
        if (validate()) onSubmit({ name, email, phone: '+55 ' + phone });
    };

    const extrasCount =
        (orderBumps?.allRegions ? 1 : 0) +
        (orderBumps?.grupoEvangelico ? 1 : 0) +
        (orderBumps?.grupoCatolico ? 1 : 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="
        w-[calc(100%-2rem)] max-w-[390px] mx-auto
        rounded-[22px] bg-[#0f172a] border border-white/[0.06]
        text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)]
        p-0 overflow-hidden gap-0
        data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
        [&>button]:hidden
      ">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <h2 className="text-[17px] font-extrabold text-white">
                        Finalizar Assinatura
                    </h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-[22px] h-[22px] rounded-full bg-white/[0.07] flex items-center justify-center text-white/50 hover:bg-white/[0.13] transition-colors flex-shrink-0"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>

                {/* ── Order Summary Card ── */}
                <div className="mx-4 mt-3 bg-white/[0.05] border border-white/[0.06] rounded-[12px] px-3 py-[10px]">
                    {/* Plan + price row */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-white">
                            {planLabel || 'Plano'}
                        </span>
                        <div className="flex items-baseline gap-[6px]">
                            <span className="text-[12px] text-white/25 line-through">
                                R$ {oldPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[15px] font-medium text-white">
                                R$ {basePlanPrice.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>

                    {/* Resources toggle */}
                    {(hasExtras || isPackagePlan) && (
                        <>
                            <button
                                type="button"
                                onClick={() => setExtrasExpanded(!extrasExpanded)}
                                className="flex items-center gap-1 mt-[6px] text-[11px] font-semibold text-[#fcd34d]/70 hover:text-[#fcd34d] transition-colors"
                            >
                                {isPackagePlan
                                    ? 'Ver o que está incluído'
                                    : `Extras (${extrasCount})`}
                                {extrasExpanded
                                    ? <ChevronUp className="w-3 h-3" />
                                    : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {extrasExpanded && (
                                <div className="mt-2 pt-2 border-t border-white/[0.06] flex flex-col gap-[6px]">
                                    {isPackagePlan ? (
                                        resources.map((r, i) => (
                                            <div key={i} className="flex items-center gap-[7px] text-[12px] text-white/55">
                                                <Check className="w-[11px] h-[11px] text-emerald-400 flex-shrink-0" />
                                                {r}
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {orderBumps?.allRegions && (
                                                <div className="flex justify-between text-[12px] text-white/55">
                                                    <span>Desbloquear Região</span><span>R$ 5,00</span>
                                                </div>
                                            )}
                                            {orderBumps?.grupoEvangelico && (
                                                <div className="flex justify-between text-[12px] text-white/55">
                                                    <span>Grupo Evangélico</span><span>R$ 5,00</span>
                                                </div>
                                            )}
                                            {orderBumps?.grupoCatolico && (
                                                <div className="flex justify-between text-[12px] text-white/55">
                                                    <span>Grupo Católico</span><span>R$ 5,00</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-white/[0.05] mx-4 my-3" />

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-2">
                    <FloatingInput
                        id="name"
                        label="Nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        isValid={isNameValid}
                    />
                    <FloatingInput
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        isValid={isEmailValid}
                    />
                    <div>
                        <div className="flex gap-[6px]">
                            <div className="bg-white/[0.05] border border-white/[0.07] rounded-[10px] px-3 flex items-center text-[14px] text-white/55 font-semibold flex-shrink-0 select-none h-[50px]">
                                +55
                            </div>
                            <FloatingInput
                                id="phone"
                                label="Telefone"
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                maxLength={15}
                                className="flex-1"
                                isValid={isPhoneValid}
                            />
                        </div>
                        {errors.phone && <p className="text-[10px] text-red-400 mt-1 pl-1">{errors.phone}</p>}
                    </div>
                </form>

                {/* ── Footer ── */}
                <div className="px-4 pt-3 pb-4 mt-1">
                    {/* Total row */}
                    <div className="flex justify-between items-center mb-[10px]">
                        <span className="text-[13px] text-white/50">Total</span>
                        <span className="text-[22px] font-extrabold text-white tracking-tight">
                            R$ {planPrice.toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    {/* CTA button with shimmer */}
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isLoading}
                        className="
              relative w-full py-[14px] rounded-[12px] border-0 overflow-hidden
              gradient-button text-white
              text-[14px] font-extrabold tracking-[0.6px] uppercase
              flex items-center justify-center gap-[7px]
              shadow-[0_6px_24px_rgba(0,200,150,0.18)]
              hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(0,200,150,0.28)]
              active:scale-[0.98] active:shadow-none
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              transition-all duration-150
              before:content-[''] before:absolute before:top-0 before:-left-full
              before:w-[55%] before:h-full
              before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent
              before:animate-[shimmer_3s_infinite_2s]
            "
                    >
                        {isLoading ? (
                            <><i className="ri-loader-4-line animate-spin" /> Processando...</>
                        ) : (
                            <><Lock className="w-[13px] h-[13px]" /> Finalizar Pagamento</>
                        )}
                    </button>

                    {/* Single footer note */}
                    <p className="flex items-center justify-center gap-[5px] text-[12px] text-white/25 mt-[9px] leading-relaxed">
                        <ShieldCheck className="w-[11px] h-[11px] text-green-400 flex-shrink-0" />
                        Pagamento 100% seguro via PIX
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    );
}
