// src/main.tsx (or wherever your router is)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext.tsx'; // 👈 Import the provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* 👈 Wrap your App */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);