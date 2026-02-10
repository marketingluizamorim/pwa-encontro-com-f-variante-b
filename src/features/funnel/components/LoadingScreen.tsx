import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Users, Loader2, Cpu, CheckCircle, ShieldCheck, Bot } from 'lucide-react';
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { getProfilesData } from "../utils/profiles";

interface LoadingScreenProps {
    onComplete: () => void;
    gender: 'male' | 'female' | null;
}

const STAGES = [
    {
        icon: Cpu,
        text: 'Iniciando análise profunda...',
        subtext: 'Mapeando padrões de afinidade comportamental',
        animation: 'animate-spin-slow',
        color: 'text-teal-300',
        glow: 'bg-teal-400'
    },
    {
        icon: Loader2,
        text: 'Cruzando padrões locais...',
        subtext: 'Escaneando base de dados da sua região',
        animation: 'animate-spin',
        color: 'text-white',
        glow: 'bg-white'
    },
    {
        icon: MapPin,
        text: 'Filtrando compatibilidade...',
        subtext: 'Verificando alinhamento de valores e crenças',
        animation: 'animate-bounce',
        color: 'text-amber-400',
        glow: 'bg-amber-500'
    },
    {
        icon: Users,
        text: 'Validando perfis ativos...',
        subtext: 'Garantindo conexões reais e próximas',
        animation: 'animate-float',
        color: 'text-teal-400',
        glow: 'bg-teal-500'
    },
    {
        icon: Heart,
        text: 'Finalizando sintonização...',
        subtext: 'Preparando sua lista personalizada',
        animation: 'animate-ping',
        color: 'text-amber-500',
        glow: 'bg-amber-600'
    },
];

