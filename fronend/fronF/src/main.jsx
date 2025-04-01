import React from "react";
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ApoloProvider } from "./components/ApoloContext.jsx";

createRoot(document.getElementById('root')).render(
  <ApoloProvider>
    <App />
  </ApoloProvider>
);
