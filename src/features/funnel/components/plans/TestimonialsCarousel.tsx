import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircleHeart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Juliana R.',
        location: 'Salvador, BA',
        image: '/testimonials/juliana.png',
        text: 'Eu tinha muito medo de me machucar de novo. Mas ele foi tão paciente comigo... A gente orou junto no primeiro encontro e ali eu soube que era especial. Hoje é meu melhor amigo e namorado. 💗',
        rating: 5,
    },
    {
        id: 2,
        name: 'Ricardo M.',
        location: 'Rio de Janeiro, RJ',
        image: '/testimonials/ricardo.png',
        text: "Confesso que entrei meio desconfiado, achando que ia ser mais do mesmo. Mas ela me mandou um 'oi' simples e a gente não parou mais de conversar. Semana que vem vou conhecer a família dela!",
        rating: 5,
    },
    {
        id: 3,
        name: 'Patrícia L.',
        location: 'Belo Horizonte, MG',
        image: '/testimonials/patricia.png',
        text: 'Depois do divórcio, achei que ninguém ia querer uma mulher de 43 anos com dois filhos. Ele me mostrou que eu tava errada. Trata meus filhos como se fossem dele. Deus sabe o que faz.',
        rating: 5,
    },
    {
        id: 4,
        name: 'Fernando A.',
        location: 'Curitiba, PR',
        image: '/testimonials/fernando.jpg',
        text: 'Cansado de Tinder e essas coisas. Aqui foi diferente porque as pessoas realmente querem algo sério. Em 3 meses a gente já tá fazendo planos pro futuro. Valeu demais.',
        rating: 5,
    },
    {
        id: 5,
        name: 'Camila S.',
        location: 'São Paulo, SP',
        image: '/testimonials/camila.png',
        text: 'Gente, eu já tinha desistido. Sério. Mas resolvi dar mais uma chance e no segundo dia de conversa senti que era diferente. Hoje a gente tá junto há 8 meses e ele me pediu em namoro na igreja. 🥹',
        rating: 5,
    }
];

export function TestimonialsCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 mb-12 border border-white/10 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 p-8 opacity-5 pointer-events-none">
                <MessageCircleHeart className="w-40 h-40 text-white" />
            </div>

            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                    Histórias <span className="text-amber-400">Reais</span>
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto">
                    Veja quem já encontrou seu par ideal através da nossa comunidade.
                </p>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {TESTIMONIALS.map((t) => (
                    <div
                        key={t.id}
                        className="flex-shrink-0 w-[280px] md:w-[320px] snap-center"
                    >
                        <div className="bg-white rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg border border-white/20 relative">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-12 h-12 border-2 border-amber-400">
                                    <AvatarImage src={t.image} className="object-cover" />
                                    <AvatarFallback className="bg-slate-100 text-slate-800 font-bold">
                                        {t.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-slate-900 font-bold text-sm leading-tight">{t.name}</h4>
                                    <p className="text-slate-500 text-xs font-medium">{t.location}</p>
                                </div>
                            </div>

                            {/* Text */}
                            <p className="text-slate-600 text-sm leading-relaxed mb-4 italic flex-grow">
                                "{t.text}"
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                                    />
                                ))}
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Scroll Hint */}
            <div className="flex justify-center mt-2 opacity-30">
                <div className="w-16 h-1 bg-white/20 rounded-full" />
            </div>

        </motion.div>
    );
}
