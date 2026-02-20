import { useEffect } from 'react';

/**
 * Enables scrolling on <body> while this component is mounted.
 * Restores overflow:hidden on unmount (the global default for the app).
 */
export function useBodyScroll() {
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;

        html.style.overflow = 'auto';
        body.style.overflow = 'auto';

        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
        };
    }, []);
}
