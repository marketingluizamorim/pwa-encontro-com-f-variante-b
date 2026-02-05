import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { ProfileSkeleton } from '@/features/discovery/components/SkeletonLoaders';

interface UserProfile {
  display_name: string;
  bio?: string;
  photos: string[];
  avatar_url?: string;
  birth_date?: string;
  city?: string;
  state?: string;
  religion?: string;
  church_frequency?: string;
  looking_for?: string;
  interests: string[];
  gender?: string;
  christian_interests?: string[];
  languages?: string[];
  education?: string;
  pets?: string;
  drink?: string;
  smoke?: string;
  physical_activity?: string;
  social_media?: string;
  occupation?: string;
}



export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

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
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set demo profile
      setProfile({
        display_name: user.user_metadata?.display_name || 'Usuário',
        bio: 'Complete seu perfil para aparecer para outras pessoas.',
        photos: [],
        interests: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveBio = async () => {
    if (!user) return;
    setIsSavingBio(true);
    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime
        .from('profiles')
        .update({ bio: bioText })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, bio: bioText } : null);
      setIsBioDialogOpen(false);
      toast.success('Descrição atualizada com sucesso!');
    } catch (error) {
      console.error('Error saving bio:', error);
      toast.error('Erro ao salvar descrição');
    } finally {
      setIsSavingBio(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
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
      ((profile.christian_interests && profile.christian_interests.length > 0) || (profile.interests && profile.interests.length > 0))
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <PageTransition className="space-y-6 pb-24 px-6 pt-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          {/* Progress Ring */}
          <div className="absolute -inset-2 flex items-center justify-center pointer-events-none">
            <svg className="w-[128px] h-[128px] -rotate-90">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" /> {/* Amber 500 */}
                  <stop offset="100%" stopColor="#d97706" /> {/* Amber 600 */}
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                cx="64" cy="64" r="60"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/30"
              />
              {/* Progress Path */}
              <circle
                cx="64" cy="64" r="60"
                fill="transparent"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-muted mx-auto ring-4 ring-background relative z-10">
            {profile?.photos[0] || profile?.avatar_url ? (
              <img
                src={profile.photos[0] || profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="ri-user-3-line text-4xl text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Percentage Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-[#1f2937] text-white text-xs font-bold px-3 py-1 rounded-full border border-border/50 shadow-lg flex items-center justify-center min-w-[3rem]">
              {completion}%
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold mt-4">
          {profile?.display_name}
          {profile?.birth_date && (
            <span className="font-normal text-muted-foreground">, {calculateAge(profile.birth_date)}</span>
          )}
        </h1>

        {(profile?.city || profile?.state) && (
          <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <i className="ri-map-pin-line" />
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Bio / About Section Replacement for Info Cards */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ri-double-quotes-l text-primary text-xl" />
            <h2 className="font-display font-semibold text-foreground">Sobre mim</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <i className="ri-eye-line" />
            Público
          </span>
        </div>

        {profile?.bio ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground/90 leading-relaxed pl-2 border-l-2 border-primary/20">
              {profile.bio}
            </p>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBioText(profile?.bio || '');
                  setIsBioDialogOpen(true);
                }}
                className="text-[10px] h-7 text-primary hover:text-primary/80 hover:bg-primary/5 uppercase tracking-wider font-bold"
              >
                <i className="ri-edit-line mr-1" />
                Editar Bio
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm italic mb-3">
              Sem descrição ainda. Adicione algo sobre você!
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBioText(profile?.bio || '');
                setIsBioDialogOpen(true);
              }}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Adicionar Descrição
            </Button>
          </div>
        )}
      </div>

      {/* Combined Interests */}
      {((profile?.interests && profile.interests.length > 0) || (profile?.christian_interests && profile.christian_interests.length > 0)) && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <i className="ri-heart-add-line text-primary" />
            Interesses
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile?.christian_interests?.map((interest, i) => (
              <span key={`c-${i}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                {interest}
              </span>
            ))}
            {profile?.interests?.map((interest, i) => (
              <span
                key={`g-${i}`}
                className="px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm border border-white/5"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <Button
          onClick={() => navigate('/app/profile/edit')}
          className="w-full h-12 font-medium bg-card text-foreground border border-border hover:bg-muted dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/20 dark:text-white"
        >
          <i className="ri-pencil-line mr-2 text-lg" />
          Editar Perfil
        </Button>





        {/* App Installation Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <button
            onClick={() => navigate('/install')}
            className="group flex flex-col items-center gap-2 mx-auto px-4 py-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <i className="ri-download-cloud-2-line text-lg" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Instale o App no seu celular
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
                Tenha uma experiência premium com notificações e acesso instantâneo. Toque para ver como instalar.
              </p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={isBioDialogOpen} onOpenChange={setIsBioDialogOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl border-border bg-card/95 backdrop-blur-xl outline-none">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Sobre mim</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conte um pouco sobre você, sua fé e o que você procura. Sua descrição ajuda outras pessoas a te conhecerem melhor.
            </p>
            <Textarea
              placeholder="Ex: Sou apaixonado por missões, amo louvor e busco alguém para caminhar na fé..."
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="min-h-[150px] bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 resize-none text-sm leading-relaxed"
              maxLength={500}
            />
            <p className="text-[10px] text-right text-muted-foreground">
              {bioText.length}/500 caracteres
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
            <Button
              onClick={handleSaveBio}
              disabled={isSavingBio || bioText.length === 0}
              className="w-full h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium"
            >
              {isSavingBio ? 'Salvando...' : 'Salvar Descrição'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsBioDialogOpen(false)}
              className="w-full h-11 rounded-xl text-muted-foreground hover:bg-muted font-medium"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
