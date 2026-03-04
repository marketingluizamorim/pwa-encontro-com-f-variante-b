import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { MapPin, Lock, HandHeart, ArrowRight, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStateAbbreviation } from "../utils/profiles";
import { supabaseA } from '@/integrations/supabase/clientA';

interface ProfilesDisplayProps {
  gender: 'male' | 'female' | null;
  onViewPlans: () => void;
  onBack?: () => void;
}

interface DisplayProfile {
  name: string;
  age: number;
  photo: string;
  city: string;
  interests: string[];
}

const AGE_RANGE_MAP: Record<string, { min: number; max: number }> = {
  '18-25': { min: 18, max: 25 },
  '26-35': { min: 26, max: 35 },
  '36-55': { min: 36, max: 55 },
  '56+': { min: 56, max: 99 },
};

function citySeed(city: string | undefined): number {
  if (!city) return 42;
  return city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function ProfilesDisplay({ gender, onViewPlans, onBack }: ProfilesDisplayProps) {
  const { quizAnswers } = useFunnelStore();
  const userAgeRange = quizAnswers.age || '26-35';
  const userCity = quizAnswers.city || '';

  const [profiles, setProfiles] = useState<DisplayProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBots() {
      setLoading(true);
      const botGender = gender === 'male' ? 'female' : 'male';
      const ageRange = AGE_RANGE_MAP[userAgeRange] || { min: 18, max: 99 };
      const currentYear = new Date().getFullYear();
      const minBirth = `${currentYear - ageRange.max}-01-01`;
      const maxBirth = `${currentYear - ageRange.min}-12-31`;

      let { data } = await supabaseA
        .from('profiles')
        .select('user_id, display_name, birth_date, city, state, avatar_url')
        .eq('is_bot', true)
        .eq('gender', botGender)
        .not('avatar_url', 'is', null)
        .gte('birth_date', minBirth)
        .lte('birth_date', maxBirth)
        .limit(12);

      // Fallback se menos de 6 bots na faixa de idade
      if (!data || data.length < 6) {
        const { data: fallback } = await supabaseA
          .from('profiles')
          .select('user_id, display_name, birth_date, city, state, avatar_url')
          .eq('is_bot', true)
          .eq('gender', botGender)
          .not('avatar_url', 'is', null)
          .limit(12);
        data = fallback || [];
      }

      if (cancelled) return;

      const seed = citySeed(userCity);
      const shuffled = seededShuffle(data, seed);
      const selected = shuffled.slice(0, 6);

      const BASE_URL = 'https://cpqsfixvpbtbqoaarcjq.supabase.co/storage/v1/object/public/matches/';

      const mapped: DisplayProfile[] = selected.map((bot) => {
        const birthYear = bot.birth_date ? new Date(bot.birth_date).getFullYear() : 1990;
        const age = new Date().getFullYear() - birthYear;
        const avatarUrl = bot.avatar_url?.startsWith('http')
          ? bot.avatar_url
          : `${BASE_URL}${bot.avatar_url}`;

        return {
          name: bot.display_name || 'Anônimo',
          age,
          photo: avatarUrl,
          city: bot.city || userCity || 'Perto de você',
          interests: ['LOUVOR', 'DEVOCIONAL'],
        };
      });

      setProfiles(mapped);
      setLoading(false);
    }

    fetchBots();
    return () => { cancelled = true; };
  }, [gender, userAgeRange, userCity]);

  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#0f172a] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.2] rounded-[2rem] bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#0f172a] relative overflow-y-auto pb-52 flex flex-col items-center w-full">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/30 via-[#0f172a]/0 to-transparent blur-[90px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/15 via-[#0f172a]/0 to-transparent blur-[110px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
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
            className="text-white/70 text-sm md:text-base leading-relaxed text-center w-full"
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
                {/* Profile Image */}
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 2 ? "high" : "auto"}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${index > 0 ? 'blur-sm opacity-60 brightness-75' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/20 to-transparent" />
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  {index === 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="bg-amber-400 text-[#1e3a8a] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg font-bold text-[10px] uppercase tracking-wider">
                        <Heart className="w-3 h-3 fill-current" />
                        98%
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

                    {index === 0 ? (
                      <div className="flex items-center gap-1.5 text-white/60">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {quizAnswers.city || profile.city}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <svg className="w-3 h-3 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="text-[11px] font-medium tracking-wide italic">Perfil privado</span>
                      </div>
                    )}

                    {index === 0 && (
                      <div className="flex gap-1.5 flex-nowrap mt-2.5 overflow-hidden">
                        {profile.interests.map((badge) => (
                          <span key={badge} className="bg-black/40 px-2 py-1 rounded-md text-[8px] text-white font-bold uppercase tracking-wide whitespace-nowrap">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* Locked Message Layer — static div (no motion) to prevent flickering */}
                {index > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center space-y-2 pb-12">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-1">Privado</p>
                      <button
                        onClick={onViewPlans}
                        onMouseEnter={() => import('@/features/funnel/pages/Plans')}
                        className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white text-xs font-bold hover:bg-white/20 transition-all"
                      >
                        Desbloquear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Locked Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-4"
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

      {/* ── Floating CTA ──
          pointer-events-none on everything except the button itself,
          so touching the gradient or the social proof label still scrolls the page. */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* Gradient fade — purely visual */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/95 to-transparent" />

        <div className="relative max-w-md mx-auto px-6 pb-10 pt-32">
          {/* Social Proof — pointer-events-none so scroll passes through */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 left-0 right-0 text-center pointer-events-none"
          >
            <p className="text-white text-xs font-bold tracking-tight drop-shadow-md">
              <HandHeart className="w-4 h-4 inline-block mr-1.5 text-amber-400" />
              Milhares de pessoas esperando por você
            </p>
          </motion.div>

          {/* Button + footnote — only interactive zone */}
          <div className="pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewPlans}
              onMouseEnter={() => import('@/features/funnel/pages/Plans')}
              className="w-full h-14 md:h-16 bg-gradient-to-r from-[#14b8a6] via-[#0d9488] to-[#f59e0b] rounded-[24px] shadow-lg flex items-center justify-center gap-3 text-white font-bold text-lg group transition-all relative overflow-hidden border border-white/20 outline-none focus:outline-none"
            >
              <span className="relative flex items-center justify-center gap-2 drop-shadow-md">
                Ver Quem Quer Te Conhecer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <p className="text-center text-white/30 text-[9px] font-bold tracking-[0.2em] mt-4 uppercase">
              Plataforma 100% Segura e Cristã
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
