import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet-async";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import store from "../redux/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Helmet>
        <link rel="icon" type="image/png" href="/icons/logo3.png" />
        <title>MoonFox</title>
      </Helmet>
      <App />
    </Provider>
  </StrictMode>,
);
