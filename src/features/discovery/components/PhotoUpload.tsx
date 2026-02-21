import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('Você precisa estar logado', { style: { marginTop: '50px' } });
      return null;
    }

    // Mock/test users: bypass storage
    if (user.id.startsWith('mock-')) {
      return URL.createObjectURL(file);
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas', { style: { marginTop: '50px' } });
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 5MB)', { style: { marginTop: '50px' } });
      return null;
    }

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: unknown) {
      console.error('Upload error details:', error);
      const msg = (error as Error)?.message || 'Erro desconhecido';
      toast.error(`Erro ao enviar foto: ${msg}. Tente novamente.`, { style: { marginTop: '50px' } });
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error(`Máximo de ${maxPhotos} fotos`, { style: { marginTop: '50px' } });
      return;
    }

    setUploading(true);

    const newPhotos = [...photos];

    for (let i = 0; i < filesToUpload.length; i++) {
      setUploadingIndex(newPhotos.length);
      const url = await uploadPhoto(filesToUpload[i]);
      if (url) {
        newPhotos.push(url);
        onPhotosChange([...newPhotos]);
      }
    }

    setUploading(false);
    setUploadingIndex(null);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];

    try {
      const urlParts = photoUrl.split('/profile-photos/');
      if (urlParts.length > 1) {
        await supabase.storage.from('profile-photos').remove([urlParts[1]]);
      }
    } catch {
      // Non-critical: photo removed from UI even if storage cleanup fails
    }

    // Update photos array
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast.success('Foto removida', { style: { marginTop: '50px' } });
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onPhotosChange(newPhotos);
    toast.success('Foto principal atualizada', { style: { marginTop: '50px' } });
  };

  return (
    <div className="space-y-6 w-full select-none">
      {/* Main Photo Area */}
      <div className="flex flex-col items-center w-full">
        {photos.length > 0 ? (
          <motion.div
            key={photos[0]}
            layoutId="main-photo"
            className="relative w-full max-w-[200px] aspect-[3/4] rounded-3xl overflow-hidden bg-white/5 border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.15)] group"
          >
            <img
              src={photos[0]}
              alt="Foto Principal"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-wider shadow-lg z-10">
              Principal
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
              <button
                onClick={() => removePhoto(0)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/90 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={14} /> Remover
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[200px] aspect-[3/4] rounded-3xl border-2 border-dashed border-[#d4af37]/30 bg-[#d4af37]/5 flex flex-col items-center justify-center gap-3 hover:bg-[#d4af37]/10 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div className="text-center px-4">
              <span className="block text-[#d4af37] font-bold text-xs mb-1 uppercase tracking-wide">Adicionar Principal</span>
              <span className="text-white/40 text-[10px] leading-tight block">Foto mais importante do seu perfil</span>
            </div>
          </button>
        )}
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* Secondary Photos Grid */}
      <div>
        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Fotos Adicionais</p>
        <div className={cn(
          "grid gap-3 transition-all duration-300 ease-in-out",
          (() => {
            const secondaryCount = Math.max(0, photos.length - 1);
            const showAdd = photos.length < maxPhotos;
            const totalItems = secondaryCount + (showAdd ? 1 : 0);
            // Min 3 cols (larger), Max 5 cols (smaller to fit 5)
            const cols = Math.min(5, Math.max(3, totalItems));
            return {
              3: "grid-cols-3",
              4: "grid-cols-4",
              5: "grid-cols-5",
            }[cols];
          })()
        )}>
          <AnimatePresence mode="popLayout">
            {photos.slice(1).map((photo, i) => {
              const realIndex = i + 1;
              return (
                <motion.div
                  key={photo}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                >
                  <img
                    src={photo}
                    alt={`Foto ${realIndex + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => setAsMain(realIndex)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-[#d4af37] flex items-center justify-center text-white transition-colors"
                      title="Tornar Principal"
                    >
                      <Camera size={14} />
                    </button>
                    <button
                      onClick={() => removePhoto(realIndex)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                      title="Remover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Small Add Button - Only show if we have a main photo AND less than max */}
            {photos.length > 0 && photos.length < maxPhotos && (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-[3/4] rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-white/30" />
                    <span className="text-[10px] uppercase font-bold text-white/30">Adicionar</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
