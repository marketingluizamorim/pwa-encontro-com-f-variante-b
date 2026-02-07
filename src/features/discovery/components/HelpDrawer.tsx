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
            <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 h-[92vh] max-h-[92vh]">
                <div className="mx-auto w-full max-w-sm px-6 flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="px-0 pt-6 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 mx-auto">
                            <i className="ri-question-line text-3xl" />
                        </div>
                        <DrawerTitle className="text-2xl font-display font-bold text-center">Como funciona o App?</DrawerTitle>
                        <DrawerDescription className="text-center text-muted-foreground">
                            Guia rápido para você aproveitar ao máximo sua jornada.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 overscroll-contain">
                        {helpItems.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.bgColor, item.color)}>
                                    <i className={cn(item.icon, "text-xl")} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-4 pb-10 shrink-0">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Entendi!
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