export function LoadingScreen({ onComplete, gender }: LoadingScreenProps) {
    const { quizAnswers } = useFunnelStore();

    const profileNames = useMemo(() => {
        const profiles = getProfilesData(gender, quizAnswers);
        return profiles.map(p => p.name);
    }, [gender, quizAnswers]);

    const [currentStage, setCurrentStage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showFinalMessage, setShowFinalMessage] = useState(false);
    const [discoveredNames, setDiscoveredNames] = useState<string[]>([]);

    const progressRef = useRef(0);
    const isFinalRef = useRef(false);
    const nameIndexRef = useRef(0);
    const isSearchingRef = useRef(true);
    const onCompleteRef = useRef(onComplete);
    const profileNamesRef = useRef(profileNames);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        profileNamesRef.current = profileNames;
    }, [onComplete, profileNames]);

    useEffect(() => {
        // Stage Timing: 5 stages * 2000ms = 10s to complete
        const STAGE_DURATION = 2000;
        const TOTAL_STEPS = 100;
        const PROGRESS_TICK = (STAGE_DURATION * STAGES.length) / TOTAL_STEPS; // exactly 100ms

        const searchTimeout = setTimeout(() => {
            isSearchingRef.current = false;
            setDiscoveredNames([]);
        }, 2500);

        setDiscoveredNames(['Buscando...']);

        const stageInterval = setInterval(() => {
            setCurrentStage((prev) => {
                if (prev >= STAGES.length - 1) {
                    clearInterval(stageInterval);
                    setShowFinalMessage(true);
                    isFinalRef.current = true;
                    setProgress(100); // Sync bar to 100% exactly on finish
                    setTimeout(() => {
                        onCompleteRef.current();
                    }, 2400);
                    return prev;
                }
                return prev + 1;
            });
        }, STAGE_DURATION);

        const nameInterval = setInterval(() => {
            const curProg = progressRef.current;
            const isFin = isFinalRef.current;
            const names = profileNamesRef.current;
            const currentlySearching = isSearchingRef.current;

            // Stop showing names as soon as analysis enters final state or 92%
            if (!currentlySearching && curProg > 5 && curProg < 92 && !isFin) {
                if (nameIndexRef.current < names.length) {
                    const nameToFind = names[nameIndexRef.current];
                    nameIndexRef.current += 1;
                    setDiscoveredNames([nameToFind]);
                    setTimeout(() => {
                        setDiscoveredNames(prev => prev.filter(n => n !== nameToFind));
                    }, 1200);
                }
            }
        }, 1500);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (isFinalRef.current) {
                    clearInterval(progressInterval);
                    return 100;
                }
                const next = prev >= 100 ? 100 : prev + 1;
                progressRef.current = next;
                return next;
            });
        }, PROGRESS_TICK);

        return () => {
            clearTimeout(searchTimeout);
            clearInterval(stageInterval);
            clearInterval(progressInterval);
            clearInterval(nameInterval);
        };
    }, []);

    const CurrentIcon = STAGES[currentStage].icon;

    return (
        <div className="fixed inset-0 bg-[#0f172a] flex flex-col font-sans overflow-hidden">
            {/* Background Ambience - Clean & Premium */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Main ambient light - Top Center (Teal/Blue mix) */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-[#0f172a]/0 to-transparent blur-[90px]" />

                {/* Bottom warm light - (Amber/Gold mix) for grounding */}
                <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/15 via-[#0f172a]/0 to-transparent blur-[110px]" />

                {/* Global Noise Texture for cinematic feel */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-1 px-6 py-6">
                <div className="flex items-center justify-start mb-6">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-[8px] text-white/70 font-bold tracking-widest uppercase">
                            Conexão Segura
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-full space-y-14">

                        <div className="relative flex justify-center">
                            <div className="absolute inset-[-40px] rounded-full border border-white/5 animate-spin-slow opacity-20" />

                            <div className="w-40 h-40 rounded-full bg-white/5 border border-white/20 flex items-center justify-center relative shadow-xl overflow-hidden">
                                <div className="relative z-10 flex items-center justify-center">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {showFinalMessage ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: 'spring', damping: 20 }}
                                            >
                                                <CheckCircle className="w-20 h-20 text-white" strokeWidth={1.5} />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={currentStage}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <CurrentIcon
                                                    className={`w-20 h-20 ${STAGES[currentStage].color} ${STAGES[currentStage].animation}`}
                                                    strokeWidth={1.5}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="h-24 flex flex-col items-center justify-start px-2">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {!showFinalMessage ? (
                                    <motion.div
                                        key={currentStage}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="space-y-3 will-change-transform"
                                    >
                                        <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                                            {STAGES[currentStage].text}
                                        </h2>
                                        <p className="text-white/70 text-base font-medium tracking-wide">
                                            {STAGES[currentStage].subtext}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="final"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4 will-change-transform"
                                    >
                                        <h2 className="text-4xl font-serif font-bold text-white">
                                            Análise Completa!
                                        </h2>
                                        <p className="text-white/90 text-xl font-medium">
                                            Identificamos {gender === 'male' ? (
                                                <span className="text-amber-400 font-bold">mulheres</span>
                                            ) : (
                                                <span className="text-amber-400 font-bold">homens</span>
                                            )} com alta compatibilidade.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            {!showFinalMessage && (
                                <div className="h-14 relative w-full flex justify-center items-center">
                                    <AnimatePresence mode="popLayout">
                                        {discoveredNames.length > 0 && (
                                            <motion.div
                                                key={discoveredNames[0]}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute bg-black/60 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-teal-400" />
                                                <span className="text-sm text-white font-bold tracking-tight whitespace-nowrap">
                                                    {discoveredNames[0] === 'Buscando...' ? 'Buscando conexões...' : `${discoveredNames[0]} identificada`}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase">
                                    Análise IA
                                </span>
                                <div className="flex items-center gap-3 px-4 h-6">
                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${progress}%` }}
                                            className="h-full bg-amber-400 rounded-full transition-all duration-300 ease-out"
                                        />
                                    </div>
                                    <span className="text-amber-400 font-mono text-[10px] font-bold">{progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex items-center justify-start pt-6 pb-2">
                    <div className="opacity-30 flex items-center gap-2">
                        <Bot className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] text-white font-bold tracking-[0.4em] uppercase">
                            Processamento Inteligente
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
