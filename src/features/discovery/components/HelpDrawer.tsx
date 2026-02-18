import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HelpDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const helpItems = [
    {
        icon: 'ri-compass-3-line',
        title: 'Descobrir',
        description: 'Aqui você conhece novas pessoas. Deslize para a direita se gostar, para a esquerda para passar, ou para cima para um Super Like!',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        icon: 'ri-heart-3-line',
        title: 'Matches',
        description: 'Veja quem curtiu seu perfil! Se você curtir de volta, um Match acontece e vocês podem conversar.',
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
    {
        icon: 'ri-chat-3-line',
        title: 'Chat',
        description: 'Onde a conexão acontece. Converse com seus matches em um ambiente seguro e respeitoso.',
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10'
    },
    {
        icon: 'ri-user-3-line',
        title: 'Perfil',
        description: 'Personalize suas fotos, bio e detalhes sobre sua fé. Perfis completos ganham mais destaque!',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    }
];

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 h-[65vh] max-h-[65vh] outline-none">
                <div className="mx-auto w-full max-w-sm px-6 flex flex-col h-full overflow-hidden relative">
                    {/* Botão de Fechar Discreto */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground/60 active:scale-95 transition-all z-30"
                    >
                        <i className="ri-close-line text-xl" />
                    </button>

                    <DrawerHeader className="px-0 pt-8 shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 mx-auto">
                            <i className="ri-question-line text-4xl" />
                        </div>
                        <DrawerTitle className="text-3xl font-display font-bold text-center">Como funciona o App?</DrawerTitle>
                        <DrawerDescription className="text-center text-muted-foreground text-sm mt-1">
                            Guia rápido para você aproveitar ao máximo sua jornada.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 overscroll-contain px-1">
                        {helpItems.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-5 p-5 rounded-2xl bg-card border border-border/40 shadow-sm"
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", item.bgColor, item.color)}>
                                    <i className={cn(item.icon, "text-2xl")} />
                                </div>
                                <div className="space-y-1.5 pt-0.5">
                                    <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-4 pb-10 shrink-0">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Entendi!
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
