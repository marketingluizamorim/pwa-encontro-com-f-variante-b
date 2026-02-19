/**
 * RangeSlider / SingleSlider — arrasto livre via setPointerCapture.
 *
 * Abordagem final (correta):
 * - setPointerCapture no thumb: todos os pointermove vão exclusivamente
 *   para esse elemento, mesmo que o dedo saia da área. Sem document listeners.
 * - touch-action: none no thumb: browser entrega pointer events (não touch),
 *   eliminando a duplicidade touch+pointer que causava handlers duplos.
 * - Updates DOM diretos durante drag (refs) → zero re-renders → 60fps.
 * - onChange chamado apenas no pointerup → um único re-render ao final.
 *
 * Funciona porque: dismissible={false} no Drawer impede vaul de chamar
 * setPointerCapture no seu onPress. Nosso thumb é o único dono.
 */

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import './dual-range-slider.css';

// ── Utils ─────────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

function snapVal(raw: number, min: number, max: number, step: number) {
    return clamp(Math.round((raw - min) / step) * step + min, min, max);
}

function rawFromX(clientX: number, rect: DOMRect, min: number, max: number) {
    return min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
}

function pctOf(v: number, min: number, max: number) {
    return ((v - min) / (max - min)) * 100;
}

// ── DOM helpers ────────────────────────────────────────────────────────────────

function moveThumb(el: HTMLElement | null, pct: number) {
    if (el) el.style.left = `${pct}%`;
}

function moveLabel(wrap: HTMLElement | null, pct: number, text: string) {
    if (!wrap) return;
    wrap.style.left = `${pct}%`;
    const span = wrap.querySelector('span');
    if (span) span.textContent = text;
}

function moveFill(el: HTMLElement | null, leftPct: number, widthPct: number) {
    if (!el) return;
    el.style.left = `${leftPct}%`;
    el.style.width = `${widthPct}%`;
}

// ══════════════════════════════════════════════════════════════════════════════
// RangeSlider — dois thumbs
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
    const loRef = useRef<HTMLDivElement>(null);
    const hiRef = useRef<HTMLDivElement>(null);
    const loLblRef = useRef<HTMLDivElement>(null);
    const hiLblRef = useRef<HTMLDivElement>(null);
    const loValRef = useRef(values[0]);
    const hiValRef = useRef(values[1]);

    // Sync DOM quando props mudam (fora de drag)
    useEffect(() => {
        loValRef.current = values[0];
        hiValRef.current = values[1];
        const lp = pctOf(values[0], min, max);
        const hp = pctOf(values[1], min, max);
        moveThumb(loRef.current, lp);
        moveThumb(hiRef.current, hp);
        moveLabel(loLblRef.current, lp, `${values[0]}${unit}`);
        moveLabel(hiLblRef.current, hp, `${values[1]}${unit}`);
        moveFill(fillRef.current, lp, hp - lp);
    }, [values, min, max, unit]);

    // ── handlers LO ──────────────────────────────────────────────────────────

    function onLoDown(e: React.PointerEvent<HTMLDivElement>) {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.classList.add('thumb-active');
    }

    function onLoMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = trackRef.current!.getBoundingClientRect();
        const raw = rawFromX(e.clientX, rect, min, max);
        const next = snapVal(raw, min, hiValRef.current - step, step);
        if (next === loValRef.current) return;
        loValRef.current = next;
        const lp = pctOf(next, min, max);
        const hp = pctOf(hiValRef.current, min, max);
        moveThumb(loRef.current, lp);
        moveLabel(loLblRef.current, lp, `${next}${unit}`);
        moveFill(fillRef.current, lp, hp - lp);
    }

    function onLoUp(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.classList.remove('thumb-active');
        onChange([loValRef.current, hiValRef.current]);
    }

    // ── handlers HI ──────────────────────────────────────────────────────────

    function onHiDown(e: React.PointerEvent<HTMLDivElement>) {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.classList.add('thumb-active');
    }

    function onHiMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = trackRef.current!.getBoundingClientRect();
        const raw = rawFromX(e.clientX, rect, min, max);
        const next = snapVal(raw, loValRef.current + step, max, step);
        if (next === hiValRef.current) return;
        hiValRef.current = next;
        const lp = pctOf(loValRef.current, min, max);
        const hp = pctOf(next, min, max);
        moveThumb(hiRef.current, hp);
        moveLabel(hiLblRef.current, hp, `${next}${unit}`);
        moveFill(fillRef.current, lp, hp - lp);
    }

    function onHiUp(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.classList.remove('thumb-active');
        onChange([loValRef.current, hiValRef.current]);
    }

    const lp0 = pctOf(values[0], min, max);
    const hp0 = pctOf(values[1], min, max);

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            <div className="relative px-3.5" style={{ paddingTop: 44, paddingBottom: 6 }}>

                {/* Label LO */}
                <div ref={loLblRef} className="absolute top-0 pointer-events-none" style={{ left: `${lp0}%` }}>
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {values[0]}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                {/* Label HI */}
                <div ref={hiLblRef} className="absolute top-0 pointer-events-none" style={{ left: `${hp0}%` }}>
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {values[1]}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                {/* Track */}
                <div ref={trackRef} className="relative" style={{ height: 28 }}>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />

                    <div
                        ref={fillRef}
                        className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                        style={{ left: `${lp0}%`, width: `${hp0 - lp0}%` }}
                    />

                    {/* Lo thumb */}
                    <div
                        ref={loRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${lp0}%`, zIndex: 20, touchAction: 'none' }}
                        onPointerDown={onLoDown}
                        onPointerMove={onLoMove}
                        onPointerUp={onLoUp}
                        onPointerCancel={onLoUp}
                    />

                    {/* Hi thumb */}
                    <div
                        ref={hiRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${hp0}%`, zIndex: 21, touchAction: 'none' }}
                        onPointerDown={onHiDown}
                        onPointerMove={onHiMove}
                        onPointerUp={onHiUp}
                        onPointerCancel={onHiUp}
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

