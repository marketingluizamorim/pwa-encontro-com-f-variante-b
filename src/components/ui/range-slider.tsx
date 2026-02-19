/**
 * DualRangeSlider — double range slider com dois handles arrastáveis.
 *
 * Implementação: dois <input type="range"> sobrepostos com CSS.
 * O browser lida com toda a mecânica de drag nativamente, o que é
 * à prova de falha em qualquer container (Drawer, Modal, etc).
 *
 * Requer no Drawer pai: dismissible={false}  ← deixa vaul fora do caminho.
 * Requer no wrapper:    data-vaul-no-drag    ← segunda camada de proteção.
 *
 * Features:
 * - Labels flutuantes sobre cada handle mostrando o valor em tempo real
 * - Fill colorido entre os dois thumbs
 * - Animação de escala ao pressionar
 * - Cross-browser: webkit (iOS Safari / Chrome) e moz (Firefox)
 */

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import './dual-range-slider.css';

// ══════════════════════════════════════════════════════════════════════════════
// Dual Range Slider (dois handles — ex: faixa de idade)
// ══════════════════════════════════════════════════════════════════════════════

interface DualRangeSliderProps {
    values: [number, number];
    onChange: (values: [number, number]) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    className?: string;
}

export function DualRangeSlider({
    values,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    disabled = false,
    className,
}: DualRangeSliderProps) {
    const [lo, hi] = values;
    const loPct = ((lo - min) / (max - min)) * 100;
    const hiPct = ((hi - min) / (max - min)) * 100;

    const handleLo = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const next = Math.min(Number(e.target.value), hi - step);
            onChange([next, hi]);
        },
        [hi, step, onChange],
    );

    const handleHi = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const next = Math.max(Number(e.target.value), lo + step);
            onChange([lo, next]);
        },
        [lo, step, onChange],
    );

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            {/* Labels flutuantes sobre os handles */}
            <div className="relative mb-6 mx-[14px]">
                {/* Label do handle mínimo */}
                <div
                    className="absolute -translate-x-1/2 transition-all duration-75"
                    style={{ left: `${loPct}%` }}
                >
                    <div className="relative flex flex-col items-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                            {lo}{unit}
                        </span>
                        <div className="w-px h-2 bg-primary/40 mt-0.5" />
                    </div>
                </div>

                {/* Label do handle máximo */}
                <div
                    className="absolute -translate-x-1/2 transition-all duration-75"
                    style={{ left: `${hiPct}%` }}
                >
                    <div className="relative flex flex-col items-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                            {hi}{unit}
                        </span>
                        <div className="w-px h-2 bg-primary/40 mt-0.5" />
                    </div>
                </div>
            </div>

            {/* Track + thumbs */}
            <div className="relative mx-[14px]" style={{ height: 44 }}>
                {/* Track background */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10" />

                {/* Fill colorido entre os handles */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }}
                />

                {/* Input LO */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={lo}
                    disabled={disabled}
                    onChange={handleLo}
                    data-vaul-no-drag
                    className="dual-range-input"
                    style={{ '--pct': `${loPct}%` } as React.CSSProperties}
                />

                {/* Input HI */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={hi}
                    disabled={disabled}
                    onChange={handleHi}
                    data-vaul-no-drag
                    className="dual-range-input dual-range-input-hi"
                    style={{ '--pct': `${hiPct}%` } as React.CSSProperties}
                />
            </div>

            {/* Limites mínimo/máximo */}
            <div className="flex justify-between mt-1 mx-[14px]">
                <span className="text-xs text-muted-foreground">{min}{unit}</span>
                <span className="text-xs text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Single Slider (um handle — ex: distância máxima)
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
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn('w-full', className)} data-vaul-no-drag>
            {/* Label flutuante */}
            <div className="relative mb-6 mx-[14px]">
                <div
                    className="absolute -translate-x-1/2 transition-all duration-75"
                    style={{ left: `${pct}%` }}
                >
                    <div className="relative flex flex-col items-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary/30 whitespace-nowrap">
                            {value}{unit}
                        </span>
                        <div className="w-px h-2 bg-primary/40 mt-0.5" />
                    </div>
                </div>
            </div>

            {/* Track + thumb */}
            <div className="relative mx-[14px]" style={{ height: 44 }}>
                {/* Track bg */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-white/10" />
                {/* Fill */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-[6px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    style={{ left: 0, width: `${pct}%` }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(Number(e.target.value))}
                    data-vaul-no-drag
                    className="dual-range-input"
                    style={{ '--pct': `${pct}%` } as React.CSSProperties}
                />
            </div>

            {/* Limites */}
            <div className="flex justify-between mt-1 mx-[14px]">
                <span className="text-xs text-muted-foreground">{min}{unit}</span>
                <span className="text-xs text-muted-foreground">{max}{unit}</span>
            </div>
        </div>
    );
}

// Alias para compatibilidade
export { DualRangeSlider as RangeSlider };
