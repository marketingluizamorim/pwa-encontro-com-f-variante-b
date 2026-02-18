import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { BRAZIL_CITIES, BRAZIL_STATES } from '@/config/brazil-cities';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGateDialog } from './FeatureGateDialog';
import { CheckoutManager } from './CheckoutManager';
import { Lock, MapPin, Heart, Target, Filter, Sliders } from 'lucide-react';

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

const CHRISTIAN_INTERESTS_OPTIONS = [
  'Bíblia', 'Oração', 'Adoração', 'Família',
  'Comunhão', 'Louvor', 'Santidade', 'Evangelismo',
  'Missões', 'Teatro', 'Instrumental', 'Devocional',
  'Jejum', 'Discipulado', 'Respeito', 'Propósito',
  'Leitura', 'Estudos', 'Pregações', 'Podcasts',
  'Chamado', 'Retiro', 'Acampamento', 'Viagem',
  'Voluntariado', 'Profético', 'Dança', 'Coral',
  'Teologia', 'Edificação', 'Maturidade', 'Composição',
  'Pastoreio', 'ServiçoSocial', 'Companheirismo'
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

export default function DiscoverFilters({ filters, onFiltersChange, onApply, triggerId, triggerClassName }: DiscoverFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DiscoverFiltersState>(filters);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const { data: subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeData, setUpgradeData] = useState<{
    title: string;
    description: string;
    features: string[];
    planNeeded: 'bronze' | 'silver' | 'gold';
    icon?: React.ReactNode;
    price: number;
    planId: string;
  }>({
    title: '',
    description: '',
    features: [],
    planNeeded: 'silver',
    icon: null,
    price: 0,
    planId: ''
  });
  const [showCheckoutManager, setShowCheckoutManager] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ id: string, name: string, price: number } | null>(null);

  const isBronze = subscription?.tier === 'bronze' || subscription?.tier === 'none';
  const isSilver = subscription?.tier === 'silver';
  const isGold = subscription?.tier === 'gold';

  const handleOpenFilters = (e: React.MouseEvent) => {
    setOpen(true);
  };

  const handleAdvancedFilterClick = (featureName: string, features: string[], icon: React.ReactNode) => {
    if (isBronze) {
      setUpgradeData({
        title: "Plano Prata",
        description: "Migre para o Plano Prata para desbloquear todos os filtros básicos e avançados!",
        features: [
          "Ver quem curtiu você",
          "Curtidas ilimitadas",
          "Enviar e receber fotos e áudios",
          "Filtro por cidade / região",
          "Fazer chamadas de voz e vídeo",
          "Comunidade cristã no WhatsApp"
        ],
        planNeeded: 'silver',
        icon: <Sliders className="w-8 h-8" />,
        price: 29.90,
        planId: 'silver'
      });
      setShowUpgradeDialog(true);
      return;
    }

    if (isSilver) {
      setUpgradeData({
        title: "Plano Ouro",
        description: `O recurso "${featureName}" é exclusivo para membros do Plano Ouro. Aproveite agora com 90% de desconto!`,
        features: [
          "Todos os recursos do Plano Prata",
          "Enviar mensagem sem curtir antes",
          "Ver perfis online recentemente",
          "Filtro por distância e interesses",
          "Perfil em destaque",
          "Filtros avançados (idade e distância)",
          "Filtro por objetivo (Namoro/Casamento)",
          "BÔNUS: Comunidade VIP no WhatsApp",
          "BÔNUS: Cursos e Devocionais Diários"
        ],
        planNeeded: 'gold',
        icon: icon,
        price: 49.90,
        planId: 'gold'
      });
      setShowUpgradeDialog(true);
    }
  };

  const handleAgeChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1],
    }));
  };

  const handleApply = () => {
    if (isBronze) {
      setUpgradeData({
        title: "Plano Prata",
        description: "Migre para o Plano Prata para filtrar perfis por cidade, idade, religião e muito mais!",
        features: [
          "Ver quem curtiu você",
          "Curtidas ilimitadas",
          "Enviar e receber fotos e áudios",
          "Filtro por cidade / região",
          "Fazer chamadas de voz e vídeo",
          "Comunidade cristã no WhatsApp"
        ],
        planNeeded: 'silver',
        icon: <Sliders className="w-8 h-8" />,
        price: 29.90,
        planId: 'silver'
      });
      setShowUpgradeDialog(true);
      return;
    }
    onFiltersChange(localFilters);
    onApply(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  const countActiveFilters = (): number => {
    let count = 0;
    if (filters.minAge !== 18 || filters.maxAge !== 60) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.maxDistance !== 100) count++;
    if (filters.religion) count++;
    if (filters.churchFrequency) count++;
    if (filters.lookingFor) count++;
    if (filters.christianInterests && filters.christianInterests.length > 0) count++;
    if (filters.hasPhotos) count++;
    if (filters.isVerified) count++;
    if (filters.onlineRecently) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  const FilterSection = ({
    title,
    icon,
    children,
    showUpgrade,
    onUpgradeClick
  }: {
    title: string;
    icon: string;
    children: React.ReactNode;
    showUpgrade?: boolean;
    onUpgradeClick?: () => void;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className={cn(icon, 'text-primary')} />
          <Label className="text-base font-semibold">{title}</Label>
        </div>
        {showUpgrade && (
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-500 hover:bg-amber-500/20 transition-colors"
          >
            <Lock className="w-2.5 h-2.5" />
            Upgrade
          </button>
        )}
      </div>
      <div className={cn("relative", (showUpgrade || isBronze) && "cursor-pointer")} onClick={(e) => {
        if (showUpgrade || isBronze) {
          e.stopPropagation();
          onUpgradeClick?.();
        }
      }}>
        {children}
        {(showUpgrade || isBronze) && <div className="absolute inset-0 z-10" />}
      </div>
    </div>
  );

  const ToggleFilter = ({
    label,
    description,
    checked,
    onCheckedChange,
    icon
  }: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    icon: string;
  }) => (
    <div className="flex items-center justify-between py-2">
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className={cn("relative", triggerClassName)} id={triggerId} onClick={handleOpenFilters}>
          <i className="ri-equalizer-line text-lg" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[60vh] rounded-t-3xl outline-none focus:ring-0">
        <DrawerHeader className="mb-2 text-left relative pr-12">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <DrawerTitle className="font-display text-2xl">Filtros Avançados</DrawerTitle>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Deslize para ver mais filtros</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-0 right-3.5 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/60 hover:text-foreground active:scale-95 transition-all z-50"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-12 scrollbar-hide">


          {/* Age Range */}
          <FilterSection
            title="Faixa de idade"
            icon="ri-user-line"
            showUpgrade={!isGold}
            onUpgradeClick={() => {
              setUpgradeData({
                title: "Plano Ouro",
                description: "O filtro de idade é exclusivo para membros do Plano Ouro. Aproveite agora com 90% de desconto!",
                features: [
                  "Ver perfis online recentemente",
                  "Enviar mensagem direta",
                  "Filtros avançados completos",
                  "Prioridade na fila",
                  "Bônus: Cursos e Devocionais"
                ],
                planNeeded: 'gold',
                icon: <Filter className="w-8 h-8" />,
                price: 49.90,
                planId: 'gold'
              });
              setShowUpgradeDialog(true);
            }}
          >
            <div className={cn("px-2 pt-2 transition-all", !isGold && "opacity-40 grayscale pointer-events-none")}>
              <Slider
                value={[localFilters.minAge, localFilters.maxAge]}
                onValueChange={handleAgeChange}
                min={18}
                max={80}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-3">
                <Badge variant="outline" className="text-sm">
                  {localFilters.minAge} anos
                </Badge>
                <span className="text-muted-foreground">até</span>
                <Badge variant="outline" className="text-sm">
                  {localFilters.maxAge} anos
                </Badge>
              </div>
            </div>
          </FilterSection>


          <Separator />

          {/* Distance */}
          <FilterSection
            title="Distância máxima"
            icon="ri-road-map-line"
            showUpgrade={!isGold}
            onUpgradeClick={() => {
              setUpgradeData({
                title: "Plano Ouro",
                description: "O ajuste de distância é recurso exclusivo para membros do Plano Ouro.",
                features: [
                  "Filtro por distância física",
                  "Prioridade na fila (Boost)",
                  "Enviar Direct sem Match"
                ],
                planNeeded: 'gold',
                icon: <MapPin className="w-8 h-8" />,
                price: 49.90,
                planId: 'gold'
              });
              setShowUpgradeDialog(true);
            }}
          >
            <div className={cn("px-2 pt-2 transition-all", !isGold && "opacity-40 grayscale")}>
              <Slider
                value={[localFilters.maxDistance]}
                onValueChange={(values) => setLocalFilters(prev => ({ ...prev, maxDistance: values[0] }))}
                min={1}
                max={500}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between mt-3">
                <Badge variant="outline" className="text-sm">
                  Até {localFilters.maxDistance} km
                </Badge>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Location */}
          <FilterSection
            title="Localização"
            icon="ri-map-pin-line"
            showUpgrade={isBronze}
            onUpgradeClick={() => {
              setUpgradeData({
                title: "Plano Prata",
                description: "Migre para o Plano Prata para filtrar por Cidade e Estado!",
                features: ["Filtro por cidade / região", "Curtidas Ilimitadas"],
                planNeeded: 'silver',
                icon: <MapPin className="w-8 h-8" />,
                price: 29.90,
                planId: 'silver'
              });
              setShowUpgradeDialog(true);
            }}
          >
            <div className={cn("grid grid-cols-2 gap-3 transition-all", isBronze && "opacity-40 grayscale")}>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Estado</Label>
                <Select
                  value={localFilters.state || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, state: value === 'all' ? '' : value, city: '' }))
                  }
                >
                  <SelectTrigger className={cn("h-10 transition-all", localFilters.state && "border-primary/40 text-foreground font-medium")}>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-background">
                    <SelectItem value="all">Todos os estados</SelectItem>
                    {BRAZIL_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Cidade</Label>
                <Select
                  value={localFilters.city || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, city: value === 'all' ? '' : value }))
                  }
                  disabled={!localFilters.state}
                >
                  <SelectTrigger className={cn("h-10 transition-all", localFilters.city && "border-primary/40 text-foreground font-medium")}>
                    <SelectValue placeholder={!localFilters.state ? "Selecione um estado" : "Todas"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-background">
                    <SelectItem value="all">Todas</SelectItem>
                    {localFilters.state && BRAZIL_CITIES[localFilters.state]?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Faith */}
          <FilterSection
            title="Fé e Religião"
            icon="ri-heart-3-line"
            showUpgrade={!isGold}
            onUpgradeClick={() => handleAdvancedFilterClick("Fé e Religião", ["Filtro por religião", "Frequência na igreja", "Interesses cristãos específicos"], <Heart className="w-8 h-8" />)}
          >
            <div className={cn("space-y-3 transition-all", !isGold && "opacity-40 grayscale pointer-events-none")}>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Religião</Label>
                <Select
                  value={localFilters.religion || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, religion: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className={cn("h-10 transition-all", localFilters.religion && "border-primary/40 text-foreground font-medium")}>
                    <SelectValue placeholder="Todas as religiões" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-background">
                    {RELIGIONS.map((religion) => (
                      <SelectItem key={religion.value || 'all'} value={religion.value || 'all'}>
                        {religion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Frequência na Igreja</Label>
                <Select
                  value={localFilters.churchFrequency || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, churchFrequency: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className={cn("h-10 transition-all", localFilters.churchFrequency && "border-primary/40 text-foreground font-medium")}>
                    <SelectValue placeholder="Qualquer frequência" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] bg-background">
                    {CHURCH_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value || 'all'} value={freq.value || 'all'}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Filtrar por Interesses</Label>
                <div className="flex flex-wrap gap-2">
                  {(showAllInterests && isGold ? CHRISTIAN_INTERESTS_OPTIONS : CHRISTIAN_INTERESTS_OPTIONS.slice(0, 16)).map(interest => {
                    const isSelected = localFilters.christianInterests?.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => {
                          const currentInterests = localFilters.christianInterests || [];
                          const isSelected = currentInterests.includes(interest);
                          const newInterests = isSelected
                            ? currentInterests.filter(i => i !== interest)
                            : [...currentInterests, interest];
                          setLocalFilters(prev => ({ ...prev, christianInterests: newInterests }));
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${isSelected
                          ? 'bg-primary/20 border-primary text-primary shadow-sm shadow-primary/10'
                          : 'bg-muted/50 border-input text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {interest}
                      </button>
                    )
                  })}

                  {!showAllInterests && isGold && (
                    <button
                      onClick={() => setShowAllInterests(true)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-medium border bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-1"
                    >
                      <i className="ri-add-line" />
                      Outros
                    </button>
                  )}

                  {showAllInterests && isGold && (
                    <button
                      onClick={() => setShowAllInterests(false)}
                      className="w-full py-2 text-[10px] font-medium text-primary hover:underline transition-all text-center mt-2 border-t border-dashed border-primary/20"
                    >
                      Ver menos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Relationship Goals */}
          <FilterSection
            title="Relacionamento"
            icon="ri-search-heart-line"
            showUpgrade={!isGold}
            onUpgradeClick={() => handleAdvancedFilterClick("Relacionamento", ["Filtrar por objetivos em comum", "Interesses cristãos avançados", "Prioridade na fila"], <Target className="w-8 h-8" />)}
          >
            <div className={cn("transition-all", !isGold && "opacity-40 grayscale pointer-events-none")}>
              <Select
                value={localFilters.lookingFor || 'all'}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, lookingFor: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger className={cn("h-10 transition-all", localFilters.lookingFor && "border-primary/40 text-foreground font-medium")}>
                  <SelectValue placeholder="Selecione o que busca" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterSection>

          <Separator />

          {/* Quick Filters - Back to bottom */}
          <FilterSection
            title="Filtros rápidos"
            icon="ri-filter-3-line"
            showUpgrade={!isGold}
            onUpgradeClick={() => handleAdvancedFilterClick("Filtros Rápidos", ["Apenas quem tem fotos", "Apenas quem está online", "Perfis verificados primeiro"], <Filter className="w-8 h-8" />)}
          >
            <div className={cn("space-y-1 bg-muted/50 rounded-xl p-3 transition-all", !isGold && "opacity-40 grayscale pointer-events-none")}>
              <ToggleFilter
                icon="ri-time-line"
                label="Online recentemente"
                description="Ativos nas últimas 24 horas"
                checked={localFilters.onlineRecently}
                onCheckedChange={(checked) => setLocalFilters((prev) => ({ ...prev, onlineRecently: checked }))}
              />

              <Separator className="my-2" />
              <ToggleFilter
                icon="ri-image-line"
                label="Com fotos"
                description="Mostrar apenas perfis com fotos"
                checked={localFilters.hasPhotos}
                onCheckedChange={(checked) => setLocalFilters((prev) => ({ ...prev, hasPhotos: checked }))}
              />
            </div>
          </FilterSection>


        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-4 py-6 border-t bg-background mt-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <i className="ri-refresh-line mr-2" />
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1 gradient-button">
            <i className="ri-check-line mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </DrawerContent>

      <FeatureGateDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title={upgradeData.title}
        description={upgradeData.description}
        features={upgradeData.features}
        icon={upgradeData.icon}
        price={upgradeData.price}
        onUpgrade={(planData) => {
          setSelectedCheckoutPlan({
            id: planData.id,
            name: planData.name,
            price: planData.price
          });
          setShowUpgradeDialog(false);
          setShowCheckoutManager(true);
        }}
      />

      {showCheckoutManager && selectedCheckoutPlan && (
        <CheckoutManager
          key={`filters-checkout-v1-${selectedCheckoutPlan.id}`}
          open={showCheckoutManager}
          onOpenChange={(open) => {
            setShowCheckoutManager(open);
            if (!open) {
              setTimeout(() => {
                setSelectedCheckoutPlan(null);
                setShowUpgradeDialog(true);
              }, 50);
            }
          }}
          planId={selectedCheckoutPlan.id}
          planPrice={selectedCheckoutPlan.price}
          planName={selectedCheckoutPlan.name}
        />
      )}
    </Drawer>
  );
}
