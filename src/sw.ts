/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache resources
precacheAndRoute(self.__WB_MANIFEST);

import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { WorkboxPlugin } from 'workbox-core';

// Custom plugin to force caching even with restrictive headers
const forceCachePlugin: WorkboxPlugin = {
    cacheWillUpdate: async ({ response }) => {
        if (response && response.status === 200) {
            return response;
        }
        return null;
    }
};

// Cache Supabase API requests with NetworkFirst strategy
registerRoute(
    ({ url }) => url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/v1/'),
    new NetworkFirst({
        cacheName: 'supabase-api-cache',
        networkTimeoutSeconds: 3,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache Supabase Storage images
registerRoute(
    ({ url }) => url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/public/'),
    new CacheFirst({
        cacheName: 'supabase-image-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
            forceCachePlugin,
        ],
    })
);

// Handle Push Notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || 'Encontro com Fé';
        const options = {
            body: data.body || 'Você tem uma nova atualização!',
            icon: '/pwa-192x192.png',
            badge: '/badge-72x72.png',
            data: {
                url: data.url || '/'
            },
            vibrate: [100, 50, 100],
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (e) {
        console.error('Error receiving push notification:', e);

        // Fallback for simple text push
        const text = event.data.text();
        event.waitUntil(
            self.registration.showNotification('Encontro com Fé', {
                body: text,
                icon: '/pwa-192x192.png',
            })
        );
    }
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
