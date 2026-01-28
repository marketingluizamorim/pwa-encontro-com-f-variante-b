import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from '@/features/funnel/hooks/useFunnelStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import regionsImage from '@/assets/bump-regions-premium.png';
import evangelicoImage from '@/assets/bump-evangelico-premium.png';
import catolicoImage from '@/assets/bump-catolico-premium.png';

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
    <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2rem] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide min-h-0">
        {/* Header - Compact */}
        <div className="text-center mb-3 flex-shrink-0">
          <DialogTitle className="font-serif text-2xl font-bold text-white tracking-tight leading-none">
            Ofertas de Ano Novo 🎉
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs font-light tracking-wide mt-1">
            Personalize sua experiência
          </DialogDescription>
        </div>

        {/* Order Bump Cards */}
        <div className="space-y-3 pb-2">
          {ORDER_BUMPS.map(bump => {
            const isSelected = selectedBumps.includes(bump.id);
            return <div key={bump.id} onClick={() => toggleBump(bump.id)} className={`relative p-3.5 rounded-xl cursor-pointer transition-all border duration-300 group ${isSelected ? 'bg-[#fcd34d]/10 border-[#fcd34d]/50 shadow-[0_0_15px_rgba(252,211,77,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
              <div className="flex items-center gap-3.5">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'border-[#fcd34d] bg-[#fcd34d]' : 'border-white/30 group-hover:border-white/50'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />}
                </div>

                {/* Image */}
                <div className="w-12 h-12 rounded-xl bg-black/20 p-0.5 border border-white/5 overflow-hidden flex-shrink-0">
                  <img src={bump.image} alt={bump.name} className="w-full h-full object-contain" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4 className="text-white leading-tight text-base font-serif font-bold tracking-wide">
                      {bump.name}
                    </h4>
                    <p className="font-black text-[#fcd34d] text-sm whitespace-nowrap flex-shrink-0">
                      +R$ {bump.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <p className="text-sm text-white/50 font-light leading-snug">
                    {bump.description}
                  </p>
                </div>
              </div>

              {/* Badge */}
              {bump.badge && <div className="mt-2.5 pl-9 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300 uppercase tracking-wider leading-none">
                  {bump.badge}
                </span>
              </div>}
            </div>;
          })}
        </div>
      </div>

      {/* Footer (Fixed) */}
      <div className="p-3 bg-[#0f172a] border-t border-white/10 relative z-20">
        {selectedPlan && <div className="bg-black/20 rounded-lg p-2.5 border border-white/5 backdrop-blur-sm mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80 font-medium">
              {selectedPlan.name}
            </span>
            <span className="text-white font-bold">
              R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {selectedBumps.length > 0 && <>
            {/* Collapsible extras for multiple bumps */}
            {hasMultipleBumps ? (
              <>
                <button
                  onClick={() => setExtrasExpanded(!extrasExpanded)}
                  className="flex items-center justify-between w-full text-xs mt-1.5 py-1 group"
                >
                  <span className="text-[#fcd34d]/80 text-[10px] flex items-center gap-1 group-hover:text-[#fcd34d] transition-colors">
                    + Extras ({selectedBumps.length})
                    {extrasExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                  <span className="font-medium text-[#fcd34d]">
                    R$ {calculateExtra().toFixed(2).replace('.', ',')}
                  </span>
                </button>
                {extrasExpanded && (
                  <div className="pl-3 border-l-2 border-[#fcd34d]/30 ml-1 space-y-1 mt-1 max-h-20 overflow-y-auto">
                    {selectedBumpsList.map(bump => (
                      <div key={bump.id} className="flex items-center justify-between text-xs">
                        <span className="text-white/60 text-[10px]">{bump.name}</span>
                        <span className="font-medium text-[#fcd34d] text-[10px]">
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
                <div key={bump.id} className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[#fcd34d]/80 text-[10px]">+ {bump.name}</span>
                  <span className="font-large text-[#fcd34d]">
                    R$ {bump.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-white/10">
              <span className="font-medium text-white">Total</span>
              <span className="font-black text-[#fcd34d] text-lg">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </>}
        </div>}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDecline} className="flex-1 h-10 rounded-lg border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white transition-all uppercase tracking-wide text-[10px] font-bold">
            Não, Obrigado
          </Button>
          <Button onClick={handleContinue} className="flex-1 h-10 rounded-lg gradient-button text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all uppercase tracking-wide text-[10px] font-bold">
            Continuar
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
