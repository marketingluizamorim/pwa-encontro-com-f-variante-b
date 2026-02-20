import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProfilesData, getStateAbbreviation } from '@/features/funnel/utils/profiles';
import { QuizAnswers } from '@/types/funnel';

export interface SeedDiscoverRow {
    id: string;
    profile_index: number;
    like_sequence_position: number; // 1=no match, 2=match, 3=no match
    age_range: string;
    user_gender: string;
    city: string | null;
    state_name: string | null;
    looking_for: string | null;
    religion: string | null;
    status: 'pending' | 'liked' | 'disliked' | 'super_liked';
}

export interface SeedDiscoverCard {
    seedId: string;
    seedProfileIndex: number;
    /** Position 2 → triggers fake match on like/super_like */
    likeSequencePosition: number;
    user_id: string;
    display_name: string;
    photos: string[];
    avatar_url: string;
    bio: string;
    city: string;
    state: string;
    religion: string;
    occupation: string;
    church_frequency: string;
    about_children: string;
    education: string;
    drink: string;
    smoke: string;
    physical_activity: string;
    languages: string[];
    christian_interests: string[];
    looking_for: string;
    age?: number;
    birth_date?: string;
    show_distance?: boolean;
    gender: string;
    _isSeedDiscover: true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useSeedDiscoverProfiles(userId: string | undefined) {
    const [seedCards, setSeedCards] = useState<SeedDiscoverCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }

        (async () => {
            const { data: rows } = await db
                .from('seed_discover_profiles')
                .select('id, profile_index, like_sequence_position, age_range, user_gender, city, state_name, looking_for, religion')
                .eq('user_id', userId)
                .eq('status', 'pending')
                .order('like_sequence_position', { ascending: true });

            if (!rows || rows.length === 0) {
                setLoading(false);
                return;
            }

            const firstRow = rows[0] as SeedDiscoverRow;
            const quizAnswers: QuizAnswers = {
                age: firstRow.age_range,
                city: firstRow.city || 'São Paulo',
                state: firstRow.state_name || 'São Paulo',
                religion: firstRow.religion || 'Cristã',
                lookingFor: firstRow.looking_for || 'Relacionamento sério',
            };

            // getProfilesData returns 6 profiles; indices 3-5 are for Discover
            const gender: 'male' | 'female' = firstRow.user_gender === 'male' ? 'male' : 'female';
            const allProfiles = getProfilesData(gender, quizAnswers);

            const cards: SeedDiscoverCard[] = (rows as SeedDiscoverRow[]).map((row) => {
                const p = allProfiles[row.profile_index];
                if (!p) return null;

                const birthYear = new Date().getFullYear() - (p.age ?? 28);
                const birth_date = `${birthYear}-06-15`;
                const stateAbbr = getStateAbbreviation(firstRow.state_name || '');

                return {
                    seedId: row.id,
                    seedProfileIndex: row.profile_index,
                    likeSequencePosition: row.like_sequence_position,
                    user_id: `seed-discover-${row.id}`,
                    display_name: p.name,
                    photos: p.photo ? [p.photo] : [],
                    avatar_url: p.photo || '',
                    bio: p.bio || '',
                    city: p.city || firstRow.city || 'São Paulo',
                    state: stateAbbr,
                    religion: p.religion || firstRow.religion || 'Cristã',
                    occupation: (p as Record<string, unknown>).occupation as string || '',
                    church_frequency: (p as Record<string, unknown>).church_frequency as string || 'Toda semana',
                    about_children: (p as Record<string, unknown>).about_children as string || '',
                    education: (p as Record<string, unknown>).education as string || '',
                    drink: (p as Record<string, unknown>).drink as string || '',
                    smoke: (p as Record<string, unknown>).smoke as string || '',
                    physical_activity: (p as Record<string, unknown>).physical_activity as string || '',
                    languages: (p as Record<string, unknown>).languages as string[] || ['Português'],
                    christian_interests: p.christian_interests || [],
                    looking_for: firstRow.looking_for || 'Relacionamento sério',
                    age: p.age,
                    birth_date,
                    show_distance: false,
                    gender: gender === 'male' ? 'female' : 'male',
                    _isSeedDiscover: true as const,
                };
            }).filter(Boolean) as SeedDiscoverCard[];

            setSeedCards(cards);
            setLoading(false);
        })();
    }, [userId]);

    /**
     * Mark a seed card as swiped and remove it from the local stack.
     * Returns { isMatch: true } when it's position 2 AND action is like/super_like.
     */
    const dismissSeedCard = useCallback(async (
        seedId: string,
        action: 'liked' | 'disliked' | 'super_liked'
    ): Promise<{ isMatch: boolean }> => {
        const card = seedCards.find(c => c.seedId === seedId);
        const isMatch = !!card &&
            card.likeSequencePosition === 2 &&
            (action === 'liked' || action === 'super_liked');

        // Optimistic removal
        setSeedCards(prev => prev.filter(c => c.seedId !== seedId));

        // Persist to DB
        await db
            .from('seed_discover_profiles')
            .update({ status: action, swiped_at: new Date().toISOString() })
            .eq('id', seedId);

        return { isMatch };
    }, [seedCards]);

    return { seedCards, loading, dismissSeedCard };
}
