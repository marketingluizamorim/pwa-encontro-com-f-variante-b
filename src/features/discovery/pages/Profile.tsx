import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, CheckCircle2, MessageSquare, BookOpen, GraduationCap, Heart, Star, Sparkles, LogOut, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
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
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { Header } from '@/features/discovery/components/Header';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';
import { PLANS } from '@/features/funnel/components/plans/PlansGrid';

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
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeData, setUpgradeData] = useState({
    title: 'Faça Upgrade',
    description: 'Desbloqueie recursos premium',
    features: PLANS.find(p => p.id === 'gold')?.features || [],
    icon: <Crown className="w-12 h-12 text-amber-500" />,
    price: PLANS.find(p => p.id === 'gold')?.price || 49.90,
    planId: 'gold'
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const { data: subscription } = useSubscription();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const isOwnProfile = !userId || userId === user?.id;

  const { data: profile = null, isLoading: loading, refetch: loadProfile } = useQuery({
    queryKey: ['profile', userId || user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!user) return null;
      const targetUserId = userId || user.id;

      try {
        const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
        const { data, error } = await supabaseRuntime
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (error) throw error;

        // If no data and it's own profile, return default
        if (!data && isOwnProfile) {
          return {
            display_name: user.user_metadata?.display_name || 'Usuário',
            bio: 'Complete seu perfil para aparecer para outras pessoas.',
            photos: [],
            interests: [],
          } as UserProfile;
        }

        if (!data) throw new Error('Profile not found');

        return data as UserProfile;
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isOwnProfile) {
          return {
            display_name: user.user_metadata?.display_name || 'Usuário',
            bio: 'Complete seu perfil para aparecer para outras pessoas.',
            photos: [],
            interests: [],
          } as UserProfile;
        } else {
          toast.error('Perfil não encontrado', { style: { marginTop: '50px' } });
          throw error;
        }
      }
    }
  });

  // Real-time listener for profile changes (Ensures info appears in real-time without refresh)
  useEffect(() => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    let channel: any = null;
    let supabaseClient: any = null;

    const setupRealtime = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      supabaseClient = supabase;

      channel = supabase
        .channel(`profile-realtime-${targetUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${targetUserId}`,
          },
          (payload: any) => {
            console.log('Profile updated in real-time:', payload);
            queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [user?.id, userId, queryClient]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveBio = async () => {
    if (!user || !isOwnProfile) return;
    setIsSavingBio(true);
    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime
        .from('profiles')
        .update({ bio: bioText })
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.setQueryData(['profile', userId || user?.id], (old: UserProfile | null | undefined) => {
        if (!old) return old;
        return { ...old, bio: bioText };
      });

      setIsBioDialogOpen(false);
      toast.success('Descrição atualizada com sucesso!', { style: { marginTop: '50px' } });
    } catch (error) {
      console.error('Error saving bio:', error);
      toast.error('Erro ao salvar descrição', { style: { marginTop: '50px' } });
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
    <PageTransition className="h-[calc(100vh-8rem)]">
      <PullToRefresh onRefresh={async () => { await loadProfile(); }} className="h-full">
        <div className="flex flex-col pb-24 relative">
          <Header action={
            <button
              onClick={() => navigate('/app/settings')}
              className="w-11 h-11 rounded-full bg-background/20 backdrop-blur-md border border-border/10 flex items-center justify-center text-foreground/80 hover:bg-background/30 active:scale-95 transition-all outline-none"
            >
              <i className="ri-settings-3-line text-xl" />
            </button>
          } />

          {/* Header if viewing other profile */}
          {!isOwnProfile && (
            <div className="flex items-center gap-3 px-6 pt-4 mb-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <i className="ri-arrow-left-line text-xl" />
              </Button>
              <span className="font-semibold text-lg">Perfil</span>
            </div>
          )}

          {/* Profile Header */}
          <div className="text-center mt-6">
            <div className="relative inline-block mb-4">
              {/* Progress Ring - Only for own profile */}
              {isOwnProfile && (
                <div className="absolute -inset-2 flex items-center justify-center pointer-events-none">
                  <svg className="w-[128px] h-[128px] -rotate-90">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="64" cy="64" r="60"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/30"
                    />
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
              )}

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

              {/* Percentage Pill - Only for own profile */}
              {isOwnProfile && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-[#1f2937] text-white text-xs font-bold px-3 py-1 rounded-full border border-border/50 shadow-lg flex items-center justify-center min-w-[3rem]">
                    {completion}%
                  </div>
                </div>
              )}
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

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 space-y-3 mx-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-double-quotes-l text-primary text-xl" />
                <h2 className="font-display font-semibold text-foreground">Sobre mim</h2>
              </div>
              {isOwnProfile && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <i className="ri-eye-line" />
                  Público
                </span>
              )}
            </div>

            {profile?.bio ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground/90 leading-relaxed pl-2 border-l-2 border-primary/20">
                  {profile.bio}
                </p>
                {isOwnProfile && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBioText(profile?.bio || '');
                        setIsBioDialogOpen(true);
                      }}
                      className="text-[12px] h-7 text-primary hover:text-primary/80 hover:bg-primary/5 tracking-wider font-bold"
                    >
                      <i className="ri-edit-line mr-1" />
                      Editar Bio
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm italic mb-3">
                  {isOwnProfile
                    ? 'Sem descrição ainda. Adicione algo sobre você!'
                    : 'Este usuário ainda não adicionou uma descrição.'}
                </p>
                {isOwnProfile && (
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
                )}
              </div>
            )}
          </div>

          {/* Edit Profile Button - Moved here */}
          {isOwnProfile && (
            <div className="px-4 mt-4">
              <Button
                onClick={() => navigate('/app/profile/edit')}
                className="w-full h-12 font-medium bg-card text-foreground border border-border hover:bg-muted dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/20 dark:text-white"
              >
                <i className="ri-pencil-line mr-2 text-lg" />
                Editar Perfil
              </Button>
            </div>
          )}

          {/* Subscription Status Card */}
          {isOwnProfile && (
            <div className="space-y-4 px-4 mt-6">
              {(subscription?.tier === 'gold') ? (
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6 border transition-all group",
                  isDarkMode
                    ? "bg-gradient-to-br from-amber-500/20 via-amber-900/10 to-transparent border-amber-500/30"
                    : "bg-gradient-to-br from-amber-100 via-amber-50/50 to-white border-amber-200 shadow-sm"
                )}>
                  <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown className="w-32 h-32 text-amber-600" />
                  </div>

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-amber-700 dark:text-amber-500">
                        Membro Ouro
                      </h3>
                      <p className="text-[10px] text-amber-600/60 dark:text-muted-foreground uppercase tracking-widest font-bold">Acesso Vitalício Liberado</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2.5">
                      {[
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Descubra quem curtiu seu perfil imediatamente" },
                        { icon: <MessageSquare className="w-3.5 h-3.5" />, text: "Mande mensagens diretas antes mesmo da conexão" },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Saiba quem está online no momento no app" },
                        { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Filtre por distância exata e interesses específicos" },
                        { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "Destaque seu perfil no topo para 3x mais matches" },
                        { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Filtros exclusivos por idade e objetivos de vida" },
                        { icon: <Heart className="w-3.5 h-3.5" />, text: "Busque por objetivos (Namoro ou Casamento)" },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Tudo ilimitado e sem restrições" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-foreground/80">
                          <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-600 dark:text-amber-500">
                            {item.icon}
                          </div>
                          <span className="text-xs font-medium">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-amber-500/10">
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 pl-1">BÔNUS EXCLUSIVOS</p>
                      <div className="space-y-2.5">
                        {[
                          { icon: <MessageSquare className="w-3.5 h-3.5" />, text: "Comunidade cristã no WhatsApp" },
                          { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Cursos bíblicos exclusivos" },
                          { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Devocionais diários" },
                          { icon: <Heart className="w-3.5 h-3.5" />, text: "Dicas de relacionamento cristão" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-foreground/80">
                            <div className="bg-amber-500/5 p-1.5 rounded-lg text-amber-600/80 dark:text-amber-500/80">
                              {item.icon}
                            </div>
                            <span className="text-xs font-medium">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : subscription?.tier === 'silver' ? (
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6 border transition-all",
                  isDarkMode
                    ? "bg-slate-900/40 border-slate-700/50"
                    : "bg-gradient-to-br from-slate-100 to-white border-slate-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">Plano Prata</h3>
                        <p className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase tracking-widest font-bold">Assinatura Ativa</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeDialog(true)}
                      className="h-8 rounded-lg text-[10px] font-bold uppercase border-amber-500/50 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      Upgrade
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {PLANS.find(p => p.id === 'silver')?.features.map((text, i) => (
                      <div key={i} className="flex items-center gap-3 text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">NÃO INCLUSO</p>
                    {PLANS.find(p => p.id === 'silver')?.excludedFeatures?.map((text, i) => (
                      <div key={`excluded-${i}`} className="flex items-center gap-3 text-muted-foreground/40">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium line-through decoration-muted-foreground/50">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : subscription?.tier === 'bronze' ? (
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6 border transition-all",
                  isDarkMode
                    ? "bg-orange-950/20 border-orange-800/40"
                    : "bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center shadow-lg">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-orange-800 dark:text-orange-400">Plano Bronze</h3>
                        <p className="text-[10px] text-orange-700/60 dark:text-muted-foreground uppercase tracking-widest font-bold">Assinatura Ativa</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeDialog(true)}
                      className="h-8 rounded-lg text-[10px] font-bold uppercase border-amber-500/50 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      Upgrade
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {PLANS.find(p => p.id === 'bronze')?.features.map((text, i) => (
                      <div key={i} className="flex items-center gap-3 text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-medium">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">NÃO INCLUSO</p>
                    {PLANS.find(p => p.id === 'bronze')?.excludedFeatures?.map((text, i) => (
                      <div key={`excluded-${i}`} className="flex items-center gap-3 text-muted-foreground/40">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium line-through decoration-muted-foreground/50">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6 border transition-all group",
                  isDarkMode
                    ? "bg-gradient-to-br from-primary/10 via-card to-card border-primary/20"
                    : "bg-gradient-to-br from-primary/5 via-white to-white border-primary/10 shadow-sm"
                )}>
                  <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Sparkles className="w-24 h-24 text-primary" />
                  </div>
                  <div className="relative z-10 text-center sm:text-left">
                    <h3 className="font-display font-bold text-xl mb-1 flex items-center justify-center sm:justify-start gap-2">
                      Clube Encontro com Fé <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Encontre o seu par ideal 3x mais rápido com as funções premium.
                    </p>
                    <Button
                      onClick={() => setShowUpgradeDialog(true)}
                      className="w-full h-12 rounded-xl gradient-button text-white font-bold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] border-0"
                    >
                      Dar um boost no meu perfil
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Only for own profile */}
          {isOwnProfile && (
            <div className="space-y-2 px-4">

              {/* App Installation Disclaimer */}
              <div className="mt-4 pt-4 border-t border-border/30 text-center">
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
          )}

          {isOwnProfile && (
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
          )}

          <FeatureGateDialog
            open={showUpgradeDialog}
            onOpenChange={setShowUpgradeDialog}
            title={upgradeData.title}
            description={upgradeData.description}
            features={upgradeData.features}
            icon={upgradeData.icon}
            price={upgradeData.price}
            onUpgrade={(planData) => {
              // 1. Define os dados específicos do checkout IMEDIATAMENTE
              setSelectedCheckoutPlan({
                id: planData.id,
                name: planData.name,
                price: planData.price
              });

              // 2. Fecha o seletor e abre o checkout de forma síncrona
              setShowUpgradeDialog(false);
              setShowCheckoutManager(true);
            }}
          />

          {showCheckoutManager && selectedCheckoutPlan && (
            <CheckoutManager
              key={`checkout-v1-${selectedCheckoutPlan.id}`}
              open={showCheckoutManager}
              onOpenChange={(open) => {
                setShowCheckoutManager(open);
                if (!open) {
                  // Pequeno delay para permitir a animação de fechamento antes de reabrir o seletor
                  // e limpar o estado, evitando o 'piscado' do fundo
                  setTimeout(() => {
                    setSelectedCheckoutPlan(null);
                    setShowUpgradeDialog(true);
                  }, 50);
                }
              }}
              planId={selectedCheckoutPlan.id}
              planPrice={selectedCheckoutPlan.price}
              planName={selectedCheckoutPlan.name}
            />
          )}

          {/* Debug Plan Switcher - Only for specific user */}
          {user?.email === 'marketing.luizamorim@gmail.com' && isOwnProfile && (
            <div className="mx-4 mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl space-y-3">
              <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <i className="ri-bug-line" /> Área de Teste (Admin)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const toastId = toast.loading('Alterando para Bronze...', { style: { marginTop: '50px' } });
                    try {
                      const { supabase } = await import('@/integrations/supabase/client');

                      const { error } = await supabase.from('user_subscriptions').upsert({
                        user_id: user.id,
                        plan_id: 'bronze',
                        plan_name: 'Bronze',
                        is_active: true,
                        can_see_who_liked: false,
                        can_video_call: false,
                        can_use_advanced_filters: false,
                        is_profile_boosted: false,
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                      }, { onConflict: 'user_id' });

                      if (error) throw error;
                      toast.success('Alterado para Bronze!', { id: toastId, style: { marginTop: '50px' } });
                      setTimeout(() => window.location.reload(), 1000);
                    } catch (err: unknown) {
                      console.error(err);
                      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                      toast.error(`Erro: ${errorMessage}`, { id: toastId, style: { marginTop: '50px' } });
                    }
                  }}
                  className="bg-orange-950/30 border-orange-500/20 text-orange-200 hover:bg-orange-900/50"
                >
                  Plano Bronze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const toastId = toast.loading('Alterando para Prata...', { style: { marginTop: '50px' } });
                    try {
                      const { supabase } = await import('@/integrations/supabase/client');

                      const { error } = await supabase.from('user_subscriptions').upsert({
                        user_id: user.id,
                        plan_id: 'silver',
                        plan_name: 'Prata',
                        is_active: true,
                        can_see_who_liked: true,
                        can_video_call: true,
                        can_use_advanced_filters: false,
                        is_profile_boosted: false,
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                      }, { onConflict: 'user_id' });

                      if (error) throw error;
                      toast.success('Alterado para Prata!', { id: toastId, style: { marginTop: '50px' } });
                      setTimeout(() => window.location.reload(), 1000);
                    } catch (err: unknown) {
                      console.error(err);
                      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                      toast.error(`Erro: ${errorMessage}`, { id: toastId, style: { marginTop: '50px' } });
                    }
                  }}
                  className="bg-slate-800/50 border-slate-400/20 text-slate-200 hover:bg-slate-700/50"
                >
                  Plano Prata
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const toastId = toast.loading('Alterando para Ouro...', { style: { marginTop: '50px' } });
                    try {
                      const { supabase } = await import('@/integrations/supabase/client');

                      const { error } = await supabase.from('user_subscriptions').upsert({
                        user_id: user.id,
                        plan_id: 'gold',
                        plan_name: 'Ouro',
                        is_active: true,
                        can_see_who_liked: true,
                        can_video_call: true,
                        can_use_advanced_filters: true,
                        is_profile_boosted: true,
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                      }, { onConflict: 'user_id' });

                      if (error) throw error;
                      toast.success('Alterado para Ouro!', { id: toastId, style: { marginTop: '50px' } });
                      setTimeout(() => window.location.reload(), 1000);
                    } catch (err: unknown) {
                      console.error(err);
                      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                      toast.error(`Erro: ${errorMessage}`, { id: toastId, style: { marginTop: '50px' } });
                    }
                  }}
                  className="bg-yellow-950/30 border-yellow-500/20 text-yellow-200 hover:bg-yellow-900/50"
                >
                  Plano Ouro
                </Button>
              </div>
            </div>
          )}

        </div>
      </PullToRefresh>
    </PageTransition >
  );
}
