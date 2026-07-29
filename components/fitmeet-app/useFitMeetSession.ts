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
      const renewed = await api.refreshWebSession();
      return loadAuthenticatedState({ accessToken: renewed.accessToken });
    } catch (error) {
      storedRef.current = null;
      throw error;
    }
  }, [api, loadAuthenticatedState]);

  useEffect(() => {
    const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("SESSION_CHECK_TIMEOUT")), 4500));
    void Promise.race([refresh(), timeout]).catch(() => {
      storedRef.current = null;
      // Remove credentials left by earlier website versions. Refresh tokens
      // now live only in an HttpOnly cookie and access tokens stay in memory.
      window.localStorage.removeItem("fitmeet:web-session:v1");
      setState({ ...initialState, status: "anonymous", error: null });
    });
  }, [refresh]);

  const login = useCallback(async (phone: string, code: string) => {
    const authenticated = await api.loginWebByPhone(phone, code);
    return loadAuthenticatedState({ accessToken: authenticated.accessToken });
  }, [api, loadAuthenticatedState]);

  const sendSmsCode = useCallback((phone: string) => api.sendWebSmsCode(phone), [api]);

  const logout = useCallback(async () => {
    try {
      await api.logoutWebSession();
      storedRef.current = null;
      setState({ ...initialState, status: "anonymous", error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "退出暂未完成，请稍后重试。";
      setState((current) => ({ ...current, error: message }));
      throw error;
    }
  }, [api]);

  const setSocialProfile = useCallback((socialProfile: SocialProfile) => {
    setState((current) => ({ ...current, socialProfile }));
  }, []);

  const setOnboarding = useCallback((onboarding: OnboardingStatus) => {
    setState((current) => ({ ...current, onboarding }));
  }, []);

  return { api, state, login, sendSmsCode, logout, refresh, setSocialProfile, setOnboarding };
}
