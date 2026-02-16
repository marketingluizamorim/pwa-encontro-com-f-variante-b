import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    action?: React.ReactNode;
    className?: string;
    isDiscover?: boolean;
}

export function Header({ action, className, isDiscover }: HeaderProps) {
    return (
        <header className={cn("relative z-50 px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex justify-between items-center shrink-0 w-full mt-1", className)}>
            <div className="flex items-center gap-3">
                {/* Logo Brand from Landing Page - Translucent Watermark Effect */}
                <div className="flex items-center gap-3 opacity-40 grayscale-[0.2] hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default">
                    <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309]">
                        <div className="w-full h-full rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center border border-white/10 overflow-hidden relative">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                    </div>

                    <h1 className="font-serif font-bold text-lg text-foreground tracking-tight">
                        Encontro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37]">com Fé</span>
                    </h1>
                </div>

                {isDiscover && (
                    <div className="hidden xs:flex items-center gap-2 px-2 py-1 rounded-full bg-background/40 backdrop-blur-md border border-border/50 ml-2">
                        <i className="ri-fire-fill text-accent text-xs" />
                        <span className="text-[10px] font-bold text-accent tracking-wider uppercase">Premium</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {action}
            </div>
        </header>
    );
}
