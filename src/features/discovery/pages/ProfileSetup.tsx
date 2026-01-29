import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

type Step = 'basics' | 'faith' | 'photos' | 'complete';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const RELIGIONS = ['Católica', 'Evangélica', 'Cristã', 'Outra'];

const CHURCH_FREQUENCIES = [
  'Toda semana',
  'Algumas vezes por mês',
  'Ocasionalmente',
  'Raramente',
];

const LOOKING_FOR = [
  'Namoro sério',
  'Casamento',
  'Amizade primeiro',
  'Ainda descobrindo',
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);

  // Form data
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [religion, setReligion] = useState('');
  const [churchFrequency, setChurchFrequency] = useState('');
  const [lookingFor, setLookingFor] = useState('');

  const handleNext = () => {
    if (step === 'basics') {
      if (!birthDate || !gender || !state) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      setStep('faith');
    } else if (step === 'faith') {
      if (!religion) {
        toast.error('Por favor, selecione sua religião');
        return;
      }
      setStep('photos');
    } else if (step === 'photos') {
      handleSave();
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase
        .from('profiles')
        .update({
          birth_date: birthDate,
          gender,
          city,
          state,
          bio,
          religion,
          church_frequency: churchFrequency,
          looking_for: lookingFor,
          is_profile_complete: true,
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setStep('complete');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'basics':
        return (
          <motion.div
            key="basics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold">Informações Básicas</h1>
              <p className="text-muted-foreground">Conte um pouco sobre você</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data de Nascimento *</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gênero *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male', label: 'Homem', icon: 'ri-men-line' },
                    { value: 'female', label: 'Mulher', icon: 'ri-women-line' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value as 'male' | 'female')}
                      className={`p-4 rounded-xl border-2 transition-all ${gender === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <i className={`${option.icon} text-2xl mb-1`} />
                      <p className="font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cidade</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sobre você</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você, seus hobbies e o que te faz feliz..."
                  rows={4}
                />
              </div>
            </div>
          </motion.div>
        );

      case 'faith':
        return (
          <motion.div
            key="faith"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold">Sua Fé</h1>
              <p className="text-muted-foreground">Ajude-nos a encontrar alguém compatível</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Religião *</label>
                <div className="grid grid-cols-2 gap-3">
                  {RELIGIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReligion(r)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${religion === r
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <p className="font-medium">{r}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Frequência na igreja</label>
                <div className="space-y-2">
                  {CHURCH_FREQUENCIES.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setChurchFrequency(freq)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${churchFrequency === freq
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">O que você busca?</label>
                <div className="grid grid-cols-2 gap-3">
                  {LOOKING_FOR.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLookingFor(option)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${lookingFor === option
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'photos':
        return (
          <motion.div
            key="photos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold">Suas Fotos</h1>
              <p className="text-muted-foreground">Adicione fotos para completar seu perfil</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`aspect-[3/4] rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${i === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                >
                  <div className="text-center">
                    <i className="ri-add-line text-2xl text-muted-foreground" />
                    {i === 0 && <p className="text-xs text-muted-foreground mt-1">Foto principal</p>}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Você poderá adicionar fotos depois nas configurações do perfil
            </p>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 rounded-full gradient-button flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-4xl text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Perfil Criado!</h1>
            <p className="text-muted-foreground mb-8">
              Agora você pode começar a encontrar pessoas compatíveis
            </p>
            <Button
              onClick={() => navigate('/app/discover')}
              className="gradient-button text-white px-8"
            >
              Começar a Descobrir
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Progress */}
        {step !== 'complete' && (
          <div className="flex gap-2 mb-8">
            {['basics', 'faith', 'photos'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${['basics', 'faith', 'photos'].indexOf(step) >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                  }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Navigation */}
        {step !== 'complete' && (
          <div className="flex gap-3 mt-8">
            {step !== 'basics' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'faith') setStep('basics');
                  else if (step === 'photos') setStep('faith');
                }}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 gradient-button text-white"
            >
              {saving ? (
                <i className="ri-loader-4-line animate-spin mr-2" />
              ) : null}
              {step === 'photos' ? 'Finalizar' : 'Continuar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
