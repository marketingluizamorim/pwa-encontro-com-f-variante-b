import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeAudio } from "./lib/notifications";

// Initialize audio context on first user interaction
initializeAudio();

createRoot(document.getElementById("root")!).render(<App />);
