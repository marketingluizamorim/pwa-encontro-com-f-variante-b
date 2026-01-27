import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  gradient: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

interface PlanCardProps {
  plan: Plan;
  index: number;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, index, onSelect }: PlanCardProps) {
  const formattedPrice = plan.price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOriginalPrice = plan.originalPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const discountPercent = Math.round((1 - plan.price / plan.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="gradient-button text-primary-foreground font-semibold px-4 py-1 text-sm shadow-lg">
            ⭐ MAIS POPULAR
          </Badge>
        </div>
      )}

      {/* Card */}
      <div
        className={`bg-white rounded-3xl overflow-hidden shadow-2xl ${
          plan.popular ? 'ring-4 ring-amber-light' : ''
        }`}
      >
        {/* Card Header */}
        <div className={`${plan.gradient} p-6 text-primary-foreground ${plan.popular ? 'pt-8' : ''}`}>
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-primary-foreground/90 mb-4 text-lg">{plan.period}</p>
          
          {/* Price with anchoring */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg text-primary-foreground/60 line-through">
              R$ {formattedOriginalPrice}
            </span>
          </div>
          <p className="text-5xl font-bold mb-2">R$ {formattedPrice}</p>
          
          {plan.savings && (
            <Badge className="bg-green-600 text-white">
              {plan.savings}
            </Badge>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/80 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => onSelect(plan)}
            className={`w-full py-4 rounded-xl font-semibold ${plan.gradient} text-primary-foreground text-lg`}
          >
            Assinar Agora
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
