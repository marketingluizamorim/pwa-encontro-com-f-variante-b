import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { useLocationModal } from '@/contexts/LocationModalContext';

interface LocationPermissionModalProps {
    onActivate: () => void;
    onDismiss: () => void;
}

export function LocationPermissionModal({ onActivate, onDismiss }: LocationPermissionModalProps) {
    const { showLocationModal, isShaking, shakeModal } = useLocationModal();

    const handleBackdropClick = () => {
        triggerHaptic('light');
        shakeModal();
    };

    return (
        <AnimatePresence>
            {showLocationModal && (
                <>
                    {/* Backdrop — blocks interaction, shakes modal on click */}
                    <motion.div
                        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                    />

                    {/* Centered modal wrapper */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
                        <motion.div
                            className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-5 pointer-events-auto"
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={isShaking
                                ? { scale: 1, opacity: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }
                                : { scale: 1, opacity: 1, y: 0, x: 0 }
                            }
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={isShaking
                                ? { duration: 0.45, ease: 'easeInOut' }
                                : { type: 'spring', damping: 22, stiffness: 320 }
                            }
                        >
                            {/* Close button — inside the card, top-right corner */}
                            <button
                                onClick={onDismiss}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Content */}
                            <div className="flex items-start gap-4 pr-8">
                                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-5 h-5 text-amber-400" />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-white text-sm leading-snug">
                                        Localização negada.
                                    </p>
                                    <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                                        Ative para ver pessoas próximas a você.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={onDismiss}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Mais tarde
                                </button>

                                {/* Pulsing "Ativar Agora" button */}
                                <motion.button
                                    onClick={onActivate}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#0f172a] bg-amber-400 hover:bg-amber-300 active:scale-95 transition-colors"
                                    animate={{
                                        scale: [1, 1.04, 1],
                                        boxShadow: [
                                            '0 0 0px 0px rgba(251,191,36,0)',
                                            '0 0 0px 6px rgba(251,191,36,0.3)',
                                            '0 0 0px 0px rgba(251,191,36,0)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 1.6,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    Ativar Agora
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
