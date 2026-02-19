/**
 * TouchSlider — slider com drag que funciona dentro de vaul Drawer.
 *
 * Por que não usar onTouchMove do React?
 * React 17+ registra todos os handlers de toque como `passive: true` no root.
 * Isso significa que e.preventDefault() dentro de onTouchMove é um no-op.
 * O browser então interpreta o toque como scroll, move o container,
 * e getBoundingClientRect() retorna posições erradas → slider "anda só uma casa".
 *
 * Solução:
 * 1. `touch-action: none` no container: browser nunca usa esse elemento para scroll.
 * 2. addEventListener manual com { passive: false } para os move/end events:
 *    permite e.preventDefault() real que bloqueia qualquer scroll residual.
 * 3. Refs para onChange/values: sem closures staleas durante o drag.
 * 4. data-vaul-no-drag: bypasa o shouldDrag() do vaul como segunda barreira.
 * 5. dismissible={false} no Drawer pai: vaul não chama setPointerCapture.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function snap(value: number, min: number, max: number, step: number): number {
    const snapped = Math.round((value - min) / step) * step + min;
    return Math.min(max, Math.max(min, snapped));
}

function clientXFromEvent(e: TouchEvent | MouseEvent): number {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
}

// ══════════════════════════════════════════════════════════════════════════════
// SingleSlider
// ══════════════════════════════════════════════════════════════════════════════

interface SingleSliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
    className?: string;
}

export function SingleSlider({
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    className,
}: SingleSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const [active, setActive] = useState(false);

    // Refs para evitar closures stale no handler de evento manual
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { valueRef.current = value; }, [value]);

    const getValueFromClientX = useCallback((clientX: number) => {
        const rect = trackRef.current!.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return snap(min + pct * (max - min), min, max, step);
    }, [min, max, step]);

    const getValueFromClientXRef = useRef(getValueFromClientX);
    useEffect(() => { getValueFromClientXRef.current = getValueFromClientX; }, [getValueFromClientX]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        function onMove(e: TouchEvent | MouseEvent) {
            if (!isDragging.current) return;
            e.preventDefault(); // funciona pois ispassive:false
            const newVal = getValueFromClientXRef.current(clientXFromEvent(e));
            onChangeRef.current(newVal);
        }

        function onEnd() {
            if (!isDragging.current) return;
            isDragging.current = false;
            setActive(false);
        }

        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd, { passive: true });
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseup', onEnd);

        return () => {
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onEnd);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseup', onEnd);
        };
    }, []); // só registra uma vez — usa refs dentro

    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div
            ref={trackRef}
            className={cn('relative flex items-center w-full select-none cursor-pointer', className)}
            style={{ height: 44, touchAction: 'none' }}
            data-vaul-no-drag
            onTouchStart={(e) => {
                if (disabled) return;
                isDragging.current = true;
                setActive(true);
                onChangeRef.current(getValueFromClientXRef.current(e.touches[0].clientX));
                e.stopPropagation();
            }}
            onMouseDown={(e) => {
                if (disabled) return;
                isDragging.current = true;
                setActive(true);
                onChangeRef.current(getValueFromClientXRef.current(e.clientX));
            }}
        >
            {/* Track BG */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />
            {/* Fill */}
            <div
                className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                style={{ left: 0, width: `${pct}%` }}
            />
            {/* Thumb */}
            <div
                className={cn(
                    'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                    'w-7 h-7 rounded-full bg-background border-[2.5px] border-primary',
                    'shadow-[0_2px_10px_rgba(0,0,0,0.4)] pointer-events-none transition-transform duration-75',
                    active && 'scale-125 shadow-[0_0_0_8px_hsl(var(--primary)/0.2)]',
                )}
                style={{ left: `${pct}%` }}
            />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// RangeSlider (dois thumbs)
// ══════════════════════════════════════════════════════════════════════════════

