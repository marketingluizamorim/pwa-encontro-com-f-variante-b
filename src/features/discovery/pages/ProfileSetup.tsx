import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { syncQuizDataFromPurchase } from '@/features/funnel/utils/syncQuizData';
import { BRAZIL_STATES, BRAZIL_CITIES } from '@/config/brazil-cities';
import { PhotoUpload } from '@/features/discovery/components/PhotoUpload';
import { InstallPwaDrawer } from '@/components/pwa/InstallPwaDrawer';
import { ChevronLeft, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  RELIGIONS,
  CHURCH_FREQUENCIES,
  LOOKING_FOR,
  CHILDREN_OPTIONS,
  VALUES_OPTIONS
} from '@/features/discovery/constants/profile-options';

type Step = 'basics' | 'faith' | 'photos' | 'complete';

// Memoized background to prevent re-renders on every keystroke
const BackgroundBlobs = memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#14b8a6]/10 rounded-full blur-[80px]" style={{ willChange: 'filter' }} />
    <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#d4af37]/5 rounded-full blur-[80px]" style={{ willChange: 'filter' }} />
  </div>
));

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { gender: funnelGender, quizAnswers } = useFunnelStore();

  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);
  const [showInstallDrawer, setShowInstallDrawer] = useState(false);
  // Form Data
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>(funnelGender || '');
  const [city, setCity] = useState(quizAnswers.city || '');
  const [state, setState] = useState(quizAnswers.state || '');
  const [occupation, setOccupation] = useState('');

  const [religion, setReligion] = useState(quizAnswers.religion || '');
  const [churchFrequency, setChurchFrequency] = useState(quizAnswers.churchFrequency || '');
  const [lookingFor, setLookingFor] = useState(quizAnswers.lookingFor || '');
  const [aboutChildren, setAboutChildren] = useState(quizAnswers.children || '');
  const [valuesImportance, setValuesImportance] = useState(quizAnswers.valuesImportance || '');

  const [photos, setPhotos] = useState<(string)[]>([]);

  // Validation State
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  // Calculate progress
  const progress = {
    basics: 33,
    faith: 66,
    photos: 90,
    complete: 100
  }[step];

  // Clear errors on change
  useEffect(() => {
    if (showErrorBanner) {
      const timer = setTimeout(() => setShowErrorBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showErrorBanner]);

  // 1. Sync from funnelStore (local device)
  useEffect(() => {
    if (quizAnswers.city && !city) setCity(quizAnswers.city);
    if (quizAnswers.state && !state) setState(quizAnswers.state);
    if (quizAnswers.religion && !religion) setReligion(quizAnswers.religion);
    if (quizAnswers.churchFrequency && !churchFrequency) setChurchFrequency(quizAnswers.churchFrequency);
    if (quizAnswers.lookingFor && !lookingFor) setLookingFor(quizAnswers.lookingFor);
    if (quizAnswers.children && !aboutChildren) setAboutChildren(quizAnswers.children);
    if (quizAnswers.valuesImportance && !valuesImportance) setValuesImportance(quizAnswers.valuesImportance);
    if (funnelGender && !gender) setGender(funnelGender);
  }, [quizAnswers, funnelGender]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Sync from database (cross-device/trigger fallback)
  useEffect(() => {
    async function loadProfileFromDB() {
      if (!user) return;
      try {
        const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
        const { data: dbProfile } = await supabaseRuntime
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (dbProfile) {
          if (dbProfile.gender && !gender) setGender(dbProfile.gender as any);
          if (dbProfile.city && !city) setCity(dbProfile.city);
          if (dbProfile.state && !state) setState(dbProfile.state);
          if (dbProfile.religion && !religion) setReligion(dbProfile.religion);
          if (dbProfile.church_frequency && !churchFrequency) setChurchFrequency(dbProfile.church_frequency);
          if (dbProfile.looking_for && !lookingFor) setLookingFor(dbProfile.looking_for);
          if (dbProfile.about_children && !aboutChildren) setAboutChildren(dbProfile.about_children);
          if (dbProfile.values_importance && !valuesImportance) setValuesImportance(dbProfile.values_importance);
        }
      } catch (e) {
        console.error('Error loading profile from DB:', e);
      }
    }
    loadProfileFromDB();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateBasics = () => {
    const newErrors: Record<string, boolean> = {};
    if (!birthDate) newErrors.birthDate = true;
    if (!gender) newErrors.gender = true;
    if (!state) newErrors.state = true;
    if (!city) newErrors.city = true;
    return newErrors;
  };

  const validateFaith = () => {
    const newErrors: Record<string, boolean> = {};
    if (!religion) newErrors.religion = true;
    if (!churchFrequency) newErrors.churchFrequency = true;
    if (!lookingFor) newErrors.lookingFor = true;
    // Optional ones? Assuming mandatory for now based on user request "todos os outros"
    if (!aboutChildren) newErrors.aboutChildren = true;
    if (!valuesImportance) newErrors.valuesImportance = true;
    return newErrors;
  };

  const handleNext = () => {
    let newErrors: Record<string, boolean> = {};

    if (step === 'basics') {
      newErrors = validateBasics();
      if (Object.keys(newErrors).length === 0) {
        setErrors({});
        setStep('faith');
        return;
      }
    } else if (step === 'faith') {
      newErrors = validateFaith();
      if (Object.keys(newErrors).length === 0) {
        setErrors({});
        setStep('photos');
        return;
      }
    } else if (step === 'photos') {
      if (photos.length === 0) {
        newErrors.photos = true;
      } else {
        handleSave();
        return;
      }
    }

    // If we have errors
    setErrors(newErrors);
    setShowErrorBanner(true);
    // Haptic feedback for error
    if (window.navigator.vibrate) window.navigator.vibrate(200);
  };

  const handleBack = () => {
    setErrors({});
    setShowErrorBanner(false);
    if (step === 'faith') setStep('basics');
    if (step === 'photos') setStep('faith');
  };

  const handleSave = async () => {
    setSaving(true);

    // Bypass for Mock/Test Users
    if (user?.id.startsWith('mock-')) {
      setTimeout(() => {
        setSaving(false);
        setStep('complete');
        toast.success("Perfil salvo (Modo Teste)", { style: { marginTop: '50px' } });
      }, 1000);
      return;
    }

    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime
        .from('profiles')
        .update({
          birth_date: birthDate,
          gender,
          city,
          state,
          occupation,
          religion,
          church_frequency: churchFrequency,
          looking_for: lookingFor,
          about_children: aboutChildren,
          values_importance: valuesImportance,
          photos: photos,
          avatar_url: photos[0] || null,
          is_profile_complete: true,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Invalidate queries to update UI in real-time
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', null] });

      // Update seed profiles with actual user data (non-critical, runs for all new users)
      try {
        await (supabaseRuntime as unknown as { rpc: (fn: string) => Promise<unknown> })
          .rpc('seed_whatsapp_user_profiles');
      } catch { /* non-critical */ }

      // Auto-likes handled server-side by trigger trg_auto_like_on_profile_complete

      // ── Persist discover-filters to localStorage (age range + location) ──
      try {
        const ageRange = quizAnswers.age || '26-35';
        let minAge = 18;
        let maxAge = 80;
        if (ageRange === '18-25') { minAge = 18; maxAge = 25; }
        else if (ageRange === '26-35') { minAge = 26; maxAge = 35; }
        else if (ageRange === '36-45') { minAge = 36; maxAge = 45; }
        else if (ageRange === '46-55') { minAge = 46; maxAge = 55; }
        else if (ageRange === '36-55') { minAge = 36; maxAge = 55; }
        else if (ageRange === '56+') { minAge = 56; maxAge = 80; }

        // Always overwrite to ensure correct filters are applied for new users
        const initialFilters = {
          minAge,
          maxAge,
          state: state || '',
          city: city || '',
          religion: '',
          churchFrequency: '',
          lookingFor: '',
          christianInterests: [],
          hasPhotos: false,
          isVerified: false,
          onlineRecently: false,
          maxDistance: 100,
        };
        localStorage.setItem('discover-filters', JSON.stringify(initialFilters));
        localStorage.setItem('discover-filters-version', 'v5'); // Must match Discover.tsx FILTERS_VERSION
      } catch { /* non-critical */ }

      setStep('complete');
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente';
      toast.error('Erro ao salvar perfil: ' + errorMessage, { style: { marginTop: '50px' } });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans pt-[env(safe-area-inset-top)] overflow-hidden">
      {/* Background Elements — memoized to avoid input lag */}
      <BackgroundBlobs />

      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="flex flex-col max-w-md mx-auto w-full p-6">
          {/* Header */}
          {step !== 'complete' && (
            <div className="mb-8 pt-4">
              <div className="flex items-center justify-between mb-4">
                {step !== 'basics' ? (
                  <button onClick={handleBack} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                ) : <div className="w-6" />}

                <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
                  {step === 'basics' ? 'Básico' : step === 'faith' ? 'Fé & Valores' : 'Fotos'}
                </span>
                <div className="w-6" />
              </div>

              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#fcd34d]"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              {step === 'basics' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-semibold text-white mb-2">Sobre Você</h1>
                    <p className="text-white/60 text-sm">Vamos começar pelo essencial</p>
                  </div>
                  {/* ... fields ... */}

                  <div className="space-y-5">
                    <div className="space-y-2 max-w-[200px]">
                      <label className={cn("text-xs font-semibold uppercase tracking-wider ml-1 transition-colors", errors.birthDate ? "text-red-400" : "text-white/50")}>
                        Data de Nascimento {errors.birthDate && "*"}
                      </label>
                      <Input
                        type="date"
                        value={birthDate}
                        onChange={(e) => { setBirthDate(e.target.value); delete errors.birthDate; }}
                        className={cn(
                          "bg-card text-foreground h-14 text-lg rounded-xl transition-all w-full",
                          errors.birthDate
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-border focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
                        )}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={cn("text-xs font-semibold uppercase tracking-wider ml-1 transition-colors", errors.gender ? "text-red-400" : "text-white/50")}>
                        Gênero {errors.gender && "*"}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'male', label: 'Homem' },
                          { value: 'female', label: 'Mulher' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setGender(opt.value as 'male' | 'female'); delete errors.gender; }}
                            className={cn(
                              "h-14 rounded-xl border transition-all font-medium relative overflow-hidden",
                              gender === opt.value
                                ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                : 'bg-card text-muted-foreground hover:bg-muted',
                              errors.gender && !gender ? "border-red-500/50 text-red-400" : "border-border"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className={cn("text-xs font-semibold uppercase tracking-wider ml-1 transition-colors", errors.state ? "text-red-400" : "text-white/50")}>
                          Estado {errors.state && "*"}
                        </label>
                        <select
                          value={state}
                          onChange={(e) => { setState(e.target.value); setCity(''); delete errors.state; }}
                          className={cn(
                            "w-full h-14 bg-card rounded-xl text-foreground px-3 appearance-none focus:outline-none transition-all",
                            errors.state
                              ? "border border-red-500/50 focus:border-red-500"
                              : "border border-border focus:border-[#d4af37]/50"
                          )}
                        >
                          <option value="" className="bg-[#0f172a]">UF</option>
                          {BRAZIL_STATES.map(s => (
                            <option key={s} value={s} className="bg-[#0f172a]">{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-xs font-semibold uppercase tracking-wider ml-1 transition-colors", errors.city ? "text-red-400" : "text-white/50")}>
                          Cidade {errors.city && "*"}
                        </label>
                        <select
                          value={city}
                          onChange={(e) => { setCity(e.target.value); delete errors.city; }}
                          disabled={!state}
                          className={cn(
                            "w-full h-14 bg-card rounded-xl text-foreground px-3 appearance-none disabled:opacity-50 focus:outline-none transition-all",
                            errors.city
                              ? "border border-red-500/50 focus:border-red-500"
                              : "border border-border focus:border-[#d4af37]/50"
                          )}
                        >
                          <option value="" className="bg-[#0f172a]">Cidade</option>
                          {state && BRAZIL_CITIES[state]?.map(c => (
                            <option key={c} value={c} className="bg-[#0f172a]">{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>


                  </div>
                </motion.div>
              )}

              {step === 'faith' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-serif font-semibold text-white mb-2">Sua Fé e Valores</h1>
                    <p className="text-white/60 text-sm">O que torna você único(a)?</p>
                  </div>

                  <div className="space-y-6">
                    <SelectGroup
                      label="Qual o pilar da sua fé?"
                      value={religion}
                      onChange={(v) => { setReligion(v); delete errors.religion }}
                      options={RELIGIONS}
                      error={errors.religion}
                    />
                    <SelectGroup
                      label="Frequência na igreja"
                      value={churchFrequency}
                      onChange={(v) => { setChurchFrequency(v); delete errors.churchFrequency }}
                      options={CHURCH_FREQUENCIES}
                      error={errors.churchFrequency}
                    />
                    <SelectGroup
                      label="O que você busca?"
                      value={lookingFor}
                      onChange={(v) => { setLookingFor(v); delete errors.lookingFor }}
                      options={LOOKING_FOR}
                      error={errors.lookingFor}
                    />
                    <SelectGroup
                      label="Sobre filhos"
                      value={aboutChildren}
                      onChange={(v) => { setAboutChildren(v); delete errors.aboutChildren }}
                      options={CHILDREN_OPTIONS}
                      error={errors.aboutChildren}
                    />
                    <SelectGroup
                      label="IMPORTÂNCIA DE ENCONTRAR ALGUÉM COM MESMOS VALORES?"
                      value={valuesImportance}
                      onChange={(v) => { setValuesImportance(v); delete errors.valuesImportance }}
                      options={VALUES_OPTIONS}
                      error={errors.valuesImportance}
                    />
                  </div>
                </motion.div>
              )}

              {step === 'photos' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-semibold text-white mb-2">Suas Melhores Fotos</h1>
                    <p className="text-white/60 text-sm">A primeira foto será seu cartão de visita</p>
                  </div>

                  <div className={cn(
                    "bg-white/5 border rounded-3xl p-4 shadow-xl transition-all",
                    errors.photos ? "border-red-500/50 shadow-red-500/10" : "border-white/10"
                  )}>
                    <PhotoUpload
                      photos={photos}
                      onPhotosChange={(p) => { setPhotos(p); if (p.length > 0) delete errors.photos }}
                      maxPhotos={6}
                    />
                  </div>
                  {errors.photos && <p className="text-red-400 text-sm text-center">Adicione pelo menos uma foto para continuar</p>}
                </motion.div>
              )}

              {step === 'complete' && (
                <motion.div
                  key="complete"
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0 }}
                  className="flex flex-col items-center justify-center min-h-[50vh] py-12 text-center"
                >
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fcd34d] p-[3px] mb-8 shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center">
                      <Check className="w-12 h-12 text-[#fcd34d]" />
                    </div>
                  </div>

                  <h1 className="text-4xl font-serif font-semibold text-white mb-4">Perfil Criado!</h1>
                  <p className="text-white/70 max-w-xs mx-auto mb-12 leading-relaxed">
                    Tudo pronto. Agora você faz parte de uma comunidade exclusiva de pessoas que compartilham seus valores.
                  </p>

                  <Button
                    onClick={() => setShowInstallDrawer(true)}
                    className="w-full h-14 rounded-xl gradient-button text-white font-semibold tracking-wide text-lg shadow-lg shadow-amber-500/20"
                  >
                    Começar a Explorar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Error Banner - "Below Center" but visually prominent */}
          <AnimatePresence>
            {showErrorBanner && Object.keys(errors).length > 0 && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
                className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-6 right-6 z-50 pointer-events-none"
              >
                <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-3 backdrop-blur-md bg-opacity-90 border border-red-400/30">
                  <AlertTriangle size={18} className="fill-white text-red-600" />
                  <span className="font-semibold text-sm">Preencha os campos destacados</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          {step !== 'complete' && (
            <div className="pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] relative z-20">
              <Button
                onClick={handleNext}
                disabled={saving}
                className="w-full h-14 rounded-xl gradient-button text-white font-semibold tracking-wide text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98]"
              >
                {saving ? <AlertCircle className="animate-spin" /> : (step === 'photos' ? 'Finalizar Perfil' : 'Continuar')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <InstallPwaDrawer
        open={showInstallDrawer}
        onOpenChange={setShowInstallDrawer}
        onComplete={() => navigate('/app/discover')}
      />
    </div>
  );
}

// Helper Component: Select with Error State
function SelectGroup({ label, value, onChange, options, error }: { label: string, value: string, onChange: (v: string) => void, options: string[], error?: boolean }) {
  return (
    <div className="space-y-2">
      <label className={cn("text-xs font-semibold uppercase tracking-wider ml-1 transition-colors", error ? "text-red-400" : "text-white/50")}>
        {label} {error && "*"}
      </label>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-between group",
              value === opt
                ? 'bg-[#d4af37]/10 border-[#d4af37] text-white'
                : 'bg-card text-muted-foreground hover:bg-muted',
              error && value !== opt ? "border-red-500/50" : "border-border"
            )}
          >
            <span>{opt}</span>
            {value === opt && <Check className="w-4 h-4 text-[#d4af37]" />}
          </button>
        ))}
      </div>
    </div>
  );
}
