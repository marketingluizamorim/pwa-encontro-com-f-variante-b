import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageTransition } from '@/features/discovery/components/PageTransition';
import { MatchesListSkeleton } from '@/features/discovery/components/SkeletonLoaders';
import { PullToRefresh } from '@/features/discovery/components/PullToRefresh';
import { toast } from 'sonner';

interface Match {
  id: string;
  matched_at: string;
  profile: {
    id: string;
    display_name: string;
    avatar_url?: string;
    photos: string[];
  };
}

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user) return;
    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // 1. Get Matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('id, created_at, user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      // 2. Get Profiles
      const otherUserIds = matchesData.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);

      // Only fetch if we have IDs
      if (otherUserIds.length === 0) {
        setMatches([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, photos')
        .in('user_id', otherUserIds);

      if (profilesError) throw profilesError;

      // 3. Map together
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const formattedMatches: Match[] = matchesData.map(m => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const profile = profilesMap.get(otherId);

        if (!profile) return null;

        return {
          id: m.id,
          matched_at: m.created_at,
          profile: {
            id: profile.user_id,
            display_name: profile.display_name || 'Usuário',
            avatar_url: profile.avatar_url || undefined,
            photos: profile.photos || []
          }
        }
      }).filter((m): m is Match => m !== null);

      setMatches(formattedMatches);

    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Erro ao carregar matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = async () => {
    await fetchMatches();
    toast.success('Matches atualizados');
  };

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `${diffDays} dias atrás`;
  };

  if (loading) {
    return <MatchesListSkeleton />;
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <i className="ri-heart-3-line text-4xl text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Nenhum match ainda</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Continue explorando perfis para encontrar sua combinação perfeita!
        </p>
        <Link
          to="/app/discover"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-button text-white font-semibold"
        >
          <i className="ri-compass-3-line" />
          Descobrir perfis
        </Link>
      </div>
    );
  }

  return (
    <PageTransition className="h-[calc(100vh-8rem)]">
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="space-y-6 px-4 pt-6 pb-24">
          <div>
            <h1 className="font-display text-2xl font-bold">Matches</h1>
            <p className="text-muted-foreground text-sm">Pessoas que também curtiram você</p>
          </div>

          {/* New Matches (horizontal scroll) */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <i className="ri-sparkling-line text-amber-500" />
              Novos Matches
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {matches.slice(0, 5).map((match) => (
                <Link
                  key={match.id}
                  to={`/app/chat/${match.id}`}
                  className="flex-shrink-0 text-center group"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-background mb-2 group-hover:ring-amber-500 transition-all">
                    <img
                      src={match.profile.photos[0] || match.profile.avatar_url}
                      alt={match.profile.display_name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium truncate max-w-[80px]">
                    {match.profile.display_name}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* All Matches (list) */}
          <div>
            <h2 className="font-semibold mb-3">Todos os Matches</h2>
            <div className="space-y-2">
              {matches.map((match, index) => (
                <Link
                  key={match.id}
                  to={`/app/chat/${match.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img
                      src={match.profile.photos[0] || match.profile.avatar_url}
                      alt={match.profile.display_name}
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{match.profile.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Match {formatMatchTime(match.matched_at)}
                    </p>
                  </div>
                  <i className="ri-chat-3-line text-xl text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
