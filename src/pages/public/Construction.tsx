import { Construction as ConstructionIcon, Timer } from "lucide-react";

export default function Construction() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">

                {/* Icon Container */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-amber-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                    <div className="relative bg-white/5 border border-white/10 rounded-2xl w-full h-full flex items-center justify-center backdrop-blur-sm shadow-2xl">
                        <ConstructionIcon className="w-10 h-10 text-white/90" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70 tracking-tight drop-shadow-sm">
                        Em Construção
                    </h1>
                    <p className="text-lg text-white/60 leading-relaxed font-light px-4">
                        Estamos preparando algo extraordinário para você. <br className="hidden sm:block" />
                        Novidades em breve.
                    </p>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </div>
                    <span className="text-xs font-medium text-white/50 tracking-wider uppercase">
                        Desenvolvimento em progresso
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 w-full text-center">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">
                    Encontro com F &copy; 2026
                </p>
            </div>
        </div>
    );
}
