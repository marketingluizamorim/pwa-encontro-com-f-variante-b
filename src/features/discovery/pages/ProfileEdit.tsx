import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/features/discovery/components/PhotoUpload';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAZIL_CITIES, BRAZIL_STATES } from '@/config/brazil-cities';
import {
  RELIGIONS,
  CHURCH_FREQUENCIES,
  LOOKING_FOR,
  CHILDREN_OPTIONS,
  EDUCATION_LEVELS,
  DRINK_OPTIONS,
  SMOKE_OPTIONS,
  PETS_OPTIONS,
  ACTIVITY_OPTIONS,
  CHRISTIAN_INTERESTS_OPTIONS,
  INTEREST_ICONS,
  LANGUAGE_OPTIONS
} from '@/features/discovery/constants/profile-options';



interface ProfileData {
  display_name: string;
  bio: string;
  birth_date: string;
  city: string;
  state: string;
  religion: string;
  church_frequency: string;
  looking_for: string;
  occupation: string;
  values_importance: string;
  photos: string[];
  gender: string;
  christian_interests: string[];
  languages: string[];
  education: string;
  pets: string;
  drink: string;
  smoke: string;
  physical_activity: string;
  social_media: string;
  about_children: string;
}





export default function ProfileEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasLoadedRef = useRef(false); // prevents re-triggering spinner on authLoading flicker (background/foreground)
  const [showAllInterests, setShowAllInterests] = useState(false);
  const [activeSocial, setActiveSocial] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    bio: '',
    birth_date: '',
    city: '',
    state: '',
    religion: '',
    church_frequency: '',
    looking_for: '',
    occupation: '',
    values_importance: '',
    photos: [],
    gender: '',
    christian_interests: [],
    languages: [],
    education: '',
    pets: '',
    drink: '',
    smoke: '',
    physical_activity: '',
    social_media: '',
    about_children: '',
  });

  const updateField = useCallback(<K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  // Wait for auth to resolve before loading profile.
  // Without this guard, user starts as null, loadProfile returns early
  // without calling setLoading(false), causing infinite spinner.
  useEffect(() => {
    if (authLoading) return;    // auth still initializing — wait
    if (!user) {
      setLoading(false);        // not logged in — stop spinner
      return;
    }
    // Guard: if data was already loaded once (e.g. user returned from background),
    // skip re-fetch — data is still in component state.
    if (hasLoadedRef.current) return;
    loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    if (!user) return;



    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { data, error } = await supabaseRuntime
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      hasLoadedRef.current = true; // mark as loaded — won't re-fetch on background return
      setProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        birth_date: data.birth_date || '',
        city: data.city || '',
        state: data.state || '',
        religion: data.religion || '',
        church_frequency: data.church_frequency || '',
        looking_for: data.looking_for || '',
        occupation: (data as { occupation?: string }).occupation || '',
        values_importance: (data as { values_importance?: string }).values_importance || '',
        photos: (data as { photos?: string[] }).photos || [],
        gender: (data as { gender?: string }).gender || '',
        christian_interests: (data as { christian_interests?: string[] }).christian_interests || [],
        languages: (data as { languages?: string[] }).languages || [],
        education: (data as { education?: string }).education || '',
        pets: (data as { pets?: string }).pets || '',
        drink: (data as { drink?: string }).drink || '',
        smoke: (data as { smoke?: string }).smoke || '',
        physical_activity: (data as { physical_activity?: string }).physical_activity || '',
        social_media: (data as { social_media?: string }).social_media || '',
        about_children: (data as { about_children?: string }).about_children || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profile.display_name.trim()) {
      toast.error('Nome é obrigatório', { style: { marginTop: '50px' } });
      return;
    }

    setSaving(true);



    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

      // Calculate if profile is complete based on same logic as Discover/Profile pages
      const completionFields = [
        profile.display_name,
        profile.bio,
        profile.birth_date,
        profile.city,
        profile.state,
        profile.religion,
        profile.church_frequency,
        profile.looking_for,
        profile.gender,
        profile.occupation,
        (profile.photos && profile.photos.length > 0),
        (profile.christian_interests && profile.christian_interests.length > 0),
        (profile.languages && profile.languages.length > 0),
        profile.education,
        profile.social_media
      ];

      const filledCount = completionFields.filter(val => {
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val.trim().length > 0;
        return !!val;
      }).length;

      const isComplete = filledCount === completionFields.length;

      const { error } = await supabaseRuntime
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          birth_date: profile.birth_date || null,
          city: profile.city,
          state: profile.state,
          religion: profile.religion,
          church_frequency: profile.church_frequency,
          looking_for: profile.looking_for,
          occupation: profile.occupation,
          values_importance: profile.values_importance,
          photos: profile.photos,
          avatar_url: profile.photos[0] || null,
          gender: profile.gender,
          christian_interests: profile.christian_interests,
          languages: profile.languages,
          education: profile.education,
          pets: profile.pets,
          drink: profile.drink,
          smoke: profile.smoke,
          physical_activity: profile.physical_activity,
          social_media: profile.social_media,
          about_children: profile.about_children,
          is_profile_complete: isComplete,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate queries to update UI in real-time
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', null] }); // For own profile shortcuts

      toast.success('Perfil atualizado!', { style: { marginTop: '50px' } });
      navigate('/app/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil', { style: { marginTop: '50px' } });
    } finally {
      setSaving(false);
    }
  };

  // Removed local updateField as it's now wrapped in useCallback above profile state initialization


  const isSectionComplete = (section: 'photos' | 'basic' | 'faith' | 'details' | 'lifestyle' | 'preferences') => {
    switch (section) {
      case 'photos':
        return profile.photos && profile.photos.length > 0;
      case 'basic':
        return !!(profile.display_name && profile.birth_date && profile.gender && profile.city && profile.state);
      case 'faith':
        return !!(profile.religion && profile.church_frequency && profile.christian_interests && profile.christian_interests.length > 0);
      case 'details':
        return !!(profile.occupation && profile.education && profile.languages && profile.languages.length > 0 && profile.social_media);
      case 'lifestyle':
        return !!(profile.drink && profile.smoke && profile.physical_activity && profile.pets);
      case 'preferences':
        return !!(profile.looking_for && profile.about_children && profile.values_importance);
      default:
        return false;
    }
  };

  const PhotosSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 relative">
      {isSectionComplete('photos') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <PhotoUpload
        photos={profile.photos}
        onPhotosChange={(photos) => updateField('photos', photos)}
      />
    </section>
  ), [profile.photos, updateField]);

  const BasicInfoSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4 relative">
      {isSectionComplete('basic') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <h2 className="font-display font-semibold text-foreground">Informações Básicas</h2>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
        <Input
          value={profile.display_name}
          onChange={(e) => updateField('display_name', e.target.value)}
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Sobre mim (Bio)</label>
        <Textarea
          value={profile.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Conte um pouco sobre você, sua fé e o que busca..."
          className="resize-none min-h-[100px]"
          maxLength={500}
        />
        <p className="text-[10px] text-muted-foreground text-right mt-1">
          {profile.bio.length}/500
        </p>
      </div>

      <div className="max-w-[200px]">
        <label className="text-sm text-muted-foreground mb-1 block">Data de nascimento</label>
        <Input
          type="date"
          value={profile.birth_date}
          onChange={(e) => updateField('birth_date', e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Gênero</label>
        <Select value={profile.gender} onValueChange={(v) => updateField('gender', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Homem</SelectItem>
            <SelectItem value="female">Mulher</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Estado</label>
          <Select
            value={BRAZIL_STATES.includes(profile.state) ? profile.state : undefined}
            onValueChange={(v) => {
              updateField('state', v);
              updateField('city', ''); // Reset city when state changes
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] bg-background">
              {BRAZIL_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Cidade</label>
          <Select
            value={profile.state && BRAZIL_CITIES[profile.state]?.includes(profile.city) ? profile.city : undefined}
            onValueChange={(v) => updateField('city', v)}
            disabled={!profile.state}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={!profile.state ? "Selecione o estado" : "Selecione"} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] bg-background">
              {profile.state && BRAZIL_CITIES[profile.state]?.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  ), [profile.display_name, profile.bio, profile.birth_date, profile.gender, profile.state, profile.city, updateField]);

  const FaithSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4 relative">
      {isSectionComplete('faith') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <h2 className="font-display font-semibold text-foreground">Fé e Religião</h2>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Religião</label>
        <Select value={profile.religion} onValueChange={(v) => updateField('religion', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione sua religião" />
          </SelectTrigger>
          <SelectContent>
            {RELIGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Frequência na igreja</label>
        <Select value={profile.church_frequency} onValueChange={(v) => updateField('church_frequency', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Com que frequência você vai à igreja?" />
          </SelectTrigger>
          <SelectContent>
            {CHURCH_FREQUENCIES.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-3 block">Interesses Cristãos</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {(showAllInterests ? CHRISTIAN_INTERESTS_OPTIONS : CHRISTIAN_INTERESTS_OPTIONS.slice(0, 15)).map(interest => {
            const isSelected = profile.christian_interests?.includes(interest);
            const icon = INTEREST_ICONS[interest] || 'ri-star-line';
            return (
              <div key={interest} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => {
                    const currentInterests = profile.christian_interests || [];
                    const isSelected = currentInterests.includes(interest);
                    const newInterests = isSelected
                      ? currentInterests.filter(i => i !== interest)
                      : [...currentInterests, interest];
                    updateField('christian_interests', newInterests);
                  }}
                  title={interest}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                    ? 'bg-primary/20 border-primary text-primary scale-110 shadow-lg shadow-primary/10'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    }`}
                >
                  <i className={`${icon} text-xl`} />
                </button>
                <span className="text-[10px] text-muted-foreground text-center line-clamp-1 w-full px-1">
                  {interest}
                </span>
              </div>
            )
          })}

          {!showAllInterests && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowAllInterests(true)}
                className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-white/5 transition-colors"
              >
                <i className="ri-add-line text-xl" />
              </button>
              <span className="text-[10px] text-muted-foreground">Ver todos</span>
            </div>
          )}
        </div>
        {showAllInterests && (
          <button
            onClick={() => setShowAllInterests(false)}
            className="text-xs text-primary font-medium hover:underline mt-4 block mx-auto"
          >
            Mostrar menos
          </button>
        )}
      </div>
    </section>
  ), [profile.religion, profile.church_frequency, profile.christian_interests, showAllInterests, updateField]);

  const DetailsSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4 relative">
      {isSectionComplete('details') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <h2 className="font-display font-semibold text-foreground">Detalhes Pessoais</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Profissão</label>
          <Input
            value={profile.occupation}
            onChange={(e) => updateField('occupation', e.target.value)}
            placeholder="Sua profissão"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Escolaridade</label>
            <Select value={profile.education} onValueChange={(v) => updateField('education', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Idiomas</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map(lang => {
              const isSelected = profile.languages.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => {
                    const newLangs = isSelected
                      ? profile.languages.filter(l => l !== lang)
                      : [...profile.languages, lang];
                    updateField('languages', newLangs);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-input'
                    }`}
                >
                  {lang}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-3 block">Redes Sociais</label>
          <div className="flex justify-center gap-6 mb-4">
            {[
              { key: 'instagram', icon: 'ri-instagram-line', color: '#E4405F' },
              { key: 'facebook', icon: 'ri-facebook-circle-line', color: '#1877F2' },
              { key: 'whatsapp', icon: 'ri-whatsapp-line', color: '#25D366' }
            ].map(social => {
              let socialData = {};
              try {
                socialData = JSON.parse(profile.social_media || '{}');
              } catch (e) {
                console.error('Error parsing social media data:', e);
              }
              const hasValue = !!(socialData as Record<string, string>)[social.key];
              const isActive = activeSocial === social.key;

              return (
                <button
                  key={social.key}
                  onClick={() => setActiveSocial(isActive ? null : social.key)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${hasValue || isActive
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    }`}
                >
                  <i className={`${social.icon} text-2xl`} />
                  {hasValue && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-[10px] text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeSocial && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-muted/30 rounded-xl p-3 border border-border mt-2">
                  <label className="text-xs font-medium mb-1.5 block capitalize">
                    Seu {activeSocial}
                  </label>
                  <div className="relative">
                    <Input
                      autoFocus
                      value={(() => {
                        let socialData: Record<string, string> = {};
                        const raw = profile.social_media;
                        if (typeof raw === 'object' && raw !== null) {
                          socialData = raw;
                        } else if (typeof raw === 'string') {
                          try {
                            socialData = JSON.parse(raw);
                          } catch (e) {
                            console.error('Error parsing social media data:', e);
                          }
                        }
                        return socialData[activeSocial!] || '';
                      })()}
                      onChange={(e) => {
                        let val = e.target.value;
                        const platform = activeSocial?.toLowerCase();

                        if (platform === 'whatsapp') {
                          // Remove non-digits
                          val = val.replace(/\D/g, '');
                          // Limit to 11 digits
                          if (val.length > 11) val = val.slice(0, 11);

                          // Mask: (XX) XXXXX-XXXX
                          val = val.replace(/^(\d{2})(\d)/g, '($1) $2');
                          val = val.replace(/(\d)(\d{4})$/, '$1-$2');
                        } else if (platform === 'instagram' || platform === 'facebook') {
                          if (val.startsWith('@')) val = val.substring(1);
                        }

                        // Safe parse existing data
                        let socialData: Record<string, string> = {};
                        const raw = profile.social_media;
                        if (typeof raw === 'string') {
                          try {
                            socialData = JSON.parse(raw);
                          } catch (e) {
                            console.error('Error parsing social media data:', e);
                          }
                        } else if (raw && typeof raw === 'object') {
                          socialData = { ...(raw as Record<string, string>) };
                        }

                        const newData = { ...socialData, [activeSocial!]: val };
                        updateField('social_media', JSON.stringify(newData));
                      }}
                      placeholder={activeSocial === 'whatsapp' ? '(11) 99999-9999' : 'seu.usuario'}
                      className={cn(
                        "h-10 bg-background transition-all font-medium",
                        activeSocial === 'whatsapp' ? "pl-14" : "pl-9"
                      )}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold pointer-events-none select-none z-50">
                      {activeSocial === 'whatsapp' ? '+55' : '@'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  ), [profile.occupation, profile.education, profile.languages, profile.social_media, activeSocial, updateField]);

  const LifestyleSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4 relative">
      {isSectionComplete('lifestyle') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <h2 className="font-display font-semibold text-foreground">Estilo de Vida</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Bebida</label>
          <Select value={profile.drink} onValueChange={(v) => updateField('drink', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{DRINK_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Fumante</label>
          <Select value={profile.smoke} onValueChange={(v) => updateField('smoke', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{SMOKE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Atividade Física</label>
          <Select value={profile.physical_activity} onValueChange={(v) => updateField('physical_activity', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{ACTIVITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Animais de Estimação</label>
          <Select value={profile.pets} onValueChange={(v) => updateField('pets', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{PETS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    </section>
  ), [profile.drink, profile.smoke, profile.physical_activity, profile.pets, updateField]);

  const PreferencesSection = useMemo(() => (
    <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4 relative">
      {isSectionComplete('preferences') && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-background">
          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
        </div>
      )}
      <h2 className="font-display font-semibold text-foreground">Preferências</h2>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Procurando</label>
        <Select value={profile.looking_for} onValueChange={(v) => updateField('looking_for', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Quem você está procurando?" />
          </SelectTrigger>
          <SelectContent>
            {LOOKING_FOR.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Filhos</label>
        <Select value={profile.about_children} onValueChange={(v) => updateField('about_children', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sobre filhos" />
          </SelectTrigger>
          <SelectContent>
            {CHILDREN_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">É fundamental encontrar alguém com os mesmos valores?</label>
        <Select value={profile.values_importance} onValueChange={(v) => updateField('values_importance', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {['Sim, é essencial', 'Muito importante', 'Não é prioridade', 'Indiferente'].map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  ), [profile.looking_for, profile.about_children, profile.values_importance, updateField]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-display font-semibold text-lg text-foreground">Editar Perfil</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container px-4 py-6 space-y-6 pb-24"
        >
          {PhotosSection}

          {BasicInfoSection}

          {FaithSection}

          {DetailsSection}

          {LifestyleSection}

          {PreferencesSection}
        </motion.div>
      </main>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background/80 backdrop-blur-xl border-t border-border/50 z-50">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl gradient-button text-white font-bold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] border-0"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