// ══════════════════════════════════════════════════════════════════════════════
// SingleSlider — um thumb
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
    const lblRef = useRef<HTMLDivElement>(null);
    const valRef = useRef(value);

    useEffect(() => {
        valRef.current = value;
        const p = pctOf(value, min, max);
        moveThumb(thumbRef.current, p);
        moveLabel(lblRef.current, p, `${value}${unit}`);
        moveFill(fillRef.current, 0, p);
    }, [value, min, max, unit]);

    function onDown(e: React.PointerEvent<HTMLDivElement>) {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.classList.add('thumb-active');
    }

    function onMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = trackRef.current!.getBoundingClientRect();
        const next = snapVal(rawFromX(e.clientX, rect, min, max), min, max, step);
        if (next === valRef.current) return;
        valRef.current = next;
        const p = pctOf(next, min, max);
        moveThumb(thumbRef.current, p);
        moveLabel(lblRef.current, p, `${next}${unit}`);
        moveFill(fillRef.current, 0, p);
    }

    function onUp(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.classList.remove('thumb-active');
        onChange(valRef.current);
    }

    const p0 = pctOf(value, min, max);

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            <div className="relative px-3.5" style={{ paddingTop: 44, paddingBottom: 6 }}>

                <div ref={lblRef} className="absolute top-0 pointer-events-none" style={{ left: `${p0}%` }}>
                    <div className="flex flex-col items-center -translate-x-1/2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 whitespace-nowrap">
                            {value}{unit}
                        </span>
                        <div className="w-px h-2.5 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                <div ref={trackRef} className="relative" style={{ height: 28 }}>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />
                    <div
                        ref={fillRef}
                        className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                        style={{ left: 0, width: `${p0}%` }}
                    />
                    <div
                        ref={thumbRef}
                        data-vaul-no-drag
                        className="rs-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${p0}%`, zIndex: 20, touchAction: 'none' }}
                        onPointerDown={onDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={onUp}
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
