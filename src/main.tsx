import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './components/styles/Variables.css';
import './components/styles/Global.css';
import './components/styles/Insights.css';
import App from './App';

// HashRouter keeps deep links working on static hosting without server rewrites
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
