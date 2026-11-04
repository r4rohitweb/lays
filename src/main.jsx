import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/styles.css";
import "./styles/bowl.css";
import "./styles/intro.css";
import "./styles/flavors.css";
import "./styles/storm.css";
import "./styles/packet-flight.css";
import "./styles/shop-effects.css";
import "./styles/footer.css";
import "./styles/rail-flip.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
