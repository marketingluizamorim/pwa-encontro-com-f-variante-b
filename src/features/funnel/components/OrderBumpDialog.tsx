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
  description: 'Busque por relacionamento na sua cidade.',
  price: 5.0,
  image: regionsImage,
  badge: '🔥 67% das pessoas escolhem esta opção'
}, {
  id: 'evangelico',
  name: 'Grupo Evangélico',
  description: 'Junte-se a outros cristãos no Whatsapp.',
  price: 5.0,
  image: evangelicoImage
}, {
  id: 'catolico',
  name: 'Grupo Católico',
  description: 'Junte-se a outros devotos no whatsapp.',
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
    id: string;
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
    <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-[2rem] bg-[#1e293b]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide min-h-0">
        {/* Header - Compact */}
        <div className="text-center mb-3 flex-shrink-0">
          <DialogTitle className="font-serif text-2xl font-bold text-white tracking-tight leading-none">
            Ofertas de Ano Novo 🎉
          </DialogTitle>
          <DialogDescription
            className="text-white/60 font-light tracking-wide mt-1"
            style={{ fontSize: '0.85rem' }}
          >
            Adicione junto e personalize sua experiência
          </DialogDescription>
        </div>

        {/* Order Bump Cards */}
        <div className="space-y-3 pb-2">
          {ORDER_BUMPS.filter(bump => {
            if (selectedPlan?.id === 'silver' && bump.id === 'regions') return false;
            return true;
          }).map(bump => {
            const isSelected = selectedBumps.includes(bump.id);
            return <div key={bump.id} onClick={() => toggleBump(bump.id)} className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border group ${isSelected ? 'bg-gradient-to-br from-[#fcd34d]/20 to-transparent border-[#fcd34d]/60 shadow-[0_4px_20px_-5px_rgba(252,211,77,0.25)] scale-[1.02] z-10 ring-1 ring-[#fcd34d]/30' : 'bg-[#0f172a]/50 border-white/5 hover:border-white/20 hover:bg-[#0f172a]/70'}`}>
              <div className="flex items-center gap-4">
                {/* Radio Button */}
                <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isSelected ? 'border-[#fcd34d] bg-[#fcd34d] scale-110 shadow-[0_0_10px_rgba(252,211,77,0.4)]' : 'border-white/20 group-hover:border-white/40 bg-white/5'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />}
                </div>

                {/* Image */}
                <div className={`w-12 h-12 rounded-xl bg-black/30 p-0.5 border overflow-hidden flex-shrink-0 transition-colors ${isSelected ? 'border-[#fcd34d]/40' : 'border-white/5'}`}>
                  <img
                    src={bump.image}
                    alt={bump.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h4
                      className={`leading-tight font-serif font-bold tracking-wide transition-colors ${isSelected ? 'text-white' : 'text-white/90'}`}
                      style={{ fontSize: (bump.id === 'evangelico' || bump.id === 'catolico') ? '1.05rem' : '1.1rem' }}
                    >
                      {bump.name}
                    </h4>
                    <p className={`font-black text-sm whitespace-nowrap flex-shrink-0 transition-colors ${isSelected ? 'text-[#fcd34d]' : 'text-[#fcd34d]/80'}`}>
                      +R$ {bump.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <p className={`text-sm font-light leading-snug transition-colors ${isSelected ? 'text-white/70' : 'text-white/40'}`}>
                    {bump.description}
                  </p>
                </div>
              </div>

              {/* Badge */}
              {bump.badge && <div className="mt-3 pl-10 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider leading-none transition-all bg-[#3f2e12] border-[#856627] text-[#fcd34d] shadow-sm">
                  {bump.badge}
                </span>
              </div>}
            </div>;
          })}
        </div>
      </div>

      {/* Footer (Fixed) */}
      <div className="p-4 bg-[#1e293b] border-t border-white/10 relative z-20">
        {selectedPlan && <div className="bg-black/20 rounded-xl p-3 border border-white/5 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/90 font-bold text-sm uppercase tracking-wide">
              {selectedPlan.name}
            </span>
            <span className="text-white font-black text-lg">
              R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {selectedBumps.length > 0 && <>
            {/* Collapsible extras for multiple bumps */}
            {hasMultipleBumps ? (
              <>
                <button
                  onClick={() => setExtrasExpanded(!extrasExpanded)}
                  className="flex items-center justify-between w-full text-xs mt-2 py-1 group"
                >
                  <span className="text-[#fcd34d]/80 text-xs flex items-center gap-1 group-hover:text-[#fcd34d] transition-colors">
                    + Extras ({selectedBumps.length})
                    {extrasExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-medium text-[#fcd34d]">
                    R$ {calculateExtra().toFixed(2).replace('.', ',')}
                  </span>
                </button>
                {extrasExpanded && (
                  <div className="pl-3 border-l-2 border-[#fcd34d]/30 ml-1 space-y-1.5 mt-1 max-h-24 overflow-y-auto">
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
                <div key={bump.id} className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-[#fcd34d]/80 text-xs font-medium border-b border-dashed border-[#fcd34d]/30 pb-0.5">+ {bump.name}</span>
                  <span className="font-bold text-[#fcd34d]">
                    R$ {bump.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <span className="font-bold text-white text-sm uppercase">Total a Pagar</span>
              <span className="font-black text-[#fcd34d] text-2xl drop-shadow-sm">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </>}
        </div>}

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={handleDecline} className="flex-1 h-12 rounded-xl border-white/10 text-white/70 bg-transparent hover:bg-white/5 hover:text-white transition-all uppercase tracking-wide text-xs font-bold hover:border-white/30">
            Não, Obrigado
          </Button>
          <Button onClick={handleContinue} className="flex-1 h-12 rounded-xl gradient-button text-white transition-all uppercase tracking-wide text-xs font-bold border-0 hover:opacity-90">
            Continuar
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
