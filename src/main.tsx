import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('failed to connect to websocket') || msg.includes('WebSocket closed without opened')) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('Firestore') && msg.includes('transport errored')) {
    return;
  }
  originalConsoleWarn(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('WebSocket closed without opened')) {
    event.preventDefault();
  }
});

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
