import React from 'react';
import { Button } from '@/components/ui/button';
import {
    MessageCircle, Zap, Search, MapPin, Home, Heart, User2, MoreHorizontal,
    UserCircle, Dumbbell, Wine, Cigarette, LayoutList, Baby, Sparkles,
    PawPrint, Ban, AlertTriangle, Briefcase, BookOpen, GraduationCap, Languages
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { calculateAge, formatLastActive } from '@/lib/date-utils';
import { calculateDistance } from '@/lib/geo-utils';

import { Profile } from '../types/profile';
import { LOOKING_FOR_EMOJIS } from '../constants/profile-options';

interface ProfileDetailsProps {
    profile: Profile;
    userCoords?: { latitude: number; longitude: number } | null;
    showDirectMessage?: boolean;
    onSendMessage?: () => void;
    onReport?: () => void;
    onBlock?: () => void;
    // Ações de swipe caso necessário (para o Discover)
    onSwipe?: (direction: 'like' | 'dislike' | 'super_like') => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
    profile,
    userCoords,
    showDirectMessage = false,
    onSendMessage,
    onReport,
    onBlock,
    onSwipe,
}) => {
    if (!profile) return null;

    const status = formatLastActive(profile.last_active_at, profile.show_online_status, profile.show_last_active);
    const distance = userCoords
        ? calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            profile.latitude,
            profile.longitude
        )
        : null;

    return (
        <div className="px-4 -mt-16 relative z-10 space-y-4 pb-12">
            {/* Name, Age & Verified */}
            <div className="px-1 mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-4xl text-white tracking-tight">
                        <span className="font-bold">{profile.display_name}</span>
                        <span className="font-extralight text-white/60 ml-2">
                            {profile.birth_date ? calculateAge(profile.birth_date) : ''}
                        </span>
                    </div>
                </div>

                {/* Atividade Recente */}
                {status && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-emerald-500 font-medium text-[15px]">
                        <div className={cn("w-2 h-2 rounded-full", status === 'Online' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-emerald-500/50")} />
                        <span>{status === 'Online' ? 'Online agora' : status}</span>
                    </div>
                )}
            </div>

            {/* Section: About Me */}
            {profile.bio && (
                <div className="px-1 space-y-3 pt-2 pb-4">
                    <h3 className="text-lg font-bold text-white">Sobre mim</h3>
                    <p className="text-[17px] text-white/70 leading-relaxed">
                        {profile.bio}
                    </p>
                </div>
            )}

            {/* Section: Looking For */}
            {profile.looking_for && (
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/40">
                            <Search className="w-4 h-4" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Tô procurando</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">
                                {LOOKING_FOR_EMOJIS[profile.looking_for] || '💍'}
                            </span>
                            <span className="text-xl font-bold text-white">
                                {profile.looking_for}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Section: Basic Info */}
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-white">
                        <User2 className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Informações básicas</h3>
                    </div>

                    {(onReport || onBlock) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-2xl p-1 z-[10000]"
                                // Prevent collision with touch events
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                {onReport && (
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            // Pequeno delay para garantir que o menu fechou
                                            setTimeout(() => onReport(), 150);
                                        }}
                                        className="flex items-center gap-2 p-3 text-amber-500 focus:bg-amber-500/10 focus:text-amber-500 rounded-xl cursor-pointer"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Denunciar
                                    </DropdownMenuItem>
                                )}
                                {onBlock && (
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            // Pequeno delay para garantir que o menu fechou
                                            setTimeout(() => onBlock(), 150);
                                        }}
                                        className="flex items-center gap-2 p-3 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 rounded-xl cursor-pointer"
                                    >
                                        <Ban className="w-4 h-4" />
                                        Bloquear
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="px-5 pb-2">
                    {/* Distance Row */}
                    {distance && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <MapPin className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90">{distance}</span>
                        </div>
                    )}

                    {/* City & State */}
                    {(profile.city || profile.state) && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <Home className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90 leading-tight">
                                Mora em/no {profile.city}
                                {profile.state ? `, ${profile.state}` : ''}
                            </span>
                        </div>
                    )}

                    {/* Occupation */}
                    {profile.occupation && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <Briefcase className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90 leading-tight">Trabalha como {profile.occupation}</span>
                        </div>
                    )}

                    {/* Religion */}
                    {profile.religion && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <BookOpen className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90 leading-tight">{profile.religion}</span>
                        </div>
                    )}

                    {/* Education */}
                    {profile.education && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <GraduationCap className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90 leading-tight">{profile.education}</span>
                        </div>
                    )}

                    {/* Gender */}
                    {profile.gender && (
                        <div className="py-3.5 border-t border-white/5 flex items-center gap-3.5 group">
                            <UserCircle className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                            <span className="text-[15px] font-medium text-white/90 leading-tight">
                                {profile.gender.toLowerCase() === 'male' ? 'Homem' :
                                    profile.gender.toLowerCase() === 'female' ? 'Mulher' :
                                        profile.gender}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Lifestyle */}
            {((profile.pets || profile.drink || profile.smoke || profile.physical_activity || (profile.languages && profile.languages.length > 0))) && (
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 flex items-center gap-2.5 text-white border-b border-white/5">
                        <LayoutList className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Estilo de vida</h3>
                    </div>

                    <div className="px-5 py-2 space-y-4 divide-y divide-white/5">
                        {profile.pets && (
                            <div className="pt-4 first:pt-2">
                                <p className="text-xs font-bold text-white/40 mb-2">Pets</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <PawPrint className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.pets}</span>
                                </div>
                            </div>
                        )}

                        {profile.drink && (
                            <div className="pt-4">
                                <p className="text-xs font-bold text-white/40 mb-2">Bebida</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Wine className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.drink}</span>
                                </div>
                            </div>
                        )}

                        {profile.smoke && (
                            <div className="pt-4">
                                <p className="text-xs font-bold text-white/40 mb-2">Você fuma?</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Cigarette className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.smoke}</span>
                                </div>
                            </div>
                        )}

                        {profile.physical_activity && (
                            <div className="pt-4">
                                <p className="text-xs font-bold text-white/40 mb-2">Atividade física</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Dumbbell className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.physical_activity}</span>
                                </div>
                            </div>
                        )}

                        {profile.languages && profile.languages.length > 0 && (
                            <div className="pt-4 pb-2">
                                <p className="text-xs font-bold text-white/40 mb-2">Idiomas</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Languages className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">
                                        {Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section: More Info */}
            {(profile.about_children || profile.church_frequency) && (
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 flex items-center gap-2.5 text-white border-b border-white/5">
                        <LayoutList className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Mais informações</h3>
                    </div>

                    <div className="px-5 py-2 space-y-4 divide-y divide-white/5">
                        {profile.church_frequency && (
                            <div className="pt-4 first:pt-2">
                                <p className="text-xs font-bold text-white/40 mb-2">Frequência na Igreja</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Sparkles className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.church_frequency}</span>
                                </div>
                            </div>
                        )}

                        {profile.about_children && (
                            <div className="pt-4 pb-2">
                                <p className="text-xs font-bold text-white/40 mb-2">Família</p>
                                <div className="flex items-center gap-3 text-white/90">
                                    <Baby className="w-5 h-5 text-white/40" />
                                    <span className="text-[15px] font-medium">{profile.about_children}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interests */}
            {(profile.christian_interests || []).length > 0 && (
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 text-white">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Interesses</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(profile.christian_interests || []).map((tag: string) => (
                            <span key={tag} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Section: Direct Message (Direct Connect) */}
            {showDirectMessage && (
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Zap className="w-12 h-12 text-blue-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-blue-500 mb-2 flex items-center gap-2">
                        Mensagem Direta <Zap className="w-5 h-5 fill-blue-500" />
                    </h3>
                    <p className="text-sm text-white/60 mb-6 leading-relaxed">
                        Não espere pela conexão! Envie uma mensagem direta agora mesmo para {profile.display_name} e saia na frente.
                    </p>

                    <Button
                        onClick={onSendMessage}
                        className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Enviar Mensagem
                    </Button>
                </div>
            )}

            {/* Bottom Actions if in Discover */}
            {onSwipe && (
                <div className="flex justify-center gap-8 pt-4">
                    <button onClick={() => onSwipe('dislike')} className="w-16 h-16 rounded-full bg-card/40 border border-red-500/30 text-red-500 flex items-center justify-center hover:scale-110 transition-all">
                        <i className="ri-close-line text-4xl" />
                    </button>
                    <button onClick={() => onSwipe('like')} className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                        <i className="ri-heart-fill text-4xl" />
                    </button>
                </div>
            )}

            {/* Bottom Spacer */}
            <div className="h-12" />
        </div>
    );
};
