import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { toast } from 'sonner';
import { ChevronLeft, Volume2, VolumeX, Eye, EyeOff, Bell, BellOff, Shield, Trash2, LogOut, Mail, Key, Lock } from 'lucide-react';

interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  showDistance: boolean;
  showReadReceipts: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isMuted, toggleMute } = useSoundSettings();

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showOnlineStatus: true,
    showLastActive: true,
    showDistance: true,
    showReadReceipts: true,
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (!user) return;

    const savedPrivacy = localStorage.getItem(`privacy_settings_${user.id}`);
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }

    const savedNotifications = localStorage.getItem(`notifications_enabled_${user.id}`);
    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === 'true');
    }
  }, [user?.id]);

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    // 1. Optimistic Update
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    localStorage.setItem(`privacy_settings_${user?.id}`, JSON.stringify(newSettings));

    // 2. Persist to Supabase
    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Map frontend keys to DB columns
      const dbKeyMap: Record<keyof PrivacySettings, string> = {
        showOnlineStatus: 'show_online_status',
        showLastActive: 'show_last_active',
        showDistance: 'show_distance',
        showReadReceipts: 'show_read_receipts'
      };

      const { error } = await supabase
        .from('profiles')
        .update({ [dbKeyMap[key]]: value })
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Configuração salva', { style: { marginTop: '50px' } });
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Erro ao salvar no servidor', { style: { marginTop: '50px' } });
    }
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem(`notifications_enabled_${user?.id}`, String(newValue));
    toast.success(newValue ? 'Notificações ativadas' : 'Notificações desativadas', { style: { marginTop: '50px' } });
  };

  const handleDeactivateAccount = async () => {
    setSaving(true);
    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

      // Mark profile as inactive
      await supabaseRuntime
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      toast.success('Conta desativada. Você pode reativá-la fazendo login novamente.', { style: { marginTop: '50px' } });
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error('Erro ao desativar conta', { style: { marginTop: '50px' } });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres', { style: { marginTop: '50px' } });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem', { style: { marginTop: '50px' } });
      return;
    }

    setChangingPassword(true);
    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!', { style: { marginTop: '50px' } });
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente';
      toast.error('Erro ao atualizar senha: ' + errorMessage, { style: { marginTop: '50px' } });
    } finally {
      setChangingPassword(false);
    }
  };

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    checked,
    onCheckedChange,
    iconColor = 'text-primary'
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    iconColor?: string;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
        <div className="container flex h-14 items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display font-semibold text-lg text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container px-4 py-6 space-y-6 pb-24"
        >
          {/* Profile & Security */}
          <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-4">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Perfil & Segurança
            </h2>

            <div className="space-y-4">
              {/* Read-only Email Row */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground/60">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">E-mail da conta</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground font-mono">
                  VERIFICADO
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Change Password Dialog */}
              <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-lg transition-colors group">
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-0.5 text-muted-foreground/60 group-hover:text-primary transition-colors">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Alterar Senha</p>
                        <p className="text-xs text-muted-foreground">Crie uma nova credencial de acesso</p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-muted-foreground" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[90vw] max-w-sm rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Alterar Senha</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sua nova senha deve conter no mínimo 6 caracteres.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Nova Senha</p>
                      <Input
                        type="password"
                        placeholder="••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Confirmar Nova Senha</p>
                      <Input
                        type="password"
                        placeholder="••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter className="flex flex-col gap-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={changingPassword || !newPassword}
                      className="w-full gradient-button h-11 rounded-xl"
                    >
                      {changingPassword ? 'Atualizando...' : 'Confirmar Alteração'}
                    </Button>
                    <AlertDialogCancel className="w-full h-11 rounded-xl border-none text-muted-foreground hover:bg-muted">
                      Agora não
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
          {/* Sound Settings */}
          <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10">
            <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              Sons
            </h2>
            <SettingRow
              icon={isMuted ? VolumeX : Volume2}
              title="Sons de notificação"
              description="Tocar sons ao receber mensagens e matches"
              checked={!isMuted}
              onCheckedChange={() => toggleMute()}
            />
          </section>

          {/* Notification Settings */}
          <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10">
            <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </h2>
            <SettingRow
              icon={notificationsEnabled ? Bell : BellOff}
              title="Notificações push"
              description="Receber alertas de novas mensagens e matches"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </section>

          {/* Privacy Settings */}
          <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10">
            <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacidade
            </h2>

            <SettingRow
              icon={privacySettings.showOnlineStatus ? Eye : EyeOff}
              title="Mostrar status online"
              description="Permitir que outros vejam quando você está online"
              checked={privacySettings.showOnlineStatus}
              onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
            />

            <Separator />

            <SettingRow
              icon={privacySettings.showLastActive ? Eye : EyeOff}
              title="Mostrar última atividade"
              description="Exibir quando você esteve online pela última vez"
              checked={privacySettings.showLastActive}
              onCheckedChange={(checked) => updatePrivacySetting('showLastActive', checked)}
            />

            <Separator />

            <SettingRow
              icon={privacySettings.showDistance ? Eye : EyeOff}
              title="Mostrar distância"
              description="Permitir que outros vejam sua distância aproximada"
              checked={privacySettings.showDistance}
              onCheckedChange={(checked) => updatePrivacySetting('showDistance', checked)}
            />

            <Separator />

            <SettingRow
              icon={privacySettings.showReadReceipts ? Eye : EyeOff}
              title="Confirmação de leitura"
              description="Permitir que outros saibam quando você visualizou a mensagem"
              checked={privacySettings.showReadReceipts}
              onCheckedChange={(checked) => updatePrivacySetting('showReadReceipts', checked)}
            />
          </section>

          {/* Account Actions */}
          <section className="bg-card dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border dark:border-white/10 space-y-3">
            <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <i className="ri-user-settings-line text-lg" />
              Conta
            </h2>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você precisará de suas credenciais para entrar novamente. Tem certeza que deseja sair?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Sair
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                  Desativar minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desativar conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Seu perfil ficará invisível para outros usuários. Você pode reativar sua conta
                    fazendo login novamente. Seus dados serão mantidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeactivateAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={saving}
                  >
                    {saving ? 'Desativando...' : 'Desativar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>

          {/* App Info */}
          <div className="text-center text-muted-foreground text-sm py-4">
            <p>Encontro com Fé</p>
            <p className="text-xs mt-1">Versão 1.0.0</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
