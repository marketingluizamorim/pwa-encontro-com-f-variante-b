import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export type AuditAction =
    | 'view_financials'
    | 'view_reports'
    | 'view_user_details'
    | 'suspend_user'
    | 'delete_report'
    | 'update_subscription';

export type AuditResource =
    | 'purchases'
    | 'user_reports'
    | 'profiles'
    | 'user_subscriptions';

export function useAdminAuditLog() {
    const { user } = useAuth();

    const logAction = async (
        action: AuditAction,
        resource: AuditResource,
        targetId?: string,
        details: Record<string, any> = {}
    ) => {
        if (!user) return;

        try {
            // Usamos any aqui porque os tipos do Supabase demoram a atualizar localmente 
            // após a criação de uma nova tabela via migração.
            const { error } = await (supabase.from('admin_audit_logs' as any) as any).insert({
                admin_id: user.id,
                action,
                resource,
                target_id: targetId,
                details,
            });

            if (error) {
                console.error('Failed to create audit log:', error);
            }
        } catch (err) {
            console.error('Error in useAdminAuditLog:', err);
        }
    };

    return { logAction };
}
