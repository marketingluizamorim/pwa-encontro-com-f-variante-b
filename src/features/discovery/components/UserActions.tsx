import { useState } from 'react';
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
import { Shield, Ban, AlertTriangle, Loader2 } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Perfil falso', description: 'Fotos ou informações falsas' },
  { value: 'harassment', label: 'Assédio', description: 'Mensagens ofensivas ou persistentes' },
  { value: 'inappropriate', label: 'Conteúdo inapropriado', description: 'Fotos ou textos inadequados' },
  { value: 'scam', label: 'Golpe/Fraude', description: 'Tentativa de extorsão ou golpe' },
  { value: 'underage', label: 'Menor de idade', description: 'Usuário aparenta ser menor' },
  { value: 'other', label: 'Outro', description: 'Outro motivo não listado' },
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
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      toast.success('Denúncia enviada', {
        description: 'Nossa equipe irá analisar e tomar as providências.',
      });

      onOpenChange(false);
      onReported?.();

      // Reset form
      setReason('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Erro ao enviar denúncia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase.from('user_blocks').insert({
        blocker_id: user.id,
        blocked_id: userId,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Usuário já bloqueado');
        } else {
          throw error;
        }
      } else {
        toast.success('Usuário bloqueado', {
          description: 'Você não verá mais este perfil.',
        });
      }

      onOpenChange(false);
      onBlocked?.();
    } catch (err) {
      console.error('Error blocking user:', err);
      toast.error('Erro ao bloquear usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-destructive" />
            Bloquear {userName || 'usuário'}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Ao bloquear este usuário:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Vocês não aparecerão mais um para o outro</li>
              <li>Matches existentes serão desfeitos</li>
              <li>Mensagens anteriores serão ocultadas</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Você pode desbloquear a qualquer momento nas configurações.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlock}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Bloquear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
