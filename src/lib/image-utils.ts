/**
 * Utility for handling image transformations with Supabase Storage.
 * This helps reduce bundle size and improve loading speed on mobile devices/4G.
 */

interface TransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'origin';
}

export function getOptimizedImageUrl(url: string | undefined | null, options: TransformOptions = {}) {
    if (!url) return '/placeholder.svg';

    // Only transform Supabase storage URLs
    if (!url.includes('.supabase.co/storage/v1/object/public/')) {
        return url;
    }

    const { width = 400, height = 600, quality = 75, format = 'webp' } = options;

    // Append transformation parameters if not already present
    const separator = url.includes('?') ? '&' : '?';
    const params = new URLSearchParams();

    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    if (quality) params.append('quality', quality.toString());
    // Supabase supports format=origin or automatic webp conversion in some tiers/configs
    // Here we just use the basic width/height/quality which are widely supported.

    return `${url}${separator}${params.toString()}`;
}

/**
 * Common image sizes for the app
 */
export const IMAGE_SIZES = {
    THUMBNAIL: { width: 150, height: 150, quality: 60 },
    PROFILE_CARD: { width: 400, height: 600, quality: 75 },
    FULL_SCREEN: { width: 800, height: 1200, quality: 80 },
    AVATAR: { width: 80, height: 80, quality: 70 },
};
