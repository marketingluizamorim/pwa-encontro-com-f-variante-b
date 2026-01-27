import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface DiscoverFiltersState {
  minAge: number;
  maxAge: number;
  state: string;
  city: string;
  religion: string;
  churchFrequency: string;
  lookingFor: string;
  hasPhotos: boolean;
  isVerified: boolean;
  onlineRecently: boolean;
}

interface DiscoverFiltersProps {
  filters: DiscoverFiltersState;
  onFiltersChange: (filters: DiscoverFiltersState) => void;
  onApply: () => void;
}

const RELIGIONS = [
  { value: '', label: 'Todas' },
  { value: 'Católica', label: 'Católica' },
  { value: 'Evangélica', label: 'Evangélica' },
  { value: 'Protestante', label: 'Protestante' },
  { value: 'Adventista', label: 'Adventista' },
  { value: 'Batista', label: 'Batista' },
  { value: 'Presbiteriana', label: 'Presbiteriana' },
  { value: 'Metodista', label: 'Metodista' },
  { value: 'Assembleia de Deus', label: 'Assembleia de Deus' },
  { value: 'Espírita', label: 'Espírita' },
  { value: 'Testemunha de Jeová', label: 'Testemunha de Jeová' },
  { value: 'Outra', label: 'Outra' },
];

const CHURCH_FREQUENCIES = [
  { value: '', label: 'Qualquer frequência' },
  { value: 'Todo domingo', label: 'Todo domingo' },
  { value: 'Algumas vezes por mês', label: 'Algumas vezes por mês' },
  { value: 'Raramente', label: 'Raramente' },
  { value: 'Só em ocasiões especiais', label: 'Só em ocasiões especiais' },
];

const LOOKING_FOR_OPTIONS = [
  { value: '', label: 'Qualquer objetivo' },
  { value: 'Namoro sério', label: 'Namoro sério' },
  { value: 'Casamento', label: 'Casamento' },
  { value: 'Amizade cristã', label: 'Amizade cristã' },
  { value: 'Conhecer pessoas', label: 'Conhecer pessoas' },
];

const BRAZILIAN_STATES = [
  { value: '', label: 'Todos os estados' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const DEFAULT_FILTERS: DiscoverFiltersState = {
  minAge: 18,
  maxAge: 60,
  state: '',
  city: '',
  religion: '',
  churchFrequency: '',
  lookingFor: '',
  hasPhotos: false,
  isVerified: false,
  onlineRecently: false,
};

export default function DiscoverFilters({ filters, onFiltersChange, onApply }: DiscoverFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<DiscoverFiltersState>(filters);

  const handleAgeChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
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
    if (filters.religion) count++;
    if (filters.churchFrequency) count++;
    if (filters.lookingFor) count++;
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
        <Button variant="outline" size="icon" className="relative">
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

        <div className="space-y-5 overflow-y-auto max-h-[calc(90vh-180px)] pb-4 pr-1">
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
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value || 'all'} value={state.value || 'all'}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Cidade</Label>
                <Input
                  value={localFilters.city}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Qualquer cidade"
                  className="h-10"
                />
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
                <Label className="text-xs text-muted-foreground mb-1.5 block">Frequência na igreja</Label>
                <Select
                  value={localFilters.churchFrequency}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, churchFrequency: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Qualquer frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {CHURCH_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value || 'all'} value={freq.value || 'all'}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                icon="ri-verified-badge-line"
                label="Verificados"
                description="Mostrar apenas perfis verificados"
                checked={localFilters.isVerified}
                onCheckedChange={(checked) => setLocalFilters((prev) => ({ ...prev, isVerified: checked }))}
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
