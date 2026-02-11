import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, CheckCircle2, MessageSquare, BookOpen, GraduationCap, Heart, Star, Sparkles, LogOut, Settings, ShieldCheck, XCircle } from 'lucide-react';
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
import { FeatureGateDialog } from '@/features/discovery/components/FeatureGateDialog';
import { Header } from '@/features/discovery/components/Header';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { LikeLimitDialog } from '@/features/discovery/components/LikeLimitDialog';
import { CheckoutManager } from '@/features/discovery/components/CheckoutManager';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showLikeLimitTest, setShowLikeLimitTest] = useState(false);
  const [upgradeData, setUpgradeData] = useState({
    title: '',
    description: '',
    features: [] as string[],
    planNeeded: 'silver' as 'silver' | 'gold' | 'bronze',
    icon: null as React.ReactNode,
    price: 0,
    planId: ''
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const { data: subscription } = useSubscription();

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    loadProfile();
  }, [user, userId]);

  const loadProfile = async () => {
    if (!user) return;

    const targetUserId = userId || user.id;

    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { data, error } = await supabaseRuntime
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      if (isOwnProfile) {
        setProfile({
          display_name: user.user_metadata?.display_name || 'Usuário',
          bio: 'Complete seu perfil para aparecer para outras pessoas.',
          photos: [],
          interests: [],
        });
      } else {
        toast.error('Perfil não encontrado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDevSetPlan = async (tier: 'bronze' | 'silver' | 'gold' | 'plus') => {
    if (!user) return;
    const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

    setLoading(true);
    const mockPaymentId = `dev-test-${tier}-${Date.now()}`;

    try {
      const { error: purchaseError } = await supabaseRuntime
        .from('purchases')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: profile?.display_name || user.user_metadata?.display_name || 'Dev User',
          plan_id: tier,
          plan_name: tier === 'plus' ? 'Plano Plus (Combo Dev)' : `Plano ${tier.toUpperCase()} (Dev)`,
          plan_price: tier === 'plus' ? 24.90 : tier === 'bronze' ? 12.90 : tier === 'silver' ? 29.90 : 49.90,
          total_price: tier === 'plus' ? 24.90 : tier === 'bronze' ? 12.90 : tier === 'silver' ? 29.90 : 49.90,
          payment_status: 'PAID',
          payment_id: mockPaymentId,
          created_at: new Date().toISOString()
        });

      if (purchaseError) throw purchaseError;

      const { error: funcError } = await supabaseRuntime.functions.invoke('check-payment-status', {
        body: { paymentId: mockPaymentId }
      });

      if (funcError) throw funcError;

      toast.success(`Plano ${tier.toUpperCase()} ativado via backend!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('Dev Plan Error:', err);
      toast.error('Erro ao processar plano dev no servidor');
    } finally {
      setLoading(false);
    }
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
    <PageTransition className="h-[calc(100vh-8rem)]">
      <PullToRefresh onRefresh={loadProfile} className="h-full">
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
                      className="text-[10px] h-7 text-primary hover:text-primary/80 hover:bg-primary/5 uppercase tracking-wider font-bold"
                    >
                      <i className="ri-edit-line mr-1" />
                      Editar
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

          {/* Subscription Status Card */}
          {isOwnProfile && (
            <div className="space-y-4 px-4 mt-6">
              {(subscription?.tier === 'gold' || subscription?.tier === 'plus') ? (
                <div className="bg-gradient-to-br from-[#d4af37]/20 via-[#b45309]/10 to-transparent border border-[#d4af37]/30 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Crown className="w-32 h-32 text-[#d4af37]" />
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37] flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-[#d4af37]">
                        Membro Ouro
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Acesso Vitalício Liberado</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      {[
                        { icon: <MessageSquare className="w-3.5 h-3.5" />, text: "Enviar mensagem sem precisar curtir antes" },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Ver perfis online recentemente" },
                        { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Filtro por distância e interesses" },
                        { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "Perfil em destaque" },
                        { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Filtros avançados (idade e distância)" },
                        { icon: <Heart className="w-3.5 h-3.5" />, text: "Filtro por objetivo (Namoro ou Casamento)" },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Curtidas e Mensagens Ilimitadas" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/80">
                          <div className="bg-[#d4af37]/20 p-1.5 rounded-lg text-[#d4af37]">
                            {item.icon}
                          </div>
                          <span className="text-xs font-medium">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-3 pl-1">BÔNUS EXCLUSIVOS</p>
                      <div className="space-y-2.5">
                        {[
                          { icon: <MessageSquare className="w-3.5 h-3.5" />, text: "Comunidade cristã no WhatsApp" },
                          { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Cursos bíblicos exclusivos" },
                          { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Devocionais diários" },
                          { icon: <Heart className="w-3.5 h-3.5" />, text: "Dicas de relacionamento cristão" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-white/80">
                            <div className="bg-[#d4af37]/10 p-1.5 rounded-lg text-[#d4af37]/80">
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
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-400 flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">Plano Prata</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Assinatura Ativa</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeDialog(true)}
                      className="h-8 rounded-lg text-[10px] font-bold uppercase border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      Upgrade
                    </Button>
                  </div>



                  <div className="space-y-2.5">
                    {[
                      "Ver quem curtiu você",
                      "Curtidas e Mensagens Ilimitadas",
                      "Filtro por Estado e Cidade",
                      "Vídeo Chamada Liberada",
                      "Comunidade cristã no WhatsApp"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-medium">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2.5 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">NÃO INCLUSO</p>
                    {[
                      'Enviar mensagem direta (sem curtir antes)',
                      'Filtro por distância',
                      'Filtro por interesses cristãos',
                      'Filtro por atividade (online recentemente)',
                      'Destaque do perfil'
                    ].map((text, i) => (
                      <div key={`excluded-${i}`} className="flex items-center gap-3 text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium line-through decoration-muted-foreground/50">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : subscription?.tier === 'bronze' ? (
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-700/50 flex items-center justify-center shadow-lg">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">Plano Bronze</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Assinatura Ativa</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpgradeDialog(true)}
                      className="h-8 rounded-lg text-[10px] font-bold uppercase border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      Upgrade
                    </Button>
                  </div>



                  <div className="space-y-2.5">
                    {[
                      "A conversa só começa quando ambos curtirem",
                      "Enviar e receber mensagens de texto",
                      "20 Curtidas por dia"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-medium">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2.5 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">NÃO INCLUSO</p>
                    {[
                      'Ver quem curtiu você',
                      'Enviar mensagem direta',
                      'Enviar ou receber fotos e áudios',
                      'Chamadas de vídeo',
                      'Destaque do perfil',
                      'Uso de filtros'
                    ].map((text, i) => (
                      <div key={`excluded-${i}`} className="flex items-center gap-3 text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium line-through decoration-muted-foreground/50">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                    <Sparkles className="w-24 h-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-display font-bold text-xl mb-1 flex items-center gap-2">
                      Clube Encontro com F <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
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
            <div className="space-y-2 pt-4 px-4">
              <Button
                onClick={() => navigate('/app/profile/edit')}
                className="w-full h-12 font-medium bg-card text-foreground border border-border hover:bg-muted dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/20 dark:text-white"
              >
                <i className="ri-pencil-line mr-2 text-lg" />
                Editar Perfil
              </Button>

              <Button
                onClick={() => handleSignOut()}
                variant="ghost"
                className="w-full h-12 font-medium text-destructive hover:text-destructive hover:bg-destructive/5"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sair da Conta
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

              {/* DEV MODE PANEL */}
              <div className="mt-12 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center mb-3 flex items-center justify-center gap-2">
                  <Settings className="w-3 h-3" /> Dev Tools: Testar Planos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-[10px] border-red-500/30 hover:bg-red-500/20 bg-background/50" onClick={() => handleDevSetPlan('bronze')}>BRONZE</Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] border-red-500/30 hover:bg-red-500/20 bg-background/50" onClick={() => handleDevSetPlan('silver')}>PRATA</Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] border-red-500/30 hover:bg-red-500/20 bg-background/50" onClick={() => handleDevSetPlan('gold')}>OURO</Button>
                  <Button size="sm" variant="default" className="h-8 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={() => handleDevSetPlan('plus')}>PLUS (COMBO)</Button>
                  <Button size="sm" variant="outline" className="h-8 text-[10px] border-amber-500/50 text-amber-500 hover:bg-amber-500/10 bg-background/50 col-span-2 font-bold" onClick={() => setShowLikeLimitTest(true)}>
                    🚀 LIMITE (POPUP)
                  </Button>
                </div>
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
            onUpgrade={() => setShowCheckoutManager(true)}
          />

          <CheckoutManager
            open={showCheckoutManager}
            onOpenChange={setShowCheckoutManager}
            planId={upgradeData.planId}
            planPrice={upgradeData.price}
            planName={upgradeData.title}
          />

          <LikeLimitDialog
            open={showLikeLimitTest}
            onOpenChange={setShowLikeLimitTest}
            onSeePlans={() => {
              setUpgradeData({
                title: "Plano Prata",
                description: "Não pare sua busca! Assine o Plano Prata para ter curtidas ilimitadas e falar com quem você gosta!",
                features: [
                  "Ver quem curtiu você",
                  "Curtidas ilimitadas",
                  "Mensagens de texto ilimitadas",
                  "Filtro por cidade / região",
                  "Enviar e receber fotos e áudios",
                  "Fazer chamadas de vídeo"
                ],
                planNeeded: 'silver',
                icon: <i className="ri-heart-line text-4xl" />,
                price: 29.90,
                planId: 'silver'
              });
              setShowUpgradeDialog(true);
            }}
          />
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
