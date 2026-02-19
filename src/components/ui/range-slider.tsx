/**
 * RangeSlider / SingleSlider — arrasto livre, sem limitação de step visual.
 *
 * ARQUITETURA: "Uncontrolled drag with controlled commit"
 * ─────────────────────────────────────────────────────
 * Durante o drag:
 *   - Poisções dos thumbs e fills são atualizados DIRETAMENTE no DOM via refs.
 *   - Zero chamadas ao React setState → zero re-renders de lag.
 *   - Uso de requestAnimationFrame para sincronizar com o refresh da tela.
 *
 * Ao soltar (pointerup / touchend):
 *   - onChange() é chamado com o valor final snappado.
 *   - React re-renderiza uma única vez para confirmar o estado.
 *
 * Event listeners:
 *   - Registrados no DOCUMENT com { passive: false } via addEventListener.
 *   - Bypass completo do sistema de eventos do React E do vaul Drawer.
 *   - Removidos imediatamente após o drag terminar.
 *
 * Compatibilidade:
 *   - Pointer Events API (desktop + iOS 13+ + Android)
 *   - Fallback para Touch Events (iOS < 13)
 */

import { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import './dual-range-slider.css';

// ── Utilitários ───────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

function snapVal(raw: number, min: number, max: number, step: number) {
    const snapped = Math.round((raw - min) / step) * step + min;
    return clamp(snapped, min, max);
}

function rawFromClientX(clientX: number, rect: DOMRect, min: number, max: number) {
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    return min + pct * (max - min);
}

function pctOf(value: number, min: number, max: number) {
    return ((value - min) / (max - min)) * 100;
}

// ── Atualização DOM direta (sem setState durante drag) ─────────────────────

function applyThumbPct(
    thumbEl: HTMLElement | null,
    labelEl: HTMLElement | null,
    pct: number,
    label: string,
) {
    if (thumbEl) {
        thumbEl.style.left = `${pct}%`;
    }
    if (labelEl) {
        labelEl.style.left = `${pct}%`;
        const span = labelEl.querySelector('span');
        if (span) span.textContent = label;
    }
}

function applyFill(
    fillEl: HTMLElement | null,
    leftPct: number,
    widthPct: number,
) {
    if (fillEl) {
        fillEl.style.left = `${leftPct}%`;
        fillEl.style.width = `${widthPct}%`;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// RangeSlider (dois thumbs — faixa de idade)
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
    const fillRef = useRef<HTMLDivElement>(null);
    const loThumbRef = useRef<HTMLDivElement>(null);
    const hiThumbRef = useRef<HTMLDivElement>(null);
    const loLabelWrapRef = useRef<HTMLDivElement>(null);
    const hiLabelWrapRef = useRef<HTMLDivElement>(null);

    // Valor atual sempre disponível para os closures do drag
    const loRef = useRef(values[0]);
    const hiRef = useRef(values[1]);

    // Sincronizar refs com props (para quando o pai atualiza the estado)
    useEffect(() => {
        loRef.current = values[0];
        hiRef.current = values[1];
        // Sync DOM to match React state
        const loPct = pctOf(values[0], min, max);
        const hiPct = pctOf(values[1], min, max);
        applyThumbPct(loThumbRef.current, loLabelWrapRef.current, loPct, `${values[0]}${unit}`);
        applyThumbPct(hiThumbRef.current, hiLabelWrapRef.current, hiPct, `${values[1]}${unit}`);
        applyFill(fillRef.current, loPct, hiPct - loPct);
    }, [values, min, max, unit]);

    // ── Drag LO ──────────────────────────────────────────────────────────────

    const startDragLo = useCallback(() => {
        if (disabled || !trackRef.current) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        let rafId = 0;

        function onMove(e: PointerEvent | TouchEvent) {
            e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const raw = rawFromClientX(clientX, trackRect, min, max);
                const next = snapVal(raw, min, hiRef.current - step, step);
                if (next === loRef.current) return;
                loRef.current = next;
                const pct = pctOf(next, min, max);
                const hiPct = pctOf(hiRef.current, min, max);
                applyThumbPct(loThumbRef.current, loLabelWrapRef.current, pct, `${next}${unit}`);
                applyFill(fillRef.current, pct, hiPct - pct);
            });
        }

        function onEnd() {
            cancelAnimationFrame(rafId);
            document.removeEventListener('pointermove', onMove as EventListener);
            document.removeEventListener('pointerup', onEnd);
            document.removeEventListener('touchmove', onMove as EventListener);
            document.removeEventListener('touchend', onEnd);
            loThumbRef.current?.classList.remove('thumb-active');
            onChange([loRef.current, hiRef.current]);
        }

        loThumbRef.current?.classList.add('thumb-active');
        document.addEventListener('pointermove', onMove as EventListener, { passive: false });
        document.addEventListener('pointerup', onEnd, { once: true });
        document.addEventListener('touchmove', onMove as EventListener, { passive: false });
        document.addEventListener('touchend', onEnd, { once: true });
    }, [disabled, min, max, step, unit, onChange]);

    // ── Drag HI ──────────────────────────────────────────────────────────────

    const startDragHi = useCallback(() => {
        if (disabled || !trackRef.current) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        let rafId = 0;

        function onMove(e: PointerEvent | TouchEvent) {
            e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const raw = rawFromClientX(clientX, trackRect, min, max);
                const next = snapVal(raw, loRef.current + step, max, step);
                if (next === hiRef.current) return;
                hiRef.current = next;
                const loPct = pctOf(loRef.current, min, max);
                const pct = pctOf(next, min, max);
                applyThumbPct(hiThumbRef.current, hiLabelWrapRef.current, pct, `${next}${unit}`);
                applyFill(fillRef.current, loPct, pct - loPct);
            });
        }

        function onEnd() {
            cancelAnimationFrame(rafId);
            document.removeEventListener('pointermove', onMove as EventListener);
            document.removeEventListener('pointerup', onEnd);
            document.removeEventListener('touchmove', onMove as EventListener);
            document.removeEventListener('touchend', onEnd);
            hiThumbRef.current?.classList.remove('thumb-active');
            onChange([loRef.current, hiRef.current]);
        }

        hiThumbRef.current?.classList.add('thumb-active');
        document.addEventListener('pointermove', onMove as EventListener, { passive: false });
        document.addEventListener('pointerup', onEnd, { once: true });
        document.addEventListener('touchmove', onMove as EventListener, { passive: false });
        document.addEventListener('touchend', onEnd, { once: true });
    }, [disabled, min, max, step, unit, onChange]);

    const loPct = pctOf(values[0], min, max);
    const hiPct = pctOf(values[1], min, max);

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            {/* Labels + Track em container com altura suficiente para a label */}
            <div className="relative px-3.5" style={{ paddingTop: 40, paddingBottom: 8 }}>

                {/* Label LO */}
                <div
                    ref={loLabelWrapRef}
                    className="absolute top-0 pointer-events-none transition-none"
                    style={{ left: `${loPct}%` }}
                >
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {values[0]}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                {/* Label HI */}
                <div
                    ref={hiLabelWrapRef}
                    className="absolute top-0 pointer-events-none transition-none"
                    style={{ left: `${hiPct}%` }}
                >
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {values[1]}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                {/* Track */}
                <div
                    ref={trackRef}
                    className="relative"
                    style={{ height: 28 }}
                >
                    {/* Track BG */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />

                    {/* Fill */}
                    <div
                        ref={fillRef}
                        className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                        style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
                    />

                    {/* Lo Thumb */}
                    <div
                        ref={loThumbRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${loPct}%`, zIndex: 20, touchAction: 'none' }}
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startDragLo(); }}
                        onTouchStart={(e) => { e.stopPropagation(); startDragLo(); }}
                    />

                    {/* Hi Thumb */}
                    <div
                        ref={hiThumbRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${hiPct}%`, zIndex: 21, touchAction: 'none' }}
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startDragHi(); }}
                        onTouchStart={(e) => { e.stopPropagation(); startDragHi(); }}
                    />
                </div>
            </div>

            {/* Range labels */}
            <div className="flex justify-between px-3.5">
                <span className="text-[11px] text-muted-foreground">{min}{unit}</span>
                <span className="text-[11px] text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// SingleSlider (um thumb — ex: distância máxima)
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
    const fillRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const labelWrapRef = useRef<HTMLDivElement>(null);
    const valRef = useRef(value);

    useEffect(() => {
        valRef.current = value;
        const pct = pctOf(value, min, max);
        applyThumbPct(thumbRef.current, labelWrapRef.current, pct, `${value}${unit}`);
        applyFill(fillRef.current, 0, pct);
    }, [value, min, max, unit]);

    const startDrag = useCallback(() => {
        if (disabled || !trackRef.current) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        let rafId = 0;

        function onMove(e: PointerEvent | TouchEvent) {
            e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const raw = rawFromClientX(clientX, trackRect, min, max);
                const next = snapVal(raw, min, max, step);
                if (next === valRef.current) return;
                valRef.current = next;
                const pct = pctOf(next, min, max);
                applyThumbPct(thumbRef.current, labelWrapRef.current, pct, `${next}${unit}`);
                applyFill(fillRef.current, 0, pct);
            });
        }

        function onEnd() {
            cancelAnimationFrame(rafId);
            document.removeEventListener('pointermove', onMove as EventListener);
            document.removeEventListener('pointerup', onEnd);
            document.removeEventListener('touchmove', onMove as EventListener);
            document.removeEventListener('touchend', onEnd);
            thumbRef.current?.classList.remove('thumb-active');
            onChange(valRef.current);
        }

        thumbRef.current?.classList.add('thumb-active');
        document.addEventListener('pointermove', onMove as EventListener, { passive: false });
        document.addEventListener('pointerup', onEnd, { once: true });
        document.addEventListener('touchmove', onMove as EventListener, { passive: false });
        document.addEventListener('touchend', onEnd, { once: true });
    }, [disabled, min, max, step, unit, onChange]);

    const pct = pctOf(value, min, max);

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            <div className="relative px-3.5" style={{ paddingTop: 40, paddingBottom: 8 }}>

                {/* Label */}
                <div
                    ref={labelWrapRef}
                    className="absolute top-0 pointer-events-none"
                    style={{ left: `${pct}%` }}
                >
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {value}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                <div ref={trackRef} className="relative" style={{ height: 28 }}>
                    {/* Track BG */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />
                    {/* Fill */}
                    <div
                        ref={fillRef}
                        className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                        style={{ left: 0, width: `${pct}%` }}
                    />
                    {/* Thumb */}
                    <div
                        ref={thumbRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${pct}%`, zIndex: 20, touchAction: 'none' }}
                        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); startDrag(); }}
                        onTouchStart={(e) => { e.stopPropagation(); startDrag(); }}
                    />
                </div>
            </div>

            <div className="flex justify-between px-3.5">
                <span className="text-[11px] text-muted-foreground">{min}{unit}</span>
                <span className="text-[11px] text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}
