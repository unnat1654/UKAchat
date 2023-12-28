import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../src/styles/main.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
