import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    action?: React.ReactNode;
    className?: string;
    isDiscover?: boolean;
}

export function Header({ action, className, isDiscover }: HeaderProps) {
    return (
        <header className={cn("relative z-50 px-6 py-4 flex justify-between items-center shrink-0 w-full", className)}>
            <div className="flex items-center gap-3">
                {/* Logo Brand from Landing Page - Scaled Down */}
                <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#d4af37] via-[#fcd34d] to-[#b45309] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-black/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner overflow-hidden relative">
                        <Heart className="w-5 h-5 text-white fill-white drop-shadow-md" />
                    </div>
                </div>

                <h1 className="font-serif font-bold text-xl text-foreground drop-shadow-md tracking-tight">
                    Encontro <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fcd34d] to-[#d4af37]">com Fé</span>
                </h1>

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
