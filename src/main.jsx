import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App.jsx";
import { store } from "./store/store.js";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);