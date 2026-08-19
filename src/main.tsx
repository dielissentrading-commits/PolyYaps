import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './lesson.css';
import './lesson-v02.css';
import './lesson-v03.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('PolyYaps root element not found.');
}

createRoot(root).render(<App />);
