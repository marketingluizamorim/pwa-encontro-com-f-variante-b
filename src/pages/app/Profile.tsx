import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PageTransition } from '@/components/app/PageTransition';
import { ProfileSkeleton } from '@/components/app/SkeletonLoaders';

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
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
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

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <PageTransition className="space-y-6 pb-4">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-muted mx-auto ring-4 ring-primary/20">
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
          <button
            onClick={() => navigate('/app/profile/edit')}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          >
            <i className="ri-pencil-line" />
          </button>
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

      {/* Bio */}
      {profile?.bio && (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm">{profile.bio}</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        {profile?.religion && (
          <div className="bg-muted/50 rounded-xl p-4">
            <i className="ri-book-open-line text-primary text-xl mb-1" />
            <p className="text-xs text-muted-foreground">Religião</p>
            <p className="font-medium text-sm">{profile.religion}</p>
          </div>
        )}

        {profile?.church_frequency && (
          <div className="bg-muted/50 rounded-xl p-4">
            <i className="ri-home-heart-line text-primary text-xl mb-1" />
            <p className="text-xs text-muted-foreground">Igreja</p>
            <p className="font-medium text-sm">{profile.church_frequency}</p>
          </div>
        )}

        {profile?.looking_for && (
          <div className="bg-muted/50 rounded-xl p-4 col-span-2">
            <i className="ri-search-heart-line text-primary text-xl mb-1" />
            <p className="text-xs text-muted-foreground">Procurando</p>
            <p className="font-medium text-sm">{profile.looking_for}</p>
          </div>
        )}
      </div>

      {/* Interests */}
      {profile?.interests && profile.interests.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Interesses</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
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
          variant="outline"
          className="w-full"
        >
          <i className="ri-pencil-line mr-2" />
          Editar Perfil
        </Button>

        <Button
          onClick={() => navigate('/app/settings')}
          variant="outline"
          className="w-full"
        >
          <i className="ri-settings-3-line mr-2" />
          Configurações
        </Button>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full text-destructive hover:text-destructive"
        >
          <i className="ri-logout-box-r-line mr-2" />
          Sair
        </Button>
      </div>
    </PageTransition>
  );
}
