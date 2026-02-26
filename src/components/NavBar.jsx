import { Link } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignUp,
  useUser,
} from '@clerk/clerk-react';

// simple top navigation bar with application name and auth controls
export default function NavBar() {
  const { user } = useUser();

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <Link to="/" className="text-xl font-bold">
        SmartCart
      </Link>
      <div className="flex items-center space-x-4">
        <SignedIn>
          {/* display name and user button */}
          {user && (
            <span className="text-sm font-medium">
              {user.fullName || user.firstName || user.username}
            </span>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>
        <SignedOut>
          <Link
            to="/sign-in"
            className="text-sm text-blue-600 hover:underline"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="text-sm text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}
