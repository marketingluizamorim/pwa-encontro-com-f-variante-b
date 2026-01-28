import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { QuizAnswers } from "@/types/funnel";
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { MapPin, Lock, HandHeart, ArrowRight, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { getProfilesData, getStateAbbreviation } from "../utils/profiles";

interface ProfilesDisplayProps {
  gender: 'male' | 'female' | null;
  onViewPlans: () => void;
  onBack?: () => void;
}

export function ProfilesDisplay({ gender, onViewPlans, onBack }: ProfilesDisplayProps) {
  const { quizAnswers } = useFunnelStore();
  const profiles = getProfilesData(gender, quizAnswers);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f9b8e] to-[#1e3a8a] relative overflow-hidden pb-48 flex flex-col items-center w-full">
      {/* Mesh Gradient Background Blobs */}
      {/* Optimized Static Background for Mobile Performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.05),transparent_50%)]" />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Header Section */}
        <div className="pt-8 pb-8 px-6 text-center relative">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="absolute left-4 top-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full border border-white/20 mb-6"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold text-xs tracking-wider uppercase">
              {quizAnswers.city || 'Sua Região'}, {getStateAbbreviation(quizAnswers.state)}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif font-bold text-white mb-3"
          >
            Sua busca <span className="text-amber-400">teve sucesso!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm md:text-base leading-relaxed whitespace-nowrap text-center w-full"
          >
            Essas pessoas compartilham valores semelhantes.
          </motion.p>
        </div>

        {/* Profiles Grid */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {profiles.map((profile, index) => (
              <div
                key={`${profile.name}-${index}`}
                className="group relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[3/4.2] border border-white/10 fade-in-fast"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Profile Image with Hover Effects */}
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 2 ? "high" : "auto"}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!profile.unlocked ? 'blur-sm grayscale-0 opacity-60 brightness-75' : ''}`}
                  />

                  {/* Glassy Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/20 to-transparent" />
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  {profile.unlocked ? (
                    <div className="flex flex-col gap-2">
                      <div className="bg-amber-400 text-[#1e3a8a] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg font-bold text-[10px] uppercase tracking-wider">
                        <Heart className="w-3 h-3 fill-current" />
                        98% Match
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 px-2.5 py-1 rounded-full shadow-lg ml-auto">
                      <Lock className="w-3 h-3 text-white/80" />
                    </div>
                  )}
                </div>



                {/* Profile Information */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
                  <div className="space-y-1.5">
                    <h3 className="text-white font-bold text-lg flex items-center gap-1.5">
                      {profile.name}, {profile.age}
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                    </h3>

                    <div className="flex items-center gap-1.5 text-white/60">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span className="text-[11px] font-medium tracking-wide">
                        {profile.distance}
                      </span>
                    </div>

                    {profile.unlocked && (
                      <div className="flex gap-1.5 flex-nowrap mt-2.5 overflow-hidden">
                        {profile.interests.slice(0, 2).map(interest => (
                          <span key={interest} className="bg-black/40 px-2 py-1 rounded-md text-[8px] text-white font-bold uppercase tracking-wide whitespace-nowrap">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Locked Message Layer */}
                {!profile.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-2 pb-12"
                    >
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-1">Privado</p>
                      <button
                        onClick={onViewPlans}
                        className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white text-xs font-bold hover:bg-white/20 transition-all"
                      >
                        Desbloquear
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Locked Counter Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-center w-full shadow-lg">
              <p className="text-sm text-white/90 leading-relaxed">
                Libere <span className="text-amber-400 font-bold text-lg">+5</span> perfil bloqueados.<br />
                <span className="text-xs text-white/60">Clique no botão para ver fotos e começar a conversar.</span>
              </p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Floating Sticky CTA - Redesigned for Conversion */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e3a8a] via-[#1e3a8a]/95 to-transparent pt-32 pb-10 px-6 z-50">
        <div className="max-w-md mx-auto relative">
          {/* Social Proof label above button */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 left-0 right-0 text-center"
          >
            <p className="text-white text-xs font-bold tracking-tight drop-shadow-md">
              <HandHeart className="w-4 h-4 inline-block mr-1.5 text-amber-400" />
              Milhares de pessoas esperando por você
            </p>
          </motion.div>

          <button
            onClick={onViewPlans}
            className="group relative w-full bg-gradient-to-r from-teal-500 to-amber-500 text-white rounded-2xl py-5 px-8 font-bold text-lg shadow-[0_20px_50px_rgba(20,184,166,0.3)] hover:shadow-[0_20px_50px_rgba(20,184,166,0.5)] transition-all duration-300 overflow-hidden"
          >
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <span className="relative flex items-center justify-center gap-3 tracking-tight">
              VER QUEM QUER TE CONHECER
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </button>

          <p className="text-center text-white/30 text-[9px] font-bold tracking-[0.2em] mt-4 uppercase">
            Plataforma 100% Segura e Cristã
          </p>
        </div>
      </div>
    </div>
  );
}
