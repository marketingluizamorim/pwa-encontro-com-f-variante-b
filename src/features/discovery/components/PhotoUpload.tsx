import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Camera, X, Plus, Loader2, GripVertical } from 'lucide-react';
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
      toast.error('Você precisa estar logado');
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 5MB)');
      return null;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar foto');
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error(`Máximo de ${maxPhotos} fotos`);
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

    // Extract file path from URL
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const urlParts = photoUrl.split('/profile-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('profile-photos').remove([filePath]);
      }
    } catch (error) {
      console.warn('Could not delete from storage:', error);
    }

    // Update photos array
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast.success('Foto removida');
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const [photo] = newPhotos.splice(index, 1);
    newPhotos.unshift(photo);
    onPhotosChange(newPhotos);
    toast.success('Foto principal atualizada');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Suas fotos</h3>
        <span className="text-sm text-muted-foreground">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <motion.div
              key={photo}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'relative aspect-[3/4] rounded-xl overflow-hidden bg-muted group',
                index === 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {index !== 0 && (
                    <button
                      onClick={() => setAsMain(index)}
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-foreground hover:bg-white transition-colors"
                      title="Definir como principal"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removePhoto(index)}
                    className="w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center text-white hover:bg-destructive transition-colors"
                    title="Remover foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Principal
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow" />
              </div>
            </motion.div>
          ))}

          {/* Upload button */}
          {photos.length < maxPhotos && (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/30',
                'flex flex-col items-center justify-center gap-2',
                'hover:border-primary/50 hover:bg-muted/50 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Adicionar</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        A primeira foto será sua foto principal. Toque para reordenar.
      </p>
    </div>
  );
}
