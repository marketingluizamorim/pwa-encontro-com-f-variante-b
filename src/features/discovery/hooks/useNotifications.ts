import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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

                const { count, error: countError } = await queryCount;

                if (!countError && count !== null) {
                    setNotifications(prev => ({ ...prev, likesCount: count }));
                }

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

        // Executar verificações iniciais
        checkMatches();
        checkMessages();
        checkDiscover();
        checkExplore();

        // Configurar realtime para mensagens
        const messagesChannel = supabase
            .channel('new_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    // Verificar se a mensagem é para o usuário atual
                    const { data: matchData } = await supabase
                        .from('matches')
                        .select('user1_id, user2_id')
                        .eq('id', payload.new.match_id)
                        .single();

                    if (matchData &&
                        (matchData.user1_id === user.id || matchData.user2_id === user.id)) {

                        if (payload.new.sender_id !== user.id) {
                            setNotifications(prev => ({ ...prev, chat: true }));
                        }

                        // Invalida a query de conversas globalmente
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                    }
                }
            )
            .subscribe();

        // Configurar realtime para swipes (likes)
        const swipesChannel = supabase
            .channel('new_swipes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all changes to keep count accurate
                    schema: 'public',
                    table: 'swipes',
                    filter: `swiped_id=eq.${user.id}`,
                },
                () => {
                    // Recalculate everything to stay perfectly in sync
                    checkMatches();
                    // Invalida a query de curtidas globalmente
                    queryClient.invalidateQueries({ queryKey: ['likes', user.id] });
                }
            )
            .subscribe();

        // Configurar realtime para novos perfis (afeta aba Descobrir)
        const profilesChannel = supabase
            .channel('new_profiles_notif')
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

        // Configurar realtime para novos matches (afeta aba Chat)
        const matchesChannel = supabase
            .channel('new_matches_notif')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'matches',
                },
                (payload) => {
                    if (payload.new.user1_id === user.id || payload.new.user2_id === user.id) {
                        setNotifications(prev => ({ ...prev, chat: true }));
                        // Invalida as queries de conversas e curtidas globalmente
                        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
                        queryClient.invalidateQueries({ queryKey: ['likes', user.id] });
                    }
                }
            )
            .subscribe();

        return () => {
            messagesChannel.unsubscribe();
            swipesChannel.unsubscribe();
            profilesChannel.unsubscribe();
            matchesChannel.unsubscribe();
        };
    }, [user]);

    // Função para limpar notificação quando usuário visita a seção
    const clearNotification = (section: keyof NotificationState) => {
        setNotifications(prev => ({ ...prev, [section]: false }));
        if (user) {
            localStorage.setItem(`last_${section}_check_${user.id}`, Date.now().toString());
        }
    };

    return { notifications, clearNotification };
}