interface RangeSliderProps {
    values: [number, number];
    onChange: (values: [number, number]) => void;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
    className?: string;
}

export function RangeSlider({
    values,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    className,
}: RangeSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const activeThumb = useRef<'lo' | 'hi' | null>(null);
    const [activeState, setActiveState] = useState<'lo' | 'hi' | null>(null);

    // Refs para evitar closures stale durante o drag
    const onChangeRef = useRef(onChange);
    const valuesRef = useRef(values);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { valuesRef.current = values; }, [values]);

    const getValueFromClientX = useCallback((clientX: number) => {
        const rect = trackRef.current!.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return snap(min + pct * (max - min), min, max, step);
    }, [min, max, step]);

    const getValueFromClientXRef = useRef(getValueFromClientX);
    useEffect(() => { getValueFromClientXRef.current = getValueFromClientX; }, [getValueFromClientX]);

    const applyMove = useCallback((clientX: number, thumb: 'lo' | 'hi') => {
        const raw = getValueFromClientXRef.current(clientX);
        const [lo, hi] = valuesRef.current;
        if (thumb === 'lo') {
            onChangeRef.current([Math.min(raw, hi - step), hi]);
        } else {
            onChangeRef.current([lo, Math.max(raw, lo + step)]);
        }
    }, [step]);

    const applyMoveRef = useRef(applyMove);
    useEffect(() => { applyMoveRef.current = applyMove; }, [applyMove]);

    // Registra move/end como non-passive uma vez
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        function onMove(e: TouchEvent | MouseEvent) {
            if (!activeThumb.current) return;
            e.preventDefault();
            applyMoveRef.current(clientXFromEvent(e), activeThumb.current);
        }

        function onEnd() {
            if (!activeThumb.current) return;
            activeThumb.current = null;
            setActiveState(null);
        }

        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd, { passive: true });
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseup', onEnd);

        return () => {
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onEnd);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseup', onEnd);
        };
    }, []);

    const closestThumb = useCallback((clientX: number): 'lo' | 'hi' => {
        const rect = trackRef.current!.getBoundingClientRect();
        const [lo, hi] = valuesRef.current;
        const loX = rect.left + ((lo - min) / (max - min)) * rect.width;
        const hiX = rect.left + ((hi - min) / (max - min)) * rect.width;
        return Math.abs(clientX - loX) <= Math.abs(clientX - hiX) ? 'lo' : 'hi';
    }, [min, max]);

    const [lo, hi] = values;
    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    const thumbCls = (which: 'lo' | 'hi') =>
        cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-7 h-7 rounded-full bg-background border-[2.5px] border-primary',
            'shadow-[0_2px_10px_rgba(0,0,0,0.4)] pointer-events-none transition-transform duration-75',
            activeState === which && 'scale-125 shadow-[0_0_0_8px_hsl(var(--primary)/0.2)]',
        );

    return (
        <div
            ref={trackRef}
            className={cn('relative flex items-center w-full select-none cursor-pointer', className)}
            style={{ height: 44, touchAction: 'none' }}
            data-vaul-no-drag
            onTouchStart={(e) => {
                if (disabled) return;
                const thumb = closestThumb(e.touches[0].clientX);
                activeThumb.current = thumb;
                setActiveState(thumb);
                applyMoveRef.current(e.touches[0].clientX, thumb);
                e.stopPropagation();
            }}
            onMouseDown={(e) => {
                if (disabled) return;
                const thumb = closestThumb(e.clientX);
                activeThumb.current = thumb;
                setActiveState(thumb);
                applyMoveRef.current(e.clientX, thumb);
            }}
        >
            {/* Track BG */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />
            {/* Fill entre os dois thumbs */}
            <div
                className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
            />
            {/* Low thumb */}
            <div className={thumbCls('lo')} style={{ left: `${loPct}%` }} />
            {/* High thumb */}
            <div className={thumbCls('hi')} style={{ left: `${hiPct}%` }} />
        </div>
    );
}
