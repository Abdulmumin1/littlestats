// Better-Auth client for LittleStats frontend
// Connects to the dashboard API for authentication

import { createAuthClient } from "better-auth/client";

// Get the API URL from environment or use default
const authBaseURL = import.meta.env.VITE_DASHBOARD_URL || 'https://stats.littlestats.click';

// Get the frontend base URL
const frontendBaseURL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');

// Create better-auth client with credentials enabled for cookie sharing
export const authClient = createAuthClient({
  baseURL: authBaseURL,
  fetchOptions: {
    credentials: 'include', // Required for cookies to be sent cross-domain
  },
});

// Export individual methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  deleteUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  changeEmail,
  changePassword,
  updatePassword,
  twoFactor,
  oauth,
  credential,
} = authClient;

// Helper to build full callback URL
export function getCallbackURL(path: string = '/sites'): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${frontendBaseURL}${cleanPath}`;
}

export default authClient;
