import { motion } from 'framer-motion';
import { useFunnelStore } from "@/features/funnel/hooks/useFunnelStore";
import { MapPin, Lock, HandHeart, ArrowRight, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEMALE_EXTRA, MALE_EXTRA, enrichBotProfile, getStateAbbreviation } from "../utils/profiles";

interface ProfilesDisplayProps {
  gender: 'male' | 'female' | null;
  onViewPlans: () => void;
  onBack?: () => void;
}

export function ProfilesDisplay({ gender, onViewPlans, onBack }: ProfilesDisplayProps) {
  const { quizAnswers } = useFunnelStore();

  // Build bot-like stubs and enrich them with enrichBotProfile so photos,
  // ages and interests are identical to what the user will see post-registration.
  const extrasList = gender === 'male' ? FEMALE_EXTRA : MALE_EXTRA;
  // UUIDs que batem exatamente com BOT_PHOTO_MAP em profiles.ts
  const funnelBotIds: Record<string, string> = {
    // Female
    Juliana: '8f517b2a-e1f8-4c2c-bdd2-a5af0f3cbe56',
    Bruna: '97b2d8a6-6775-46a9-8345-7f66f2398605',
    Larissa: 'd5229a6d-5194-4a70-a69d-503528bc2ede',
    Amanda: '64149ade-351e-4814-9a0d-c84839c7a7ca',
    Rebeca: '078bfc3e-241c-4c8b-877a-3693b1123814',
    Carolina: '26006097-3918-43d9-af0f-bba823538f36',
    Talita: '46c9673c-f9d3-4b6d-bd5c-dfaa5f4b5454',
    'Letícia': 'd6914334-aa71-4bd0-add2-018a2d92efd3',
    // Male
    Pedro: '8274a79f-073d-4417-b0b0-6b609cd8aa81',
    Thiago: '04f6a6d4-11b8-4202-8989-8debf1f49511',
    Gabriel: 'b837f035-10e8-4e7d-81ae-418920c0a781',
    Lucas: '189d38e0-ddc4-42ce-aeba-7b54b94d25c3',
    Felipe: '89f16352-6277-4689-bd3c-bd73efbf3aa3',
    Mateus: '899e3661-5c53-4626-b3d0-e3244c6e42c5',
    'André': 'f623beab-2a2c-4f88-b74e-5e38e556dd6f',
    Daniel: '6c2b02cd-a2da-46b0-8be8-6e7935f78137',
  };

  // Idade real de cada bot (independente das respostas do usuário)
  const botAgeMap: Record<string, number> = {
    Juliana: 18, Bruna: 22, Larissa: 20, Camila: 21, Vanessa: 23, Beatriz: 19,
    Amanda: 30, Rebeca: 28, Fernanda: 26, Priscila: 29, Luana: 33, Daniela: 27,
    Carolina: 37, Talita: 41, 'Letícia': 46, 'Patrícia': 44, Soraia: 39, Regina: 55,
    Maria: 58, Sandra: 62,
    Gabriel: 23, Lucas: 21, 'André': 19, 'João': 22, Vitor: 20, Diego: 24,
    Pedro: 27, Mateus: 31, Rafael: 33, Felipe: 28, Carlos: 32, Bruno: 30,
    Hugo: 39, Daniel: 44, Robson: 46, Marcos: 51, Fernando: 42, Eduardo: 48,
    Thiago: 57, Benedito: 61,
  };

  // Limites ideais por faixa do usuário
  const getIdealAgeLimit = (userRange: string): [number, number] => {
    switch (userRange) {
      case '18-25': return [18, 29];
      case '26-35': return [22, 40];
      case '36-55': return [30, 58];
      case '56+': return [48, 99];
      default: return [22, 40];
    }
  };

  const userAgeRange = quizAnswers.age || '26-35';
  const [minAge, maxAge] = getIdealAgeLimit(userAgeRange);

  // Centro da faixa para calcular proximidade no fallback
  const centerAge: Record<string, number> = {
    '18-25': 21, '26-35': 30, '36-55': 45, '56+': 62,
  };
  const center = centerAge[userAgeRange] || 30;

  // Shuffle determinístico baseado na cidade do usuário (parece aleatório mas é consistente por sessão)
  const shuffleSeed = (quizAnswers.city || 'sp').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seededShuffle = <T,>(arr: T[]): T[] => {
    const result = [...arr];
    let seed = shuffleSeed;
    for (let i = result.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // 1. Perfis da faixa ideal (embaralhados)
  const primary = seededShuffle(
    extrasList.filter(e => { const a = botAgeMap[e.name] || 28; return a >= minAge && a <= maxAge; })
  );

  // 2. Fallback: os mais próximos em idade ao centro da faixa
  const fallback = extrasList
    .filter(e => { const a = botAgeMap[e.name] || 28; return a < minAge || a > maxAge; })
    .sort((a, b) =>
      Math.abs((botAgeMap[a.name] || 28) - center) - Math.abs((botAgeMap[b.name] || 28) - center)
    );

  // 3. Sempre 6 perfis: primários + fallback se necessário
  const combined = [...primary, ...fallback].slice(0, 6);

  const profiles = combined.map((extra, idx) => {
    const botAge = botAgeMap[extra.name] || 28;
    const stub = {
      is_bot: true,
      user_id: funnelBotIds[extra.name] || `bot-${idx}`,
      display_name: extra.name,
      gender: gender === 'male' ? 'female' : 'male',
      birth_date: `${new Date().getFullYear() - botAge}-06-15`,
      ...extra,
    };
    return enrichBotProfile(stub, quizAnswers.age);
  });

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

          {/* FIX: animate (not whileInView) — prevents re-trigger flickering on scroll */}
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
                key={`${profile.display_name || profile.name}-${index}`}
                className="group relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[3/4.2] border border-white/10 fade-in-fast"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Profile Image */}
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={profile.photos?.[0] || profile.avatar_url || '/placeholder.svg'}
                    alt={profile.display_name || profile.name}
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
                      {profile.display_name || profile.name}, {profile.age}
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                    </h3>

                    {index === 0 ? (
                      // Primeiro card: mostra a cidade do usuário para personalização
                      <div className="flex items-center gap-1.5 text-white/60">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {quizAnswers.city || profile.city || 'Perto de você'}
                        </span>
                      </div>
                    ) : (
                      // Cards bloqueados: "Perfil privado"
                      <div className="flex items-center gap-1.5 text-white/40">
                        <svg className="w-3 h-3 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="text-[11px] font-medium tracking-wide italic">Perfil privado</span>
                      </div>
                    )}

                    {index === 0 && (
                      <div className="flex gap-1.5 flex-nowrap mt-2.5 overflow-hidden">
                        {['LOUVOR', 'DEVOCIONAL'].map((badge) => (
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

          {/* Locked Counter — FIX: animate instead of whileInView */}
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
