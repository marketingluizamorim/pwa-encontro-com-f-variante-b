/**
 * NativeSlider — styled native <input type="range"> with CSS-only theming.
 *
 * WHY NATIVE?
 * Vaul (Drawer library) intercepts pointer events at the capture phase via
 * onPointerDownCapture on the DrawerContent root. This fires BEFORE any
 * JavaScript on child elements, including setPointerCapture on custom thumbs.
 *
 * Native <input type="range"> is processed by the browser at a lower level
 * than JavaScript capture listeners. The browser's built-in drag handling
 * for range inputs takes priority over JavaScript event capture.
 *
 * Additionally, vaul respects the `data-vaul-no-drag` attribute: when the
 * drag starts on an element with this attribute (or its ancestor), vaul
 * completely skips its drawer-close gesture handling.
 *
 * Combined, these two techniques guarantee drag works inside any Drawer.
 */

import { cn } from '@/lib/utils';
import './native-slider.css';

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
    const pct = ((value - min) / (max - min)) * 100;

    return (
        // data-vaul-no-drag tells vaul to skip its drawer-close gesture
        // when the pointer-down starts inside this container
        <div className={cn('py-2', className)} data-vaul-no-drag>
            <input
                type="range"
                className="native-slider"
                style={{ '--pct': `${pct}%` } as React.CSSProperties}
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
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
    const [lo, hi] = values;
    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    return (
        <div className={cn('relative py-2', className)} data-vaul-no-drag>
            {/* Shared track rendered behind both inputs */}
            <div className="range-track-container">
                <div
                    className="range-track-fill"
                    style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
                />
            </div>

            {/* Low thumb */}
            <input
                type="range"
                className="native-slider range-overlay"
                style={{ '--pct': `${loPct}%` } as React.CSSProperties}
                min={min}
                max={max}
                step={step}
                value={lo}
                disabled={disabled}
                onChange={(e) => {
                    const next = Math.min(Number(e.target.value), hi - step);
                    onChange([next, hi]);
                }}
            />

            {/* High thumb */}
            <input
                type="range"
                className="native-slider range-overlay"
                style={{ '--pct': `${hiPct}%` } as React.CSSProperties}
                min={min}
                max={max}
                step={step}
                value={hi}
                disabled={disabled}
                onChange={(e) => {
                    const next = Math.max(Number(e.target.value), lo + step);
                    onChange([lo, next]);
                }}
            />
        </div>
    );
}
