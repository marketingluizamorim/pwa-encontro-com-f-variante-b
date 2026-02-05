import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/features/discovery/components/PhotoUpload';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';

const RELIGIONS = [
  'Evangélica',
  'Católica',
  'Protestante',
  'Espírita',
  'Adventista',
  'Testemunha de Jeová',
  'Outra',
];

const CHURCH_FREQUENCIES = [
  'Sim, sou ativo(a)',
  'Às vezes',
  'Raramente',
  'Não frequento',
];

const LOOKING_FOR = [
  'Um compromisso sério',
  'Construir uma família',
  'Conhecer pessoas novas',
  'Amizade verdadeira',
];

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

const CHILDREN_OPTIONS = ['Já sou pai/mãe', 'Desejo ter filhos', 'Talvez no futuro', 'Não pretendo ter'];
const EDUCATION_LEVELS = ['Ensino Médio', 'Cursando Ensino Superior', 'Ensino Superior Completo', 'Pós-graduação', 'Mestrado/Doutorado'];
const DRINK_OPTIONS = ['Nunca', 'Socialmente', 'Frequentemente'];
const SMOKE_OPTIONS = ['Não', 'Sim', 'Às vezes'];
const PETS_OPTIONS = ['Gosto de animais', 'Tenho gato(s)', 'Tenho cachorro(s)', 'Tenho outros', 'Não gosto'];
const ACTIVITY_OPTIONS = ['Sedentário', 'Leve (Caminhadas)', 'Moderado (Academia/Esportes)', 'Intenso (Atleta)'];
const CHRISTIAN_INTERESTS_OPTIONS = [
  'Louvor & Adoração', 'Música Gospel', 'Grupo de Jovens (Célula)', 'Estudo Bíblico',
  'Retiros & Acampamentos', 'Podcasts Cristãos', 'Conferências', 'Voluntariado',
  'Missões', 'Evangelismo', 'Devocional Diário', 'Oração / Intercessão',
  'Leitura Cristã (Livros)', 'Ação Social', 'Liderança', 'Discipulado',
  'Teologia', 'Mídia / Comunicação', 'Arte Profética', 'Dança / Teatro',
  'Empreendedorismo Reino', 'Israel / Viagens'
];

const INTEREST_ICONS: Record<string, string> = {
  'Louvor & Adoração': 'ri-mic-line',
  'Música Gospel': 'ri-music-2-line',
  'Grupo de Jovens (Célula)': 'ri-group-line',
  'Estudo Bíblico': 'ri-book-read-line',
  'Retiros & Acampamentos': 'ri-tent-line',
  'Podcasts Cristãos': 'ri-headphone-line',
  'Conferências': 'ri-slideshow-line',
  'Voluntariado': 'ri-hand-heart-line',
  'Missões': 'ri-earth-line',
  'Evangelismo': 'ri-megaphone-line',
  'Devocional Diário': 'ri-sun-line',
  'Oração / Intercessão': 'ri-hand-line',
  'Leitura Cristã (Livros)': 'ri-book-line',
  'Ação Social': 'ri-heart-line',
  'Liderança': 'ri-medal-line',
  'Discipulado': 'ri-user-follow-line',
  'Teologia': 'ri-graduation-cap-line',
  'Mídia / Comunicação': 'ri-broadcast-line',
  'Arte Profética': 'ri-palette-line',
  'Dança / Teatro': 'ri-music-line',
  'Empreendedorismo Reino': 'ri-briefcase-line',
  'Israel / Viagens': 'ri-plane-line'
};
const LANGUAGE_OPTIONS = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Libras', 'Outro'];


export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadProfile();
  }, [user]);

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

      setProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        birth_date: data.birth_date || '',
        city: data.city || '',
        state: data.state || '',
        religion: data.religion || '',
        church_frequency: data.church_frequency || '',
        looking_for: data.looking_for || '',
        occupation: (data as any).occupation || '',
        values_importance: (data as any).values_importance || '',
        photos: data.photos || [],
        gender: (data as any).gender || '',
        christian_interests: (data as any).christian_interests || [],
        languages: (data as any).languages || [],
        education: (data as any).education || '',
        pets: (data as any).pets || '',
        drink: (data as any).drink || '',
        smoke: (data as any).smoke || '',
        physical_activity: (data as any).physical_activity || '',
        social_media: (data as any).social_media || '',
        about_children: (data as any).about_children || '',
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
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);



    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

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
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado!');
      navigate('/app/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container px-4 py-6 space-y-6 pb-32"
      >
        {/* Photo Upload */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10">
          <PhotoUpload
            photos={profile.photos}
            onPhotosChange={(photos) => updateField('photos', photos)}
          />
        </section>

        {/* Basic Info */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
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
            <label className="text-sm text-muted-foreground mb-1 block">Data de nascimento</label>
            <Input
              type="date"
              value={profile.birth_date}
              onChange={(e) => updateField('birth_date', e.target.value)}
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
              <label className="text-sm text-muted-foreground mb-1 block">Cidade</label>
              <Input
                value={profile.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Sua cidade"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Estado</label>
              <Input
                value={profile.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>




        </section>

        {/* Faith Info */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
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
              {(showAllInterests ? CHRISTIAN_INTERESTS_OPTIONS : CHRISTIAN_INTERESTS_OPTIONS.slice(0, 11)).map(interest => {
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

        {/* Detailed Info */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
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
                  try { socialData = JSON.parse(profile.social_media || '{}'); } catch { }
                  const hasValue = !!(socialData as any)[social.key];
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
                      <Input
                        autoFocus
                        value={(() => {
                          let socialData = {};
                          try { socialData = JSON.parse(profile.social_media || '{}'); } catch { }
                          return (socialData as any)[activeSocial] || '';
                        })()}
                        onChange={(e) => {
                          let socialData = {};
                          try { socialData = JSON.parse(profile.social_media || '{}'); } catch { }
                          const newData = { ...(socialData as any), [activeSocial]: e.target.value };
                          updateField('social_media', JSON.stringify(newData));
                        }}
                        placeholder={activeSocial === 'whatsapp' ? '(00) 00000-0000' : '@usuario'}
                        className="h-10 bg-background"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Lifestyle */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
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

        {/* Preferences */}
        <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
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
      </motion.div>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 text-base font-semibold gradient-button text-white shadow-lg hover:opacity-90 transition-opacity"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </div >
  );
}
