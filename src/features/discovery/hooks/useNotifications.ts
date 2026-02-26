import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { calculateAge } from '@/lib/date-utils';

interface NotificationState {
    discover: boolean;  // Novos perfis disponíveis
    explore: boolean;   // Novo conteúdo no Explorar
    matches: boolean;   // Novos likes recebidos
    chat: boolean;      // Novas mensagens não lidas
    likesCount: number; // Total de likes recebidos
}

export function useNotifications() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState<NotificationState>({
        discover: false,
        explore: false,
        matches: false,
        chat: false,
        likesCount: 0,
    });

    useEffect(() => {
        if (!user) return;

        // Verificar novos likes recebidos (swipes com direction 'like')
        const checkMatches = async () => {
            try {
                // 1. Obter IDs que eu já interagi (swipes)
                const { data: mySwipes } = await supabase
                    .from('swipes')
                    .select('swiped_id')
                    .eq('swiper_id', user.id);

                const mySwipedIds = mySwipes?.map(s => s.swiped_id) || [];

                // 2. Obter usuários bloqueados (user_blocks)
                const { data: blocks } = await supabase
                    .from('user_blocks')
                    .select('blocker_id, blocked_id')
                    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

                const blockedIds = blocks?.map(b => b.blocker_id === user.id ? b.blocked_id : b.blocker_id) || [];

                const excludedIds = [...new Set([...mySwipedIds, ...blockedIds])];

                // 3. Verificar novos likes/super_likes desde a última checagem (para o indicador booleano)
                const lastCheck = localStorage.getItem(`last_matches_check_${user.id}`);
                const checkTime = lastCheck ? new Date(parseInt(lastCheck)) : new Date(Date.now() - 24 * 60 * 60 * 1000);

                let queryBoolean = supabase
                    .from('swipes')
                    .select('id')
                    .eq('swiped_id', user.id)
                    .in('direction', ['like', 'super_like'])
                    .gte('created_at', checkTime.toISOString())
                    .limit(1);

                if (excludedIds.length > 0) {
                    queryBoolean = queryBoolean.not('swiper_id', 'in', `(${excludedIds.join(',')})`);
                }

                const { data, error } = await queryBoolean;

                if (!error && data && data.length > 0) {
                    setNotifications(prev => ({ ...prev, matches: true }));
                }

                // 4. Buscar contagem total de likes/super_likes PENDENTES (para o badge numérico)
                let queryCount = supabase
                    .from('swipes')
                    .select('*', { count: 'exact', head: true })
                    .eq('swiped_id', user.id)
                    .in('direction', ['like', 'super_like']);

                if (excludedIds.length > 0) {
                    queryCount = queryCount.not('swiper_id', 'in', `(${excludedIds.join(',')})`);
                }

                const { count } = await queryCount;
                setNotifications(prev => ({ ...prev, likesCount: count || 0 }));

            } catch (error) {
                console.error('Error checking matches:', error);
            }
        };

        // Verificar novas mensagens não lidas
        const checkMessages = async () => {
            try {
                // Primeiro, buscar os matches do usuário
                const { data: matchesData, error: matchesError } = await supabase
                    .from('matches')
                    .select('id')
                    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                    .eq('is_active', true);

                if (matchesError || !matchesData || matchesData.length === 0) return;

                const matchIds = matchesData.map(m => m.id);

                // Buscar mensagens não lidas nos matches do usuário
                const { data, error } = await supabase
                    .from('messages')
                    .select('id, sender_id')
                    .in('match_id', matchIds)
                    .eq('is_read', false)
                    .neq('sender_id', user.id)
                    .limit(1);

                if (!error && data && data.length > 0) {
                    setNotifications(prev => ({ ...prev, chat: true }));
                } else {
                    // Limpar notificação se não houver mais mensagens não lidas
                    setNotifications(prev => ({ ...prev, chat: false }));
                }
            } catch (error) {
                console.error('Error checking messages:', error);
            }
        };

        // Verificar novos perfis no Descobrir
        const checkDiscover = async () => {
            try {
                const lastCheck = localStorage.getItem(`last_discover_check_${user.id}`);
                const checkTime = lastCheck ? new Date(parseInt(lastCheck)) : new Date(Date.now() - 24 * 60 * 60 * 1000);

                const { data, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .neq('user_id', user.id)
                    .gte('created_at', checkTime.toISOString())
                    .limit(1);

                if (!error && data && data.length > 0) {
                    setNotifications(prev => ({ ...prev, discover: true }));
                }
            } catch (error) {
                console.error('Error checking discover:', error);
            }
        };

        // Verificar novo conteúdo no Explorar (atualizado nas últimas 24h)
        const checkExplore = async () => {
            try {
                const lastCheck = localStorage.getItem(`last_explore_check_${user.id}`);
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

                // Verifica se há conteúdo novo (você pode ajustar a lógica conforme sua estrutura)
                if (!lastCheck || new Date(parseInt(lastCheck)) < yesterday) {
                    setNotifications(prev => ({ ...prev, explore: true }));
                }
            } catch (error) {
                console.error('Error checking explore:', error);
            }
        };

        // Escutar atualizações de quiz via evento customizado
        const handleQuizUpdate = () => {
            checkMatches();
        };

        window.addEventListener('quiz-update', handleQuizUpdate);

        // Executar verificações iniciais
        checkMatches();
        checkMessages();
        checkDiscover();
        checkExplore();

        // Configurar realtime para mensagens (INSERT e UPDATE para capturar lidas)
        const messagesChannel = supabase
            .channel(`messages-notif:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to both INSERT (new msgs) and UPDATE (marking as read)
                    schema: 'public',
                    table: 'messages',
                },
                async (payload: any) => {
                    // Recalcular status de mensagens para garantir precisão
                    checkMessages();

                    // Se for uma nova mensagem recebida, invalidar conversas
                    if (payload.eventType === 'INSERT' && payload.new.sender_id !== user.id) {
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                    }
                }
            )
            .subscribe();

        // Configurar realtime para matches
        const matchesChannel = supabase
            .channel(`matches-notif:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'matches',
                },
                (payload: any) => {
                    if (payload.new.user1_id === user.id || payload.new.user2_id === user.id) {
                        checkMessages();
                        checkMatches();
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                        // NOTE: do NOT invalidate ['likes'] here — it causes the Curtidas list
                        // to flash empty after a match. The incoming-likes and swipes-notif
                        // channels already handle likes invalidation correctly.
                    }
                }
            )
            .subscribe();

        // Configurar realtime para swipes (likes)
        const swipesChannel = supabase
            .channel(`swipes-notif:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'swipes',
                    filter: `swiped_id=eq.${user.id}`,
                },
                () => {
                    checkMatches();
                    queryClient.invalidateQueries({ queryKey: ['likes', user.id] });
                }
            )
            .subscribe();

        // Configurar realtime para novos perfis (afeta aba Descobrir)
        const profilesChannel = supabase
            .channel(`profiles-notif:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'profiles',
                },
                (payload) => {
                    if (payload.new.user_id !== user.id) {
                        setNotifications(prev => ({ ...prev, discover: true }));
                    }
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener('quiz-update', handleQuizUpdate);
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(swipesChannel);
            supabase.removeChannel(profilesChannel);
            supabase.removeChannel(matchesChannel);
        };
    }, [user, queryClient]);

    // Função para limpar notificação quando usuário visita a seção
    const clearNotification = (section: keyof NotificationState) => {
        setNotifications(prev => ({ ...prev, [section]: false }));
        if (user) {
            localStorage.setItem(`last_${section}_check_${user.id}`, Date.now().toString());
        }
    };

    return { notifications, clearNotification };
}
