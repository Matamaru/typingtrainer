import { HashRouter } from "react-router-dom";

import { AppBootstrap } from "./AppBootstrap";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <HashRouter>
      <AppBootstrap>
        <AppRoutes />
      </AppBootstrap>
    </HashRouter>
  );
}
