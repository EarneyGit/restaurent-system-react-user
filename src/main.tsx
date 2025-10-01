import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Inject CSP meta to upgrade insecure requests
if (import.meta.env?.VITE_ALLOW_INSECURE_REQUESTS === "true") {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = "upgrade-insecure-requests";
  document.head.appendChild(meta);
}

createRoot(document.getElementById("root")!).render(<App />);
