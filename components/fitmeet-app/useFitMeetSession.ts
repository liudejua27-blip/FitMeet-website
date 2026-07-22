"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FitMeetApiClient } from "@/lib/fitmeet-api-client";
import type { AuthSession, OnboardingStatus, SocialProfile } from "@/lib/fitmeet-api-contract";

type StoredSession = Pick<AuthSession, "accessToken">;

export type FitMeetSessionState = {
  status: "loading" | "anonymous" | "authenticated";
  session: AuthSession | null;
  onboarding: OnboardingStatus | null;
  socialProfile: SocialProfile | null;
  error: string | null;
};

const initialState: FitMeetSessionState = { status: "loading", session: null, onboarding: null, socialProfile: null, error: null };

export function useFitMeetSession() {
  const storedRef = useRef<StoredSession | null>(null);
  const [state, setState] = useState<FitMeetSessionState>(initialState);
  const api = useMemo(() => new FitMeetApiClient(() => storedRef.current?.accessToken ?? null), []);

  const loadAuthenticatedState = useCallback(async (tokens: StoredSession) => {
    storedRef.current = tokens;
    const [user, onboarding, socialProfile] = await Promise.all([
      api.getAuthProfile(),
      api.getOnboardingStatus(),
      api.getSocialProfile(),
    ]);
    const session: AuthSession = { ...tokens, user };
    setState({ status: "authenticated", session, onboarding, socialProfile, error: null });
    return { session, onboarding, socialProfile };
  }, [api]);

  const refresh = useCallback(async () => {
    try {
      const renewed = await api.refreshInternalTesterSession();
      return loadAuthenticatedState({ accessToken: renewed.accessToken });
    } catch (error) {
      storedRef.current = null;
      throw error;
    }
  }, [api, loadAuthenticatedState]);

  useEffect(() => {
    void refresh().catch(() => {
      storedRef.current = null;
      // Remove credentials left by earlier website versions. Refresh tokens
      // now live only in an HttpOnly cookie and access tokens stay in memory.
      window.localStorage.removeItem("fitmeet:web-session:v1");
      setState({ ...initialState, status: "anonymous", error: null });
    });
  }, [refresh]);

  const login = useCallback(async (accessCode: string) => {
    const authenticated = await api.loginInternalTester(accessCode);
    return loadAuthenticatedState({ accessToken: authenticated.accessToken });
  }, [api, loadAuthenticatedState]);

  const logout = useCallback(() => {
    void api.logoutInternalTester();
    storedRef.current = null;
    setState({ ...initialState, status: "anonymous", error: null });
  }, [api]);

  const setSocialProfile = useCallback((socialProfile: SocialProfile) => {
    setState((current) => ({ ...current, socialProfile }));
  }, []);

  const setOnboarding = useCallback((onboarding: OnboardingStatus) => {
    setState((current) => ({ ...current, onboarding }));
  }, []);

  return { api, state, login, logout, refresh, setSocialProfile, setOnboarding };
}
