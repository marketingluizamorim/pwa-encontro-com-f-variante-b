import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationState {
    discover: boolean;  // Novos perfis disponíveis
    explore: boolean;   // Novo conteúdo no Explorar
    matches: boolean;   // Novos likes recebidos
    chat: boolean;      // Novas mensagens não lidas
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationState>({
        discover: false,
        explore: false,
        matches: false,
        chat: false,
    });

    useEffect(() => {
        if (!user) return;

        // Verificar novos likes recebidos (swipes com direction 'like')
        const checkMatches = async () => {
            try {
                const lastCheck = localStorage.getItem(`last_matches_check_${user.id}`);
                const checkTime = lastCheck ? new Date(parseInt(lastCheck)) : new Date(Date.now() - 24 * 60 * 60 * 1000);

                const { data, error } = await supabase
                    .from('swipes')
                    .select('id')
                    .eq('swiped_id', user.id)
                    .eq('direction', 'like')
                    .gte('created_at', checkTime.toISOString())
                    .limit(1);

                if (!error && data && data.length > 0) {
                    setNotifications(prev => ({ ...prev, matches: true }));
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
                        (matchData.user1_id === user.id || matchData.user2_id === user.id) &&
                        payload.new.sender_id !== user.id) {
                        setNotifications(prev => ({ ...prev, chat: true }));
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
                    event: 'INSERT',
                    schema: 'public',
                    table: 'swipes',
                    filter: `swiped_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new.direction === 'like') {
                        setNotifications(prev => ({ ...prev, matches: true }));
                    }
                }
            )
            .subscribe();

        return () => {
            messagesChannel.unsubscribe();
            swipesChannel.unsubscribe();
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
