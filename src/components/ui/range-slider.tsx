/**
 * TouchSlider — drag slider that works inside vaul Drawer.
 *
 * Architecture:
 * - Uses touch events (touchstart/touchmove/touchend) via React.
 * - The outer container has data-vaul-no-drag so vaul's swipe handler skips it.
 * - Tracks active drag state in refs (no state updates during drag = no lag).
 * - Supports single thumb and dual range thumbs.
 * - Premium visual: large hit area (44px), teal fill, scale-on-press thumb.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────────────────────

function snap(value: number, min: number, max: number, step: number): number {
    const snapped = Math.round((value - min) / step) * step + min;
    return Math.min(max, Math.max(min, snapped));
}

function clientXToValue(clientX: number, el: HTMLElement, min: number, max: number, step: number): number {
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snap(min + pct * (max - min), min, max, step);
}

// ── Thumb component ───────────────────────────────────────────────────────────

function Thumb({ pct, active }: { pct: number; active: boolean }) {
    return (
        <div
            className={cn(
                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                'w-7 h-7 rounded-full bg-background border-[2.5px] border-primary',
                'shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform duration-75',
                active && 'scale-125 shadow-[0_0_0_8px_hsl(var(--primary)/0.2)]',
            )}
            style={{ left: `${pct}%` }}
        />
    );
}

// ── Track / Fill ──────────────────────────────────────────────────────────────

function Track({
    fillLeft,
    fillWidth,
    children,
}: {
    fillLeft: number;
    fillWidth: number;
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex items-center w-full h-11">
            {/* Track bg */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10 pointer-events-none" />
            {/* Fill */}
            <div
                className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary pointer-events-none"
                style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
            />
            {children}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Single Slider
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
    const dragging = useRef(false);
    const [active, setActive] = useState(false);

    const pct = ((value - min) / (max - min)) * 100;

    const getValue = useCallback(
        (clientX: number) => clientXToValue(clientX, trackRef.current!, min, max, step),
        [min, max, step],
    );

    const onTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
        // Only start drag if touch is near the thumb (within 36px)
        const rect = trackRef.current!.getBoundingClientRect();
        const thumbX = rect.left + (pct / 100) * rect.width;
        const touchX = e.touches[0].clientX;
        if (Math.abs(touchX - thumbX) > 44) {
            // Touch on track: jump to position immediately
            onChange(getValue(touchX));
        }
        dragging.current = true;
        setActive(true);
        e.stopPropagation();
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!dragging.current || disabled) return;
        e.preventDefault(); // prevent page scroll while dragging
        e.stopPropagation();
        onChange(getValue(e.touches[0].clientX));
    };

    const onTouchEnd = () => {
        dragging.current = false;
        setActive(false);
    };

    return (
        <div
            ref={trackRef}
            className={cn('relative cursor-pointer select-none', className)}
            data-vaul-no-drag
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            // Mouse support for desktop
            onMouseDown={(e) => {
                if (disabled) return;
                dragging.current = true;
                setActive(true);
                onChange(getValue(e.clientX));
                const move = (ev: MouseEvent) => { if (dragging.current) onChange(getValue(ev.clientX)); };
                const up = () => { dragging.current = false; setActive(false); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
            }}
        >
            <Track fillLeft={0} fillWidth={pct}>
                <Thumb pct={pct} active={active} />
            </Track>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Range Slider (two thumbs)
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
    // 'lo' | 'hi' | null
    const activeThumb = useRef<'lo' | 'hi' | null>(null);
    const [activeState, setActiveState] = useState<'lo' | 'hi' | null>(null);

    const [lo, hi] = values;
    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    const getValue = useCallback(
        (clientX: number) => clientXToValue(clientX, trackRef.current!, min, max, step),
        [min, max, step],
    );

    // Determine which thumb is closer to the touch point
    const closestThumb = useCallback(
        (clientX: number): 'lo' | 'hi' => {
            const rect = trackRef.current!.getBoundingClientRect();
            const loX = rect.left + (loPct / 100) * rect.width;
            const hiX = rect.left + (hiPct / 100) * rect.width;
            return Math.abs(clientX - loX) <= Math.abs(clientX - hiX) ? 'lo' : 'hi';
        },
        [loPct, hiPct],
    );

    const applyValue = useCallback(
        (rawValue: number, thumb: 'lo' | 'hi') => {
            if (thumb === 'lo') {
                onChange([Math.min(rawValue, hi - step), hi]);
            } else {
                onChange([lo, Math.max(rawValue, lo + step)]);
            }
        },
        [lo, hi, step, onChange],
    );

    const onTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
        const clientX = e.touches[0].clientX;
        const thumb = closestThumb(clientX);
        activeThumb.current = thumb;
        setActiveState(thumb);
        applyValue(getValue(clientX), thumb);
        e.stopPropagation();
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!activeThumb.current || disabled) return;
        e.preventDefault();
        e.stopPropagation();
        applyValue(getValue(e.touches[0].clientX), activeThumb.current);
    };

    const onTouchEnd = () => {
        activeThumb.current = null;
        setActiveState(null);
    };

    return (
        <div
            ref={trackRef}
            className={cn('relative cursor-pointer select-none', className)}
            data-vaul-no-drag
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            // Mouse support
            onMouseDown={(e) => {
                if (disabled) return;
                const thumb = closestThumb(e.clientX);
                activeThumb.current = thumb;
                setActiveState(thumb);
                applyValue(getValue(e.clientX), thumb);
                const move = (ev: MouseEvent) => {
                    if (activeThumb.current) applyValue(getValue(ev.clientX), activeThumb.current);
                };
                const up = () => {
                    activeThumb.current = null;
                    setActiveState(null);
                    window.removeEventListener('mousemove', move);
                    window.removeEventListener('mouseup', up);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
            }}
        >
            <Track fillLeft={loPct} fillWidth={hiPct - loPct}>
                <Thumb pct={loPct} active={activeState === 'lo'} />
                <Thumb pct={hiPct} active={activeState === 'hi'} />
            </Track>
        </div>
    );
}
