import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import regionsImage from '@/assets/bump-regions.png';
import evangelicoImage from '@/assets/bump-evangelico.png';
import catolicoImage from '@/assets/bump-catolico.png';

interface OrderBump {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
}

const ORDER_BUMPS: OrderBump[] = [{
  id: 'regions',
  name: 'Desbloquear Região',
  description: 'Relacionamentos na sua cidade.',
  price: 5.0,
  image: regionsImage,
  badge: '🔥 67% das pessoas escolhem esta opção'
}, {
  id: 'evangelico',
  name: 'Grupo Evangélico',
  description: 'Conecte-se com outros cristãos.',
  price: 5.0,
  image: evangelicoImage
}, {
  id: 'catolico',
  name: 'Grupo Católico',
  description: 'Conecte-se com outros devotos.',
  price: 5.0,
  image: catolicoImage
}];
export interface SelectedBumps {
  allRegions: boolean;
  grupoEvangelico: boolean;
  grupoCatolico: boolean;
  lifetime: boolean;
}

interface OrderBumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (extraAmount: number, bumps: SelectedBumps) => void;
  selectedPlan?: {
    name: string;
    price: number;
  } | null;
}
export function OrderBumpDialog({
  open,
  onOpenChange,
  onComplete,
  selectedPlan
}: OrderBumpDialogProps) {
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [extrasExpanded, setExtrasExpanded] = useState(false);
  const setOrderBumps = useFunnelStore((state) => state.setOrderBumps);
  
  const toggleBump = (bumpId: string) => {
    setSelectedBumps(prev => prev.includes(bumpId) ? prev.filter(id => id !== bumpId) : [...prev, bumpId]);
  };
  const calculateExtra = () => {
    return ORDER_BUMPS.filter(bump => selectedBumps.includes(bump.id)).reduce((sum, bump) => sum + bump.price, 0);
  };
  const calculateTotal = () => {
    const planPrice = selectedPlan?.price || 0;
    return planPrice + calculateExtra();
  };
  const handleContinue = () => {
    const bumps: SelectedBumps = {
      allRegions: selectedBumps.includes('regions'),
      grupoEvangelico: selectedBumps.includes('evangelico'),
      grupoCatolico: selectedBumps.includes('catolico'),
      lifetime: false,
    };
    // Save to store for UI purposes
    setOrderBumps(bumps);
    // Pass bumps explicitly to parent
    onComplete(calculateExtra(), bumps);
    onOpenChange(false);
    setSelectedBumps([]);
  };
  
  const handleDecline = () => {
    const emptyBumps: SelectedBumps = {
      allRegions: false,
      grupoEvangelico: false,
      grupoCatolico: false,
      lifetime: false,
    };
    // Reset order bumps in store
    setOrderBumps(emptyBumps);
    // Pass empty bumps explicitly to parent
    onComplete(0, emptyBumps);
    onOpenChange(false);
    setSelectedBumps([]);
  };

  const selectedBumpsList = ORDER_BUMPS.filter(b => selectedBumps.includes(b.id));
  const hasMultipleBumps = selectedBumps.length > 1;

  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 rounded-xl">
        {/* Header */}
        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">
            Ofertas de Ano Novo 🎉
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Personalize sua experiência
          </DialogDescription>
        </DialogHeader>

        {/* Order Bump Cards */}
        <div className="space-y-3">
          {ORDER_BUMPS.map(bump => {
          const isSelected = selectedBumps.includes(bump.id);
          return <div key={bump.id} onClick={() => toggleBump(bump.id)} className={`relative p-3 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50 hover:bg-muted/50'}`}>
                <div className="flex items-center gap-3">
                  {/* Radio Button */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>

                  {/* Image */}
                  <img src={bump.image} alt={bump.name} className="w-16 h-16 object-contain rounded" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground leading-tight text-base font-semibold">
                      {bump.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bump.description}
                    </p>
                    <p className="font-bold text-primary mt-1 text-lg">
                      +R$ {bump.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Badge */}
                {bump.badge && <p className="text-xs text-amber-600 mt-2 font-medium pl-8">
                    {bump.badge}
                  </p>}
              </div>;
        })}
        </div>

        {/* Order Summary */}
        {selectedPlan && <div className="mt-4 bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {selectedPlan.name}
              </span>
              <span className="text-foreground font-semibold">
                R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {selectedBumps.length > 0 && <>
                {/* Collapsible extras for multiple bumps */}
                {hasMultipleBumps ? (
                  <>
                    <button 
                      onClick={() => setExtrasExpanded(!extrasExpanded)}
                      className="flex items-center justify-between w-full text-sm mt-1 py-1"
                    >
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        + Extras ({selectedBumps.length})
                        {extrasExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                      <span className="font-medium text-foreground">
                        R$ {calculateExtra().toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                    {extrasExpanded && (
                      <div className="pl-3 border-l-2 border-primary/30 ml-1 space-y-1">
                        {selectedBumpsList.map(bump => (
                          <div key={bump.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground text-xs">{bump.name}</span>
                            <span className="font-medium text-foreground text-xs">
                              R$ {bump.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Single bump - show directly
                  selectedBumpsList.map(bump => (
                    <div key={bump.id} className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground text-xs">+ {bump.name}</span>
                      <span className="font-medium text-foreground">
                        R$ {bump.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border/50">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-bold text-primary text-base">
                    R$ {calculateTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </>}
          </div>}

        {/* Buttons */}
        <div className="pt-4 flex gap-3">
          <Button variant="outline" onClick={handleDecline} className="flex-1 h-11">
            Não, Obrigado
          </Button>
          <Button onClick={handleContinue} className="flex-1 h-11 gradient-button text-primary-foreground">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}
