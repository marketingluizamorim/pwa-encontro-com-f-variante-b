import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Import avatar images from match photos (hidden ones, not display)
import avatarCamila from '@/assets/match-female-26-35-1.jpg';
import avatarRicardo from '@/assets/match-male-36-55-1.jpg';
import avatarPatricia from '@/assets/match-female-36-55-2.jpg';
import avatarFernando from '@/assets/match-male-26-35-2.jpg';
import avatarJuliana from '@/assets/match-female-18-25-1.jpg';

const TESTIMONIALS = [
  {
    name: 'Juliana R.',
    city: 'Salvador, BA',
    text: 'Eu tinha muito medo de me machucar de novo. Mas ele foi tão paciente comigo... A gente orou junto no primeiro encontro e ali eu soube que era especial. Hoje é meu melhor amigo e namorado. ❤️',
    avatar: avatarJuliana,
  },
  {
    name: 'Ricardo M.',
    city: 'Rio de Janeiro, RJ',
    text: 'Confesso que entrei meio desconfiado, achando que ia ser mais do mesmo. Mas ela me mandou um "oi" simples e a gente não parou mais de conversar. Semana que vem vou conhecer a família dela!',
    avatar: avatarRicardo,
  },
  {
    name: 'Patrícia L.',
    city: 'Belo Horizonte, MG',
    text: 'Depois do divórcio, achei que ninguém ia querer uma mulher de 43 anos com dois filhos. Ele me mostrou que eu tava errada. Trata meus filhos como se fossem dele. Deus sabe o que faz.',
    avatar: avatarPatricia,
  },
  {
    name: 'Fernando A.',
    city: 'Curitiba, PR',
    text: 'Cansado de Tinder e essas coisas. Aqui foi diferente porque as pessoas realmente querem algo sério. Em 3 meses a gente já tá fazendo planos pro futuro. Valeu demais.',
    avatar: avatarFernando,
  },
  {
    name: 'Camila S.',
    city: 'São Paulo, SP',
    text: 'Gente, eu já tinha desistido. Sério. Mas resolvi dar mais uma chance e no segundo dia de conversa senti que era diferente. Hoje a gente tá junto há 8 meses e ele me pediu em namoro na igreja. 🥹',
    avatar: avatarCamila,
  },
];

const AUTO_PLAY_INTERVAL = 4000; // 4 seconds

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Get visible cards (current + 2 behind)
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const totalCards = TESTIMONIALS.length;
    
    // Normalize diff to handle wrap-around
    let normalizedDiff = diff;
    if (diff > totalCards / 2) normalizedDiff = diff - totalCards;
    if (diff < -totalCards / 2) normalizedDiff = diff + totalCards;

    // Only show current and next 2 cards in stack
    if (normalizedDiff < 0 || normalizedDiff > 2) {
      return { opacity: 0, scale: 0.8, y: 40, zIndex: 0 };
    }

    return {
      opacity: normalizedDiff === 0 ? 1 : normalizedDiff === 1 ? 0.7 : 0.4,
      scale: 1 - normalizedDiff * 0.05,
      y: normalizedDiff * 12,
      zIndex: 10 - normalizedDiff,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-12 border border-white/10"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
          O Que Nossos Membros Dizem
        </h3>
        <p className="text-primary-foreground/70 text-sm md:text-base">
          Histórias reais de pessoas que encontraram o amor aqui dentro
        </p>
      </div>

      {/* Stacked Cards Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={() => {
            setIsPaused(true);
            prevSlide();
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-10 z-20 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => {
            setIsPaused(true);
            nextSlide();
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-10 z-20 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Stacked Cards */}
        <div 
          className="relative flex justify-center items-center min-h-[260px] px-8"
          onClick={() => setIsPaused(true)}
          onTouchStart={() => setIsPaused(true)}
        >
          {TESTIMONIALS.map((testimonial, index) => {
            const style = getCardStyle(index);
            
            return (
              <motion.div
                key={index}
                animate={{
                  opacity: style.opacity,
                  scale: style.scale,
                  y: style.y,
                  zIndex: style.zIndex,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute w-[280px] md:w-[320px] bg-white rounded-2xl p-5 shadow-xl cursor-pointer"
                style={{ zIndex: style.zIndex }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full border-2 border-primary object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.city}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80">{testimonial.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {TESTIMONIALS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsPaused(true);
              setActiveIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-white w-4' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
