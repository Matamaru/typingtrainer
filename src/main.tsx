import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app/App";
import { registerServiceWorker } from "./app/offline/register-service-worker";
import "./styles/base.css";
import "./styles/app.css";

void registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
