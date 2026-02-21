import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Shield, Ban, AlertTriangle, Loader2, HeartCrack } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Perfil falso', description: 'Fotos ou informações falsas' },
  { value: 'inappropriate', label: 'Assédio ou conteúdo inadequado', description: 'Mensagens ofensivas ou conteúdo impróprio' },
  { value: 'scam', label: 'Golpe ou fraude', description: 'Tentativa de extorsão ou fraude' },
  { value: 'other', label: 'Outro', description: 'Qualquer outro motivo' },
];

const reportSchema = z.object({
  reason: z.string().min(1, 'Selecione um motivo'),
  description: z.string().max(500, 'Máximo de 500 caracteres').optional(),
});

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
  onReported?: () => void;
}

export function ReportDialog({ open, onOpenChange, userId, userName, onReported }: ReportDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    // Validate input
    const result = reportSchema.safeParse({ reason, description });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Dados inválidos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error: insertError } = await supabase.from('user_reports').insert({
        reporter_id: user.id,
        reported_id: userId,
        reason,
        description: description.trim() || null,
      });

      if (insertError) throw insertError;

      // Send email notification to support team (production only)
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const emailResult = await supabase.functions.invoke('send-report-email', {
              body: {
                reporterId: user.id,
                reportedId: userId,
                reportedName: userName || 'Usuário',
                reason,
                description: description.trim() || undefined,
              },
            });
            if (emailResult.error) {
              console.error('Erro ao enviar email de denúncia:', emailResult.error);
            }
          }
        } catch (emailError) {
          // Não impede o fluxo principal se o email falhar
          console.error('Falha ao enviar email de denúncia:', emailError);
        }
      }

      // Automatically block the reported user
      const { error: blockError } = await supabase.from('user_blocks').insert({
        blocker_id: user.id,
        blocked_id: userId,
      });

      if (blockError) {
        console.error('❌ Error blocking user:', blockError);
      }

      // Invalidate queries to update UI in real-time
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Show success state
      setShowSuccess(true);

      onOpenChange(false);
      onReported?.();

      // Reset form
      setReason('');
      setDescription('');
    } catch (err) {
      console.error('❌ Error submitting report:', err);
      toast.error('Erro ao enviar denúncia', { style: { marginTop: '50px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border-white/10 bg-slate-900 shadow-2xl scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Denunciar {userName || 'usuário'}
            </DialogTitle>
            <DialogDescription>
              Sua denúncia é anônima. Nossa equipe irá analisar o caso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Motivo da denúncia</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {REPORT_REASONS.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setReason(item.value)}
                  >
                    <RadioGroupItem value={item.value} id={item.value} className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor={item.value} className="text-sm font-medium cursor-pointer">
                        {item.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detalhes adicionais (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o ocorrido..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar Denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="rounded-3xl border-white/10 bg-slate-900 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Denúncia Enviada com Sucesso!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p className="text-base">Sua denúncia foi registrada e as seguintes ações foram tomadas:</p>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Denúncia enviada para nossa equipe de moderação</li>
                <li>Usuário bloqueado automaticamente</li>
                <li>Você não verá mais este perfil</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Nossa equipe irá analisar e tomar as providências necessárias.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                onReported?.();
                navigate('/app/chat');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
  onBlocked?: () => void;
}

export function BlockDialog({ open, onOpenChange, userId, userName, onBlocked }: BlockDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // 1. Bloquear usuário
      const { error } = await supabase.from('user_blocks').insert({
        blocker_id: user.id,
        blocked_id: userId,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Usuário já bloqueado', { style: { marginTop: '50px' } });
        } else {
          throw error;
        }
      } else {
        toast.success('Usuário bloqueado', {
          description: 'Você não verá mais este perfil.',
          style: { marginTop: '50px' }
        });
      }

      // 2. Desativar Match existente (Se houver)
      // Buscamos o match ativo entre os dois usuários
      const { data: matchData } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .eq('is_active', true)
        .maybeSingle();

      if (matchData) {
        await supabase
          .from('matches')
          .update({ is_active: false } as { is_active: boolean })
          .eq('id', matchData.id);
      }

      // Invalidate queries to update UI in real-time
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      onOpenChange(false);
      onBlocked?.();
    } catch (err) {
      console.error('Error blocking user:', err);
      toast.error('Erro ao bloquear usuário', { style: { marginTop: '50px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md rounded-3xl border-white/10 bg-slate-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-destructive" />
            Bloquear {userName || 'usuário'}?
          </DialogTitle>
          <DialogDescription className="space-y-2 text-left">
            <p>Ao bloquear este usuário:</p>
            <ul className="list-disc pl-5 space-y-1 text-left">
              <li>Vocês não aparecerão mais um para o outro</li>
              <li>Matches existentes serão desfeitos</li>
              <li>Mensagens anteriores serão ocultadas</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Você pode desbloquear a qualquer momento nas configurações.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleBlock}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Bloquear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserActionsMenuProps {
  userId: string;
  userName?: string;
  onAction?: () => void;
}

export function UserActionsMenu({ userId, userName, onAction }: UserActionsMenuProps) {
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => setShowReport(true)}
          className="justify-start gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
        >
          <AlertTriangle className="w-4 h-4" />
          Denunciar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowBlock(true)}
          className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <Ban className="w-4 h-4" />
          Bloquear
        </Button>
      </div>

      <ReportDialog
        open={showReport}
        onOpenChange={setShowReport}
        userId={userId}
        userName={userName}
        onReported={onAction}
      />

      <BlockDialog
        open={showBlock}
        onOpenChange={setShowBlock}
        userId={userId}
        userName={userName}
        onBlocked={onAction}
      />
    </>
  );
}

interface DeleteConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  onDeleted?: () => void;
}

export function DeleteConversationDialog({ open, onOpenChange, matchId, onDeleted }: DeleteConversationDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // "Excluir" a conversa = Desativar o Match
      const { error } = await supabase
        .from('matches')
        .update({ is_active: false } as { is_active: boolean })
        .eq('id', matchId);

      if (error) throw error;

      // Invalidate queries to update UI in real-time
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });

      toast.success('Conversa excluída', { style: { marginTop: '50px' } });
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Erro ao excluir conversa', { style: { marginTop: '50px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md rounded-3xl border-white/10 bg-slate-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Desfazer Conexão?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. A conversa sumirá da sua lista e vocês perderão a conexão.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Desfazer Conexão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UnmatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  otherUserId: string;
  userName?: string;
  onUnmatched?: () => void;
}

export function UnmatchDialog({ open, onOpenChange, matchId, otherUserId, userName, onUnmatched }: UnmatchDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleUnmatch = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // 1. Desativar o match
      const { error: matchError } = await supabase
        .from('matches')
        .update({ is_active: false } as { is_active: boolean })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // 2. Remover os swipes para que possam se redescobrir futuramente
      await supabase
        .from('swipes')
        .delete()
        .or(`and(swiper_id.eq.${user.id},swiped_id.eq.${otherUserId}),and(swiper_id.eq.${otherUserId},swiped_id.eq.${user.id})`);

      // 3. Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['likes', user.id] });

      toast.success('Match desfeito', {
        description: 'Vocês não são mais um match.',
        style: { marginTop: '50px' }
      });

      onOpenChange(false);
      onUnmatched?.();
      navigate('/app/chat');
    } catch (err) {
      console.error('Error unmatching:', err);
      toast.error('Erro ao desfazer match', { style: { marginTop: '50px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md rounded-3xl border-white/10 bg-slate-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartCrack className="w-5 h-5 text-destructive" />
            Desfazer match com {userName || 'este usuário'}?
          </DialogTitle>
          <DialogDescription className="space-y-2 text-left">
            <p>Ao desfazer o match:</p>
            <ul className="list-disc pl-5 space-y-1 text-left">
              <li>Vocês deixarão de ser um match</li>
              <li>A conversa será removida da sua lista</li>
              <li>Vocês poderão se redescobrir no futuro</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUnmatch}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Desfazer Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
