
import './App.css'
import { Routes, Route } from 'react-router-dom';
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react';
import Products from './components/Products';
import NavBar from './components/NavBar';

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
    <>
      <NavBar />
      <Routes>
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Products />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default App
