import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeAudio } from "./lib/notifications";

import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize audio context on first user interaction
initializeAudio();

// Global unhandled promise rejection handler (production safety)
window.addEventListener('unhandledrejection', (event) => {
    if (import.meta.env.DEV) {
        console.error('Unhandled promise rejection:', event.reason);
    }
    event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
