import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { BRAZIL_CITIES, BRAZIL_STATES } from '@/config/brazil-cities';

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
  { value: '', label: 'Qualquer objetivo' },
  { value: 'Um compromisso sério', label: 'Um compromisso sério' },
  { value: 'Construir uma família', label: 'Construir uma família' },
  { value: 'Conhecer pessoas novas', label: 'Conhecer pessoas novas' },
  { value: 'Amizade verdadeira', label: 'Amizade verdadeira' },
];

const CHRISTIAN_INTERESTS_OPTIONS = [
  'Oração', 'Companheirismo', 'Respeito', 'Propósito', 'Leitura',
  'Estudos', 'Pregações', 'Podcasts', 'Chamado', 'Família',
  'Retiro', 'Acampamento', 'Viagem', 'Comunhão', 'Missões',
  'Voluntariado', 'Teatro', 'Profético', 'Dança', 'Coral',
  'Discipulado', 'Teologia', 'Bíblia', 'Santidade', 'Adoração',
  'Louvor', 'Jejum', 'Evangelismo', 'Devocional', 'Edificação',
  'Maturidade', 'Composição', 'Instrumental', 'Pastoreio', 'ServiçoSocial'
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

  const handleAgeChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1],
    }));
  };

  const handleApply = () => {
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

  const FilterSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <i className={cn(icon, 'text-primary')} />
        <Label className="text-base font-semibold">{title}</Label>
      </div>
      {children}
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={cn("relative", triggerClassName)} id={triggerId}>
          <i className="ri-equalizer-line text-lg" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-2xl">Filtros Avançados</SheetTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto max-h-[calc(90vh-180px)] px-2 pb-12">
          {/* Age Range */}
          <FilterSection title="Faixa de idade" icon="ri-user-line">
            <div className="px-2 pt-2">
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
          <FilterSection title="Distância máxima" icon="ri-road-map-line">
            <div className="px-2 pt-2">
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
                <span className="text-xs text-muted-foreground flex items-center">
                  {localFilters.maxDistance >= 500 ? 'Todo o Brasil' : 'Raio de busca'}
                </span>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Location */}
          <FilterSection title="Localização" icon="ri-map-pin-line">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Estado</Label>
                <Select
                  value={localFilters.state}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, state: value === 'all' ? '' : value, city: '' }))
                  }
                >
                  <SelectTrigger className="h-10">
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
                  value={localFilters.city}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, city: value === 'all' ? '' : value }))
                  }
                  disabled={!localFilters.state}
                >
                  <SelectTrigger className="h-10">
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
          <FilterSection title="Fé e Religião" icon="ri-heart-3-line">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Religião</Label>
                <Select
                  value={localFilters.religion}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, religion: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className="h-10">
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
                  value={localFilters.churchFrequency}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, churchFrequency: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className="h-10">
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
                  {(showAllInterests ? CHRISTIAN_INTERESTS_OPTIONS : CHRISTIAN_INTERESTS_OPTIONS.slice(0, 5)).map(interest => {
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

                  {!showAllInterests && (
                    <button
                      onClick={() => setShowAllInterests(true)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-medium border bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-1"
                    >
                      <i className="ri-add-line" />
                      Outros
                    </button>
                  )}

                  {showAllInterests && (
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
          <FilterSection title="Objetivo" icon="ri-search-heart-line">
            <Select
              value={localFilters.lookingFor}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, lookingFor: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Qualquer objetivo" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          <Separator />

          {/* Quick Filters */}
          <FilterSection title="Filtros rápidos" icon="ri-filter-3-line">
            <div className="space-y-1 bg-muted/50 rounded-xl p-3">
              <ToggleFilter
                icon="ri-image-line"
                label="Com fotos"
                description="Mostrar apenas perfis com fotos"
                checked={localFilters.hasPhotos}
                onCheckedChange={(checked) => setLocalFilters((prev) => ({ ...prev, hasPhotos: checked }))}
              />

              <Separator className="my-2" />
              <ToggleFilter
                icon="ri-time-line"
                label="Online recentemente"
                description="Ativos nas últimas 24 horas"
                checked={localFilters.onlineRecently}
                onCheckedChange={(checked) => setLocalFilters((prev) => ({ ...prev, onlineRecently: checked }))}
              />
            </div>
          </FilterSection>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t bg-background">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <i className="ri-refresh-line mr-2" />
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1 gradient-button">
            <i className="ri-check-line mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
