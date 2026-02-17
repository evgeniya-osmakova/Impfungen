import { create } from 'zustand';
import {
  beginOAuthLogin,
  clearOAuthSession,
  completeOAuthLogin,
  getOAuthSession,
  isOAuthConfigured,
} from '../auth/oauth';
import type { AuthError } from '../interfaces/auth';

interface AuthStore {
  authError: AuthError | null;
  completeLoginFromCallback: () => Promise<void>;
  handleAuthClick: () => Promise<void>;
  initialize: () => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  oauthConfigured: boolean;
}

const getInitialAuthState = () => ({
  authError: null,
  isAuthenticated: Boolean(getOAuthSession()),
  isInitialized: false,
  isInitializing: false,
  oauthConfigured: isOAuthConfigured(),
});

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getInitialAuthState(),
  completeLoginFromCallback: async () => {
    const result = await completeOAuthLogin();

    if (result.status === 'idle') {
      return;
    }

    if (result.status === 'success') {
      set({ authError: null, isAuthenticated: true });

      return;
    }

    set({
      authError: { code: result.code, details: result.details },
      isAuthenticated: Boolean(getOAuthSession()),
    });
  },
  handleAuthClick: async () => {
    if (get().isAuthenticated) {
      clearOAuthSession();
      set({ authError: null, isAuthenticated: false });

      return;
    }

    const oauthConfigured = isOAuthConfigured();
    set({ oauthConfigured });

    if (!oauthConfigured) {
      set({ authError: { code: 'config_missing' } });

      return;
    }

    try {
      await beginOAuthLogin();
    } catch (error: unknown) {
      set({
        authError: {
          code: 'unexpected',
          details: error instanceof Error ? error.message : undefined,
        },
      });
    }
  },
  initialize: async () => {
    const state = get();

    if (state.isInitialized || state.isInitializing) {
      return;
    }

    set({ isInitializing: true });
    await state.completeLoginFromCallback();
    set({ isInitialized: true, isInitializing: false });
  },
}));
