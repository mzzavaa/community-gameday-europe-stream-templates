import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// window.remotion_staticBase is set in index.html before this module loads,
// so staticFile() calls at module level in compositions get the correct base path.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
