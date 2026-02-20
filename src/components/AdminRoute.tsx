import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (!user) {
            setIsAdmin(false);
            return;
        }
        supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single()
            .then(({ data }) => setIsAdmin(!!data));
    }, [user]);

    if (authLoading || isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
                <Loader2 className="w-8 h-8 animate-spin text-white/30" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
