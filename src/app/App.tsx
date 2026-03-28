import { BrowserRouter } from "react-router-dom";

import { AppBootstrap } from "./AppBootstrap";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AppBootstrap>
        <AppRoutes />
      </AppBootstrap>
    </BrowserRouter>
  );
}
