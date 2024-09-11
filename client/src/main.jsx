import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "../src/styles/main.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import { SocketProvider } from "./context/socketContext.jsx";
import { ActiveChatProvider } from "./context/activeChatContext.jsx";
import { ActiveGroupProvider } from "./context/activeGroupContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <BrowserRouter>
      <AuthProvider>
        <ActiveGroupProvider>
          <ActiveChatProvider>
            <App />
          </ActiveChatProvider>
        </ActiveGroupProvider>
      </AuthProvider>
    </BrowserRouter>
  </SocketProvider>
);
