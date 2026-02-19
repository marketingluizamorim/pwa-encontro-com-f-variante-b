/**
 * RangeSlider — slider custom com Pointer Events + setPointerCapture.
 *
 * Por que pointer events (não touch)?
 * - Pointer events unificam mouse, touch e stylus numa única API.
 * - setPointerCapture no thumb garante que TODOS os futuros pointermove
 *   vão exclusivamente para esse thumb — mesmo que o dedo saia da área.
 * - React registra onPointerMove de forma síncrona (não passive), então
 *   e.preventDefault() funciona normalmente.
 *
 * Por que funciona com vaul Drawer?
 * - O Drawer tem dismissible={false}: vaul retorna cedo do onPress()
 *   sem chamar setPointerCapture. Nosso thumb pode chamar livremente.
 *
 * Por que posição contínua (sem step)?
 * - Calculamos a posição por pixel via getBoundingClientRect.
 * - O step é aplicado SOMENTE no snap final ao valor, não no movimento visual.
 * - Resultado: arrasto livre como Tinder/Spotify.
 */

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ── Utils ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
}

function snapToStep(value: number, min: number, step: number) {
    return Math.round((value - min) / step) * step + min;
}

function clientXToRaw(clientX: number, trackEl: HTMLElement, min: number, max: number): number {
    const rect = trackEl.getBoundingClientRect();
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    return min + pct * (max - min);
}

// ── Thumb ──────────────────────────────────────────────────────────────────

function Thumb({
    pct,
    label,
    active,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zIndex,
}: {
    pct: number;
    label: string;
    active: boolean;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    zIndex: number;
}) {
    return (
        <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)`, zIndex, touchAction: 'none' }}
        >
            {/* Label flutuante */}
            <div
                className={cn(
                    'absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-100',
                    'flex flex-col items-center pointer-events-none',
                )}
            >
                <span
                    className={cn(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                        'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                        'transition-transform duration-100',
                        active ? 'scale-110' : 'scale-100',
                    )}
                >
                    {label}
                </span>
                <div className="w-px h-2.5 bg-primary/50 mt-0.5" />
            </div>

            {/* Handle */}
            <div
                className={cn(
                    'w-7 h-7 rounded-full bg-background border-[2.5px] border-primary',
                    'shadow-[0_2px_10px_rgba(0,0,0,0.45)] cursor-grab active:cursor-grabbing',
                    'transition-[transform,box-shadow] duration-75 select-none',
                    active
                        ? 'scale-125 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_8px_hsl(var(--primary)/0.2)]'
                        : 'scale-100',
                )}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// RangeSlider — dois handles (ex: faixa de idade)
// ══════════════════════════════════════════════════════════════════════════════

interface RangeSliderProps {
    values: [number, number];
    onChange: (values: [number, number]) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    className?: string;
}

export function RangeSlider({
    values,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    disabled = false,
    className,
}: RangeSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeThumb, setActiveThumb] = useState<'lo' | 'hi' | null>(null);

    // Usar refs para valores atuais — evita closures stale nos handlers
    const valuesRef = useRef(values);
    valuesRef.current = values;

    const [lo, hi] = values;
    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    // ── Lo thumb handlers ───────────────────────────────────────────────────

    const onLoPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveThumb('lo');
    }, [disabled]);

    const onLoPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        if (!trackRef.current) return;
        const raw = clientXToRaw(e.clientX, trackRef.current, min, max);
        const snapped = clamp(snapToStep(raw, min, step), min, valuesRef.current[1] - step);
        onChange([snapped, valuesRef.current[1]]);
    }, [min, max, step, onChange]);

    const onLoPointerUp = useCallback(() => {
        setActiveThumb(null);
    }, []);

    // ── Hi thumb handlers ───────────────────────────────────────────────────

    const onHiPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveThumb('hi');
    }, [disabled]);

    const onHiPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        if (!trackRef.current) return;
        const raw = clientXToRaw(e.clientX, trackRef.current, min, max);
        const snapped = clamp(snapToStep(raw, min, step), valuesRef.current[0] + step, max);
        onChange([valuesRef.current[0], snapped]);
    }, [min, max, step, onChange]);

    const onHiPointerUp = useCallback(() => {
        setActiveThumb(null);
    }, []);

    return (
        <div
            className={cn('w-full pt-12 pb-2', className)}
            data-vaul-no-drag
        >
            {/* Track */}
            <div
                ref={trackRef}
                className="relative mx-3.5"
                style={{ height: 44 }}
            >
                {/* Track bg */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10" />

                {/* Fill entre os thumbs */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
                />

                {/* Lo thumb */}
                <Thumb
                    pct={loPct}
                    label={`${lo}${unit}`}
                    active={activeThumb === 'lo'}
                    onPointerDown={onLoPointerDown}
                    onPointerMove={onLoPointerMove}
                    onPointerUp={onLoPointerUp}
                    zIndex={activeThumb === 'lo' ? 30 : 20}
                />

                {/* Hi thumb */}
                <Thumb
                    pct={hiPct}
                    label={`${hi}${unit}`}
                    active={activeThumb === 'hi'}
                    onPointerDown={onHiPointerDown}
                    onPointerMove={onHiPointerMove}
                    onPointerUp={onHiPointerUp}
                    zIndex={activeThumb === 'hi' ? 30 : 20}
                />
            </div>

            {/* Min / Max labels */}
            <div className="flex justify-between mx-3.5 mt-1">
                <span className="text-xs text-muted-foreground">{min}{unit}</span>
                <span className="text-xs text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// SingleSlider — um handle (ex: distância máxima)
// ══════════════════════════════════════════════════════════════════════════════

interface SingleSliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    className?: string;
}

export function SingleSlider({
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    disabled = false,
    className,
}: SingleSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);

    const valueRef = useRef(value);
    valueRef.current = value;

    const pct = ((value - min) / (max - min)) * 100;

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
    }, [disabled]);

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        if (!trackRef.current) return;
        const raw = clientXToRaw(e.clientX, trackRef.current, min, max);
        const snapped = clamp(snapToStep(raw, min, step), min, max);
        onChange(snapped);
    }, [min, max, step, onChange]);

    const onPointerUp = useCallback(() => {
        setActive(false);
    }, []);

    return (
        <div
            className={cn('w-full pt-12 pb-2', className)}
            data-vaul-no-drag
        >
            <div
                ref={trackRef}
                className="relative mx-3.5"
                style={{ height: 44 }}
            >
                {/* Track bg */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10" />

                {/* Fill */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    style={{ left: 0, width: `${pct}%` }}
                />

                {/* Thumb */}
                <Thumb
                    pct={pct}
                    label={`${value}${unit}`}
                    active={active}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    zIndex={20}
                />
            </div>

            <div className="flex justify-between mx-3.5 mt-1">
                <span className="text-xs text-muted-foreground">{min}{unit}</span>
                <span className="text-xs text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}
