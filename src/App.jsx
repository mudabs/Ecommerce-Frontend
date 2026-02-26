
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
import AIAssistant from './components/AIAssistant';

const SignInPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  </div>
);

const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  </div>
);

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
      <AIAssistant />
      <Routes>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
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
