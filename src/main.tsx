import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeAudio } from "./lib/notifications";

import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize audio context on first user interaction
console.log("Starting App...");
initializeAudio();

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
