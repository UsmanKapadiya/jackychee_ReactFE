import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import './styles.css';

// Old WordPress filter links used "/#!portfolio-type/<slug>/" - convert them to real URLs
const legacy = window.location.hash.match(/^#!\/?portfolio-type\/([^/]+)/);
if (legacy) {
  window.history.replaceState(null, '', `/portfolio-type/${legacy[1]}`);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
