import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './lesson.css';
import './lesson-v02.css';
import './lesson-v03.css';
import './lesson-v04.css';
import './lesson-v05.css';
import './v1.css';

const root = document.getElementById('root');

if (!root) throw new Error('PolyYaps root element not found.');

createRoot(root).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
