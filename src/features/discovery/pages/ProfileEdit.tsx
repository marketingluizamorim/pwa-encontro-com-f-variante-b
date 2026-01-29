import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/features/discovery/components/PhotoUpload';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';

const RELIGIONS = [
  'Católica',
  'Evangélica',
  'Protestante',
  'Espírita',
  'Adventista',
  'Testemunha de Jeová',
  'Outra',
];

const CHURCH_FREQUENCIES = [
  'Todo domingo',
  'Algumas vezes por mês',
  'Raramente',
  'Só em ocasiões especiais',
];

const LOOKING_FOR = [
  'Homens',
  'Mulheres',
  'Ambos',
];

interface ProfileData {
  display_name: string;
  bio: string;
  birth_date: string;
  city: string;
  state: string;
  religion: string;
  church_frequency: string;
  looking_for: string;
  photos: string[];
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: '',
    bio: '',
    birth_date: '',
    city: '',
    state: '',
    religion: '',
    church_frequency: '',
    looking_for: '',
    photos: [],
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        birth_date: data.birth_date || '',
        city: data.city || '',
        state: data.state || '',
        religion: data.religion || '',
        church_frequency: data.church_frequency || '',
        looking_for: data.looking_for || '',
        photos: data.photos || [],
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profile.display_name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          birth_date: profile.birth_date || null,
          city: profile.city,
          state: profile.state,
          religion: profile.religion,
          church_frequency: profile.church_frequency,
          looking_for: profile.looking_for,
          photos: profile.photos,
          avatar_url: profile.photos[0] || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado!');
      navigate('/app/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-display font-semibold text-lg text-foreground">Editar Perfil</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container px-4 py-6 space-y-6 pb-20"
      >
        {/* Photo Upload */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <PhotoUpload
            photos={profile.photos}
            onPhotosChange={(photos) => updateField('photos', photos)}
          />
        </section>

        {/* Basic Info */}
        <section className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h2 className="font-display font-semibold text-foreground">Informações Básicas</h2>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
            <Input
              value={profile.display_name}
              onChange={(e) => updateField('display_name', e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Data de nascimento</label>
            <Input
              type="date"
              value={profile.birth_date}
              onChange={(e) => updateField('birth_date', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cidade</label>
              <Input
                value={profile.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Sua cidade"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Estado</label>
              <Input
                value={profile.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Sobre você</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={4}
            />
          </div>
        </section>

        {/* Faith Info */}
        <section className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h2 className="font-display font-semibold text-foreground">Fé e Religião</h2>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Religião</label>
            <Select value={profile.religion} onValueChange={(v) => updateField('religion', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua religião" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Frequência na igreja</label>
            <Select value={profile.church_frequency} onValueChange={(v) => updateField('church_frequency', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Com que frequência você vai à igreja?" />
              </SelectTrigger>
              <SelectContent>
                {CHURCH_FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h2 className="font-display font-semibold text-foreground">Preferências</h2>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Procurando</label>
            <Select value={profile.looking_for} onValueChange={(v) => updateField('looking_for', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Quem você está procurando?" />
              </SelectTrigger>
              <SelectContent>
                {LOOKING_FOR.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
