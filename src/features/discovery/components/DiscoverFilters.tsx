/**
 * DiscoverFilters — bottom sheet custom sem vaul/Drawer.
 *
 * Por que não usar vaul?
 * O vaul Drawer registra listeners de pointer na fase de captura, interferindo
 * com qualquer elemento interativo filho (sliders, selects, switches).
 * Mesmo com workarounds (dismissible=false, data-vaul-no-drag), a biblioteca
 * ainda causa comportamentos inesperados (movimento do modal, drag interceptado).
 *
 * Solução: Bottom Sheet 100% nativo via createPortal + CSS.
 * - Backdrop: fixed overlay que fecha ao clicar
 * - Sheet: fixed bottom-0, animação CSS slide-up
 * - Scroll: overflow-y-auto nativo no container de conteúdo
 * - Zero interceptação de eventos → sliders funcionam perfeitamente
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RangeSlider, SingleSlider } from '@/components/ui/range-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { BRAZIL_CITIES, BRAZIL_STATES } from '@/config/brazil-cities';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGateDialog } from './FeatureGateDialog';
import { CheckoutManager } from './CheckoutManager';
import { Lock, MapPin, Heart, Target, Filter, Sliders } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DiscoverFiltersState {
  minAge: number;
  maxAge: number;
  state: string;
  city: string;
  religion: string;
  churchFrequency: string;
  lookingFor: string;
  christianInterests: string[];
  hasPhotos: boolean;
  isVerified: boolean;
  onlineRecently: boolean;
  maxDistance: number;
}

interface DiscoverFiltersProps {
  filters: DiscoverFiltersState;
  onFiltersChange: (filters: DiscoverFiltersState) => void;
  onApply: (filters?: DiscoverFiltersState) => void;
  triggerId?: string;
  triggerClassName?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RELIGIONS = [
  { value: '', label: 'Todas' },
  { value: 'Evangélica', label: 'Evangélica' },
  { value: 'Católica', label: 'Católica' },
  { value: 'Protestante', label: 'Protestante' },
  { value: 'Outra', label: 'Outra' },
];

const CHURCH_FREQUENCIES = [
  { value: '', label: 'Qualquer frequência' },
  { value: 'Sim, sou ativo(a)', label: 'Sim, sou ativo(a)' },
  { value: 'Às vezes', label: 'Às vezes' },
  { value: 'Raramente', label: 'Raramente' },
  { value: 'Não frequento', label: 'Não frequento' },
];

const LOOKING_FOR_OPTIONS = [
  { value: '', label: 'Todos objetivos' },
  { value: 'Relacionamento sério', label: 'Relacionamento sério' },
  { value: 'Construir uma família', label: 'Construir uma família' },
  { value: 'Conhecer pessoas novas', label: 'Conhecer pessoas novas' },
  { value: 'Amizade verdadeira', label: 'Amizade verdadeira' },
];

const CHRISTIAN_INTERESTS = [
  'Bíblia', 'Oração', 'Adoração', 'Família',
  'Comunhão', 'Louvor', 'Santidade', 'Evangelismo',
  'Missões', 'Teatro', 'Instrumental', 'Devocional',
  'Jejum', 'Discipulado', 'Respeito', 'Propósito',
  'Leitura', 'Estudos', 'Pregações', 'Podcasts',
  'Chamado', 'Retiro', 'Acampamento', 'Viagem',
  'Voluntariado', 'Profético', 'Dança', 'Coral',
  'Teologia', 'Edificação', 'Maturidade', 'Composição',
  'Pastoreio', 'ServiçoSocial', 'Companheirismo',
];

const DEFAULT_FILTERS: DiscoverFiltersState = {
  minAge: 18,
  maxAge: 60,
  state: '',
  city: '',
  religion: '',
  churchFrequency: '',
  lookingFor: '',
  christianInterests: [],
  hasPhotos: false,
  isVerified: false,
  onlineRecently: false,
  maxDistance: 100,
};

// ── UpgradeInfo type ──────────────────────────────────────────────────────────

interface UpgradeInfo {
  title: string;
  description: string;
  features: string[];
  planNeeded: 'bronze' | 'silver' | 'gold';
  icon?: React.ReactNode;
  price: number;
  planId: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// FilterSheet — bottom sheet 100% nativo
// ══════════════════════════════════════════════════════════════════════════════

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function FilterSheet({ open, onClose, children }: FilterSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      style={{ contain: 'strict' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 200ms ease' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 inset-x-0 bg-background rounded-t-3xl flex flex-col"
        style={{
          height: '75dvh',
          maxHeight: '75dvh',
          animation: 'slideUp 280ms cubic-bezier(0.32, 0.72, 0, 1)',
          overflow: 'hidden',
          touchAction: 'pan-y',          // permite scroll vertical, bloqueia horizontal
          overscrollBehavior: 'contain', // sem rubber-band fora do sheet
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-componentes internos
// ══════════════════════════════════════════════════════════════════════════════

function SectionHeader({
  title,
  icon,
  showUpgrade,
  onUpgradeClick,
}: {
  title: string;
  icon: string;
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <i className={cn(icon, 'text-primary text-base')} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {showUpgrade && (
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-500 active:scale-95 transition-all"
        >
          <Lock className="w-2.5 h-2.5" />
          Upgrade
        </button>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <i className={cn(icon, 'text-muted-foreground')} />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DiscoverFilters — componente principal
// ══════════════════════════════════════════════════════════════════════════════

export default function DiscoverFilters({
  filters,
  onFiltersChange,
  onApply,
  triggerId,
  triggerClassName,
}: DiscoverFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DiscoverFiltersState>(filters);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const { data: subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeData, setUpgradeData] = useState<UpgradeInfo>({
    title: '', description: '', features: [], planNeeded: 'silver',
    icon: null, price: 0, planId: '',
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{
    id: string; name: string; price: number;
  } | null>(null);

  const isBronze = subscription?.tier === 'bronze' || subscription?.tier === 'none';
  const isSilver = subscription?.tier === 'silver';
  const isGold = subscription?.tier === 'gold';

  // Sync local state when sheet opens
  const handleOpen = () => {
    setLocalFilters(filters);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleApply = () => {
    if (isBronze) {
      setUpgradeData({
        title: 'Plano Prata',
        description: 'Migre para o Plano Prata para filtrar perfis por cidade, idade, religião e muito mais!',
        features: ['Ver quem curtiu você', 'Curtidas ilimitadas', 'Filtro por cidade / região', 'Fazer chamadas de voz e vídeo'],
        planNeeded: 'silver', icon: <Sliders className="w-8 h-8" />, price: 29.90, planId: 'silver',
      });
      setShowUpgradeDialog(true);
      return;
    }
    onFiltersChange(localFilters);
    onApply(localFilters);
    handleClose();
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  const showUpgradeFor = (info: UpgradeInfo) => {
    setUpgradeData(info);
    setShowUpgradeDialog(true);
  };

  const handleAdvancedClick = (featureName: string, icon: React.ReactNode) => {
    if (isBronze) {
      showUpgradeFor({
        title: 'Plano Prata',
        description: 'Migre para o Plano Prata para desbloquear todos os filtros!',
        features: ['Ver quem curtiu você', 'Curtidas ilimitadas', 'Filtro por cidade / região'],
        planNeeded: 'silver', icon: <Sliders className="w-8 h-8" />, price: 29.90, planId: 'silver',
      });
      return;
    }
    if (isSilver) {
      showUpgradeFor({
        title: 'Plano Ouro',
        description: `O recurso "${featureName}" é exclusivo para membros do Plano Ouro.`,
        features: ['Todos os recursos do Plano Prata', 'Filtros avançados completos', 'Perfil em destaque'],
        planNeeded: 'gold', icon, price: 49.90, planId: 'gold',
      });
    }
  };

  const countActive = (): number => {
    let n = 0;
    if (filters.minAge !== 18 || filters.maxAge !== 60) n++;
    if (filters.state) n++;
    if (filters.city) n++;
    if (filters.maxDistance !== 100) n++;
    if (filters.religion) n++;
    if (filters.churchFrequency) n++;
    if (filters.lookingFor) n++;
    if (filters.christianInterests?.length > 0) n++;
    if (filters.hasPhotos) n++;
    if (filters.isVerified) n++;
    if (filters.onlineRecently) n++;
    return n;
  };

  const activeCount = countActive();

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="icon"
        id={triggerId}
        className={cn('relative', triggerClassName)}
        onClick={handleOpen}
      >
        <i className="ri-equalizer-line text-lg" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Filter Sheet */}
      <FilterSheet open={open} onClose={handleClose}>
        {/* Header — fixo */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Filtros Avançados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount > 0
                ? `${activeCount} ${activeCount === 1 ? 'filtro ativo' : 'filtros ativos'} · Deslize para ver mais`
                : 'Deslize para ver mais'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Scroll area — cresce, scrollável */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div className="px-5 py-4 space-y-5">

            {/* ── Faixa de Idade ── */}
            <div>
              <SectionHeader
                title="Faixa de idade"
                icon="ri-user-line"
                showUpgrade={!isGold}
                onUpgradeClick={() => showUpgradeFor({
                  title: 'Plano Ouro',
                  description: 'O filtro de idade é exclusivo para membros do Plano Ouro.',
                  features: ['Filtros avançados completos', 'Perfil em destaque', 'Enviar mensagem direta'],
                  planNeeded: 'gold', icon: <Filter className="w-8 h-8" />, price: 49.90, planId: 'gold',
                })}
              />
              <div className={cn('transition-opacity', !isGold && 'opacity-40 grayscale pointer-events-none')}>
                <RangeSlider
                  values={[localFilters.minAge, localFilters.maxAge]}
                  onChange={(v) => setLocalFilters(p => ({ ...p, minAge: v[0], maxAge: v[1] }))}
                  min={18}
                  max={80}
                  step={1}
                  unit=" anos"
                />
              </div>
            </div>

            <Separator />

            {/* ── Distância máxima ── */}
            <div>
              <SectionHeader
                title="Distância máxima"
                icon="ri-road-map-line"
                showUpgrade={!isGold}
                onUpgradeClick={() => showUpgradeFor({
                  title: 'Plano Ouro',
                  description: 'O ajuste de distância é recurso exclusivo para membros do Plano Ouro.',
                  features: ['Filtro por distância física', 'Prioridade na fila (Boost)', 'Enviar Direct sem Match'],
                  planNeeded: 'gold', icon: <MapPin className="w-8 h-8" />, price: 49.90, planId: 'gold',
                })}
              />
              <div className={cn('transition-opacity', !isGold && 'opacity-40 grayscale pointer-events-none')}>
                <SingleSlider
                  value={localFilters.maxDistance}
                  onChange={(v) => setLocalFilters(p => ({ ...p, maxDistance: v }))}
                  min={1}
                  max={100}
                  step={1}
                  unit=" km"
                />
              </div>
            </div>

            <Separator />

            {/* ── Localização ── */}
            <div>
              <SectionHeader
                title="Localização"
                icon="ri-map-pin-line"
                showUpgrade={isBronze}
                onUpgradeClick={() => showUpgradeFor({
                  title: 'Plano Prata',
                  description: 'Migre para o Plano Prata para filtrar por Cidade e Estado!',
                  features: ['Filtro por cidade / região', 'Curtidas ilimitadas'],
                  planNeeded: 'silver', icon: <MapPin className="w-8 h-8" />, price: 29.90, planId: 'silver',
                })}
              />
              <div className={cn('grid grid-cols-2 gap-3', isBronze && 'opacity-40 grayscale pointer-events-none')}>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Estado</Label>
                  <Select
                    value={localFilters.state || 'all'}
                    onValueChange={(v) => setLocalFilters(p => ({ ...p, state: v === 'all' ? '' : v, city: '' }))}
                  >
                    <SelectTrigger className={cn('h-10', localFilters.state && 'border-primary/40 font-medium')}>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] bg-background">
                      <SelectItem value="all">Todos os estados</SelectItem>
                      {BRAZIL_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Cidade</Label>
                  <Select
                    value={localFilters.city || 'all'}
                    onValueChange={(v) => setLocalFilters(p => ({ ...p, city: v === 'all' ? '' : v }))}
                    disabled={!localFilters.state}
                  >
                    <SelectTrigger className={cn('h-10', localFilters.city && 'border-primary/40 font-medium')}>
                      <SelectValue placeholder={!localFilters.state ? 'Selecione um estado' : 'Todas'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] bg-background">
                      <SelectItem value="all">Todas</SelectItem>
                      {localFilters.state && BRAZIL_CITIES[localFilters.state]?.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Fé e Religião ── */}
            <div>
              <SectionHeader
                title="Fé e Religião"
                icon="ri-heart-3-line"
                showUpgrade={!isGold}
                onUpgradeClick={() => handleAdvancedClick('Fé e Religião', <Heart className="w-8 h-8" />)}
              />
              <div className={cn('space-y-3', !isGold && 'opacity-40 grayscale pointer-events-none')}>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Religião</Label>
                  <Select
                    value={localFilters.religion || 'all'}
                    onValueChange={(v) => setLocalFilters(p => ({ ...p, religion: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger className={cn('h-10', localFilters.religion && 'border-primary/40 font-medium')}>
                      <SelectValue placeholder="Todas as religiões" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] bg-background">
                      {RELIGIONS.map(r => <SelectItem key={r.value || 'all'} value={r.value || 'all'}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Frequência na Igreja</Label>
                  <Select
                    value={localFilters.churchFrequency || 'all'}
                    onValueChange={(v) => setLocalFilters(p => ({ ...p, churchFrequency: v === 'all' ? '' : v }))}
                  >
                    <SelectTrigger className={cn('h-10', localFilters.churchFrequency && 'border-primary/40 font-medium')}>
                      <SelectValue placeholder="Qualquer frequência" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] bg-background">
                      {CHURCH_FREQUENCIES.map(f => <SelectItem key={f.value || 'all'} value={f.value || 'all'}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Interesses cristãos */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Interesses cristãos</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(showAllInterests && isGold ? CHRISTIAN_INTERESTS : CHRISTIAN_INTERESTS.slice(0, 16)).map(interest => {
                      const sel = localFilters.christianInterests?.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => {
                            const cur = localFilters.christianInterests || [];
                            setLocalFilters(p => ({
                              ...p,
                              christianInterests: sel ? cur.filter(i => i !== interest) : [...cur, interest],
                            }));
                          }}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all active:scale-95',
                            sel
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-muted/50 border-input text-muted-foreground',
                          )}
                        >
                          {interest}
                        </button>
                      );
                    })}
                    {!showAllInterests && isGold && (
                      <button
                        onClick={() => setShowAllInterests(true)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium border bg-primary/10 border-primary/20 text-primary flex items-center gap-1"
                      >
                        <i className="ri-add-line" /> Mais
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Relacionamento ── */}
            <div>
              <SectionHeader
                title="Relacionamento"
                icon="ri-search-heart-line"
                showUpgrade={!isGold}
                onUpgradeClick={() => handleAdvancedClick('Relacionamento', <Target className="w-8 h-8" />)}
              />
              <div className={cn('transition-opacity', !isGold && 'opacity-40 grayscale pointer-events-none')}>
                <Select
                  value={localFilters.lookingFor || 'all'}
                  onValueChange={(v) => setLocalFilters(p => ({ ...p, lookingFor: v === 'all' ? '' : v }))}
                >
                  <SelectTrigger className={cn('h-10', localFilters.lookingFor && 'border-primary/40 font-medium')}>
                    <SelectValue placeholder="Selecione o que busca" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {LOOKING_FOR_OPTIONS.map(o => <SelectItem key={o.value || 'all'} value={o.value || 'all'}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ── Filtros rápidos ── */}
            <div>
              <SectionHeader
                title="Filtros rápidos"
                icon="ri-filter-3-line"
                showUpgrade={!isGold}
                onUpgradeClick={() => handleAdvancedClick('Filtros Rápidos', <Filter className="w-8 h-8" />)}
              />
              <div className={cn('rounded-xl bg-muted/50 px-3 divide-y divide-border/50', !isGold && 'opacity-40 grayscale pointer-events-none')}>
                <ToggleRow
                  icon="ri-time-line"
                  label="Online recentemente"
                  description="Ativos nas últimas 24 horas"
                  checked={localFilters.onlineRecently}
                  onCheckedChange={(v) => setLocalFilters(p => ({ ...p, onlineRecently: v }))}
                />
                <ToggleRow
                  icon="ri-image-line"
                  label="Com fotos"
                  description="Mostrar apenas perfis com fotos"
                  checked={localFilters.hasPhotos}
                  onCheckedChange={(v) => setLocalFilters(p => ({ ...p, hasPhotos: v }))}
                />
              </div>
            </div>

            {/* Espaço extra no bottom para os botões */}
            <div className="h-2" />
          </div>
        </div>

        {/* Footer — fixo */}
        <div
          className="shrink-0 border-t border-border/50 bg-background"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex gap-3 px-5 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <i className="ri-refresh-line mr-2" />
              Limpar
            </Button>
            <Button onClick={handleApply} className="flex-1 gradient-button">
              <i className="ri-check-line mr-2" />
              Aplicar
            </Button>
          </div>
        </div>
      </FilterSheet>

      {/* Dialogs de upgrade (fora do sheet, no DOM raiz) */}
      <FeatureGateDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title={upgradeData.title}
        description={upgradeData.description}
        features={upgradeData.features}
        icon={upgradeData.icon}
        price={upgradeData.price}
        onUpgrade={(planData) => {
          setSelectedCheckoutPlan({ id: planData.id, name: planData.name, price: planData.price });
          setShowUpgradeDialog(false);
          setShowCheckoutManager(true);
        }}
      />

      {showCheckoutManager && selectedCheckoutPlan && (
        <CheckoutManager
          key={`filters-checkout-${selectedCheckoutPlan.id}`}
          open={showCheckoutManager}
          onOpenChange={(o) => {
            setShowCheckoutManager(o);
            if (!o) setTimeout(() => {
              setSelectedCheckoutPlan(null);
              setShowUpgradeDialog(true);
            }, 50);
          }}
          planId={selectedCheckoutPlan.id}
          planPrice={selectedCheckoutPlan.price}
          planName={selectedCheckoutPlan.name}
        />
      )}
    </>
  );
}
