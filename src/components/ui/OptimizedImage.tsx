import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackSrc?: string;
    containerClassName?: string;
}

export function OptimizedImage({
    src,
    fallbackSrc = '/placeholder.svg',
    className,
    containerClassName,
    alt,
    loading = "lazy",
    decoding = "async",
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>(src);

    useEffect(() => {
        setIsLoaded(false);
        setError(false);
        setCurrentSrc(src);
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoaded(true);
        if (props.onLoad) props.onLoad(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!error) {
            setError(true);
            setCurrentSrc(fallbackSrc);
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
                    "transition-opacity duration-500",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading={loading}
                decoding={decoding}
                {...props}
            />
        </div>
    );
}
