import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
