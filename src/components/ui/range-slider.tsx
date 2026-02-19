/**
 * RangeSlider — custom touch-friendly slider using Pointer Events + setPointerCapture.
 *
 * Why not Radix Slider?
 * → Radix uses pointer events internally but does NOT call setPointerCapture on the thumb.
 *   Inside a Drawer (vaul), the Drawer's root intercepts pointer events first and "steals"
 *   the drag, making it feel broken on mobile.
 *
 * This implementation calls e.currentTarget.setPointerCapture(e.pointerId) on pointerdown,
 * which transfers all subsequent pointer events (including move/up) exclusively to the thumb
 * element — bypassing the Drawer entirely.
 *
 * Works on: iOS Safari, Android Chrome, desktop browsers.
 */

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Single Thumb ─────────────────────────────────────────────────────────────

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

    const clamp = (v: number) => Math.min(max, Math.max(min, v));

    const snap = (v: number) => {
        const snapped = Math.round((v - min) / step) * step + min;
        return clamp(snapped);
    };

    const posToValue = useCallback(
        (clientX: number) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return value;
            const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return snap(min + pct * (max - min));
        },
        [min, max, step, value]
    );

    const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        // ← THE KEY: capture all future pointer events to this element
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        e.preventDefault();
        e.stopPropagation();
        onChange(posToValue(e.clientX));
    };

    const handleTrackClick = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        onChange(posToValue(e.clientX));
    };

    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div
            className={cn('relative flex items-center w-full h-10 select-none', className)}
            onPointerDown={handleTrackClick}
        >
            {/* Track */}
            <div
                ref={trackRef}
                className="relative h-2 w-full rounded-full bg-white/10"
            >
                {/* Fill */}
                <div
                    className="absolute h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Thumb */}
            <div
                className="absolute w-7 h-7 rounded-full bg-background border-2 border-primary shadow-lg shadow-primary/20 cursor-grab active:cursor-grabbing active:scale-110 transition-transform"
                style={{ left: `calc(${pct}% - 14px)`, touchAction: 'none' }}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
            />
        </div>
    );
}

// ─── Dual Thumb Range ─────────────────────────────────────────────────────────

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
    const [lo, hi] = values;

    const clamp = (v: number) => Math.min(max, Math.max(min, v));

    const snap = (v: number) => {
        const snapped = Math.round((v - min) / step) * step + min;
        return clamp(snapped);
    };

    const posToValue = useCallback(
        (clientX: number) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return min;
            const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return snap(min + pct * (max - min));
        },
        [min, max, step]
    );

    const handleLoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleLoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
        e.preventDefault();
        e.stopPropagation();
        const newLo = posToValue(e.clientX);
        onChange([Math.min(newLo, hi - step), hi]);
    };

    const handleHiPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleHiPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
        e.preventDefault();
        e.stopPropagation();
        const newHi = posToValue(e.clientX);
        onChange([lo, Math.max(newHi, lo + step)]);
    };

    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    const thumbBase =
        'absolute w-7 h-7 rounded-full bg-background border-2 border-primary shadow-lg shadow-primary/20 cursor-grab active:cursor-grabbing active:scale-110 transition-transform z-10';

    return (
        <div
            className={cn('relative flex items-center w-full h-10 select-none', className)}
        >
            {/* Track */}
            <div
                ref={trackRef}
                className="relative h-2 w-full rounded-full bg-white/10"
            >
                {/* Fill between thumbs */}
                <div
                    className="absolute h-full rounded-full bg-primary"
                    style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
                />
            </div>

            {/* Low thumb */}
            <div
                className={thumbBase}
                style={{ left: `calc(${loPct}% - 14px)`, touchAction: 'none' }}
                onPointerDown={handleLoPointerDown}
                onPointerMove={handleLoPointerMove}
            />

            {/* High thumb */}
            <div
                className={thumbBase}
                style={{ left: `calc(${hiPct}% - 14px)`, touchAction: 'none' }}
                onPointerDown={handleHiPointerDown}
                onPointerMove={handleHiPointerMove}
            />
        </div>
    );
}
