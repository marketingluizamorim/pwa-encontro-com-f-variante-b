import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Zap } from 'lucide-react';

interface SuperLikeMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profileName: string;
    profilePhoto: string;
    onConfirm: (message: string) => void;
}

export function SuperLikeMessageDialog({
    open,
    onOpenChange,
    profileName,
    profilePhoto,
    onConfirm,
}: SuperLikeMessageDialogProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        // Simulate slight delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));
        onConfirm(message);
        setSending(false);
        setMessage('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90%] sm:max-w-md rounded-2xl p-0 overflow-hidden border-none bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

                <DialogHeader className="pt-8 px-6 text-center relative z-10">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 ring-4 ring-blue-500/10">
                        <Zap className="w-8 h-8 text-blue-400 fill-blue-400 animate-pulse" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                        Super Like em {profileName}
                    </DialogTitle>
                    <p className="text-blue-200/70 text-sm mt-2">
                        Sua mensagem aparecerá com destaque para {profileName} e terá prioridade na caixa de entrada.
                    </p>
                </DialogHeader>

                <div className="p-6 space-y-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <img
                            src={profilePhoto}
                            alt={profileName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30 flex-shrink-0"
                        />
                        <div className="flex-1 relative bg-white/5 rounded-xl border border-white/10 p-3">
                            <div className="absolute -left-[6px] top-4 w-3 h-3 bg-[#162032] border-l border-t border-white/10 -rotate-45" />
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Escreva algo especial para chamar a atenção..."
                                className="min-h-[100px] bg-transparent border-none text-white placeholder:text-white/30 resize-none focus-visible:ring-0 focus-visible:outline-none p-0 text-base leading-relaxed pl-2 relative z-10"
                                maxLength={280}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-blue-200/40 px-1">
                        <span>Seja respeitoso e autêntico</span>
                        <span>{message.length}/280</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 text-white/50 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!message.trim() || sending}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 border-none"
                        >
                            {sending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </div>
                            ) : (
                                "Enviar Super Like"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
