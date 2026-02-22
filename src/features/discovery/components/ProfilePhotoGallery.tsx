import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile } from '../types/profile';

interface ProfilePhotoGalleryProps {
    profile: Profile;
    currentPhotoIndex: number;
    onNextPhoto: (e: React.MouseEvent) => void;
    onPrevPhoto: (e: React.MouseEvent) => void;
    dragControls?: any;
    className?: string;
    showBoostedBadge?: boolean;
}

export const ProfilePhotoGallery: React.FC<ProfilePhotoGalleryProps> = ({
    profile,
    currentPhotoIndex,
    onNextPhoto,
    onPrevPhoto,
    dragControls,
    className,
    showBoostedBadge = true,
}) => {
    const photos = profile.photos || [profile.avatar_url || '/placeholder.svg'];

    return (
        <motion.div
            className={cn(
                "relative w-full h-[60vh] touch-none cursor-grab active:cursor-grabbing border-b-4 border-background",
                className
            )}
            onPointerDown={(e) => dragControls?.start(e)}
        >
            {/* Photo Stories Progress Bar */}
            {photos.length > 1 && (
                <div className="absolute top-[calc(1.25rem+env(safe-area-inset-top))] left-3 right-3 z-40 flex gap-1.5 h-1">
                    {photos.map((_, idx) => (
                        <div
                            key={idx}
                            className={`flex-1 rounded-full h-full shadow-sm transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white scale-y-110 shadow-lg' : 'bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation Zones (Left/Right) */}
            <div className="absolute inset-0 z-30 flex">
                <div className="w-1/2 h-full cursor-pointer" onClick={onPrevPhoto} />
                <div className="w-1/2 h-full cursor-pointer" onClick={onNextPhoto} />
            </div>

            <img
                src={photos[currentPhotoIndex]}
                className="w-full h-full object-cover pointer-events-none"
                alt={profile.display_name}
            />

            {/* Gradient for Readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

            {/* Boosted Badge */}
            {showBoostedBadge && profile.is_boosted && (
                <div className="absolute bottom-24 left-5 z-40 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcd34d] to-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                    <Zap className="w-3 h-3 fill-black animate-pulse" />
                    <span>Perfil em Destaque</span>
                </div>
            )}
        </motion.div>
    );
};
