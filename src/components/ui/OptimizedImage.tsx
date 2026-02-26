import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackSrc?: string;
    containerClassName?: string;
    fetchPriority?: 'high' | 'low' | 'auto';
}

export function OptimizedImage({
    src,
    fallbackSrc = '/placeholder.svg',
    className,
    containerClassName,
    alt,
    loading = "eager",
    decoding = "async",
    fetchPriority,
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>(src);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setIsLoaded(false);
        setError(false);
        setCurrentSrc(src);

        // Safety net: if onLoad never fires within 3s, reveal image anyway
        // This handles browser lazy-intervention replacing images with placeholders
        timeoutRef.current = setTimeout(() => {
            setIsLoaded(true);
        }, 3000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsLoaded(true);
        if (props.onLoad) props.onLoad(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!error) {
            setError(true);
            setCurrentSrc(fallbackSrc);
            setIsLoaded(true);
        }
        if (props.onError) props.onError(e);
    };

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {!isLoaded && !error && (
                <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none" />
            )}

            <img
                src={currentSrc}
                alt={alt}
                className={cn(
                    "transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading={loading}
                decoding={decoding}
                // Pass fetchpriority as lowercase to satisfy React 18 DOM requirements
                {...(fetchPriority ? { fetchpriority: fetchPriority } as unknown as React.ImgHTMLAttributes<HTMLImageElement> : {})}
                {...props}
            />
        </div>
    );
}
