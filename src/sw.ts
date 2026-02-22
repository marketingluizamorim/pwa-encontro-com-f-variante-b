/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache resources
precacheAndRoute(self.__WB_MANIFEST);

// Handle Push Notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || 'Encontro com Fé';
        const options = {
            body: data.body || 'Você tem uma nova atualização!',
            icon: '/pwa-192x192.png',
            badge: '/badge-72x72.png', // You should create this or use a transparent one
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
            // Check if there is already a window tab open with the same URL
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
