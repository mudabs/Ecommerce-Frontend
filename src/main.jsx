import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './store/reducers/store';
import { Provider } from 'react-redux';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </Provider>
  
)
