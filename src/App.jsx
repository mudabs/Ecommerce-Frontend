
import './App.css'
import { Routes, Route } from 'react-router-dom';
import {
  SignIn,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react';
import Products from './components/Products';

const RequireAuth = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignIn />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Products />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App
