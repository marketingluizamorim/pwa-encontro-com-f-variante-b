import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/hooks/useAuth';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { toast } from 'sonner';
import { ChevronLeft, Volume2, VolumeX, Eye, EyeOff, Bell, BellOff, Shield, Trash2, LogOut } from 'lucide-react';

interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  showDistance: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isMuted, toggleMute } = useSoundSettings();
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showOnlineStatus: true,
    showLastActive: true,
    showDistance: true,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedPrivacy = localStorage.getItem(`privacy_settings_${user?.id}`);
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }
    
    const savedNotifications = localStorage.getItem(`notifications_enabled_${user?.id}`);
    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === 'true');
    }
  }, [user?.id]);

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    localStorage.setItem(`privacy_settings_${user?.id}`, JSON.stringify(newSettings));
    toast.success('Configuração atualizada');
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem(`notifications_enabled_${user?.id}`, String(newValue));
    toast.success(newValue ? 'Notificações ativadas' : 'Notificações desativadas');
  };

  const handleDeactivateAccount = async () => {
    setSaving(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Mark profile as inactive
      await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user?.id);
      
      toast.success('Conta desativada. Você pode reativá-la fazendo login novamente.');
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error('Erro ao desativar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container px-4 py-6 space-y-6"
      >
        {/* Sound Settings */}
        <section className="bg-card rounded-xl p-4 border border-border">
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
        <section className="bg-card rounded-xl p-4 border border-border">
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
        <section className="bg-card rounded-xl p-4 border border-border">
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
        </section>

        {/* Account Actions */}
        <section className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
            <i className="ri-user-settings-line text-lg" />
            Conta
          </h2>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </Button>
          
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
    </div>
  );
}
