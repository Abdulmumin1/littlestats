// Better-Auth client for LittleStats frontend
// Connects to the dashboard API for authentication

import { createAuthClient } from "better-auth/client";

// Local `.env` values must never be baked into a production auth bundle.
// Cloudflare runtime vars are not available through `import.meta.env`, so use
// the configured URL only in Vite development and pin production to the API.
const authBaseURL = import.meta.env.DEV
  ? (import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:8787')
  : 'https://stats.littlestats.click';

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

export default authClient;
