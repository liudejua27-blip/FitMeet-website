"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FitMeetApiClient } from "@/lib/fitmeet-api-client";
import type { AuthSession, OnboardingStatus, SocialProfile } from "@/lib/fitmeet-api-contract";
import {
  beginFitMeetAuthRequest,
  fitMeetSessionCredentialMatches,
  invalidateFitMeetAuthRequest,
  isCurrentFitMeetAuthRequest,
} from "@/lib/fitmeet-login-state";
import type { FitMeetRegistrationConsent } from "@/lib/fitmeet-registration-consent";

type StoredSession = Pick<AuthSession, "accessToken">;

export type FitMeetSessionState = {
  status: "loading" | "anonymous" | "authenticated";
  session: AuthSession | null;
  onboarding: OnboardingStatus | null;
  socialProfile: SocialProfile | null;
  error: string | null;
};

const initialState: FitMeetSessionState = { status: "loading", session: null, onboarding: null, socialProfile: null, error: null };

// A refresh token rotates after use. React Strict Mode and route transitions can
// mount two session consumers at the same time, so every caller must share the
// same in-flight refresh instead of consuming the HttpOnly cookie twice.
let pendingWebSessionRefresh: Promise<AuthSession> | null = null;

function refreshWebSessionOnce(api: FitMeetApiClient) {
  if (pendingWebSessionRefresh) return pendingWebSessionRefresh;
  const request = api.refreshWebSession();
  pendingWebSessionRefresh = request;
  const clear = () => {
    if (pendingWebSessionRefresh === request) pendingWebSessionRefresh = null;
  };
  request.then(clear, clear);
  return request;
}

export function useFitMeetSession() {
  const storedRef = useRef<StoredSession | null>(null);
  const authRequestEpochRef = useRef(0);
  const [state, setState] = useState<FitMeetSessionState>(initialState);
  const api = useMemo(() => new FitMeetApiClient(() => storedRef.current?.accessToken ?? null), []);

  const loadAuthenticatedState = useCallback(async (
    tokens: StoredSession,
    requestEpoch: number,
  ) => {
    if (!isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch))
      throw new Error("AUTH_REQUEST_SUPERSEDED");
    // Keep every authentication hydration bound to the token that started it.
    // A stable client reads storedRef dynamically and could otherwise let an
    // older refresh continue its profile requests with a newer account token.
    const requestApi = new FitMeetApiClient(() => tokens.accessToken);
    const [user, onboarding, socialProfile] = await Promise.all([
      requestApi.getAuthProfile(),
      requestApi.getOnboardingStatus(),
      requestApi.getSocialProfile(),
    ]);
    if (!isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch))
      throw new Error("AUTH_REQUEST_SUPERSEDED");
    const session: AuthSession = { ...tokens, user };
    storedRef.current = tokens;
    setState({ status: "authenticated", session, onboarding, socialProfile, error: null });
    return { session, onboarding, socialProfile };
  }, []);

  const refreshAtEpoch = useCallback(async (requestEpoch: number) => {
    try {
      const renewed = await refreshWebSessionOnce(api);
      return await loadAuthenticatedState({ accessToken: renewed.accessToken }, requestEpoch);
    } catch (error) {
      if (isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch))
        storedRef.current = null;
      throw error;
    }
  }, [api, loadAuthenticatedState]);

  const refresh = useCallback(() => {
    const requestEpoch = beginFitMeetAuthRequest(authRequestEpochRef);
    return refreshAtEpoch(requestEpoch);
  }, [refreshAtEpoch]);

  useEffect(() => {
    const requestEpoch = beginFitMeetAuthRequest(authRequestEpochRef);
    void refreshAtEpoch(requestEpoch).catch(() => {
      if (!invalidateFitMeetAuthRequest(authRequestEpochRef, requestEpoch)) return;
      storedRef.current = null;
      // Remove credentials left by earlier website versions. Refresh tokens
      // now live only in an HttpOnly cookie and access tokens stay in memory.
      window.localStorage.removeItem("fitmeet:web-session:v1");
      setState({ ...initialState, status: "anonymous", error: null });
    });
    return () => {
      invalidateFitMeetAuthRequest(authRequestEpochRef, requestEpoch);
    };
  }, [refreshAtEpoch]);

  const login = useCallback(async (email: string, password: string) => {
    const requestEpoch = beginFitMeetAuthRequest(authRequestEpochRef);
    try {
      const authenticated = await api.loginWebByEmail(email, password);
      return await loadAuthenticatedState({ accessToken: authenticated.accessToken }, requestEpoch);
    } catch (error) {
      if (isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch))
        storedRef.current = null;
      throw error;
    }
  }, [api, loadAuthenticatedState]);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    consents: FitMeetRegistrationConsent,
  ) => {
    return api.registerWebByEmail(email, password, name, consents);
  }, [api]);

  const resendEmailVerification = useCallback(async (email: string) => {
    return api.resendWebEmailVerification(email);
  }, [api]);

  const logout = useCallback(async () => {
    const requestEpoch = beginFitMeetAuthRequest(authRequestEpochRef);
    try {
      await api.logoutWebSession();
      if (!isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch)) return;
      storedRef.current = null;
      setState({ ...initialState, status: "anonymous", error: null });
    } catch (error) {
      if (!isCurrentFitMeetAuthRequest(authRequestEpochRef, requestEpoch)) return;
      const message = error instanceof Error ? error.message : "退出暂未完成，请稍后重试。";
      setState((current) => ({ ...current, error: message }));
      throw error;
    }
  }, [api]);

  const setSocialProfile = useCallback((
    socialProfile: SocialProfile,
    expectedAccessToken: string | null,
  ) => {
    setState((current) => {
      if (
        current.status !== "authenticated" ||
        !fitMeetSessionCredentialMatches(current.session?.accessToken, expectedAccessToken)
      )
        return current;
      return { ...current, socialProfile };
    });
  }, []);

  const setOnboarding = useCallback((
    onboarding: OnboardingStatus,
    expectedAccessToken: string | null,
  ) => {
    setState((current) => {
      if (
        current.status !== "authenticated" ||
        !fitMeetSessionCredentialMatches(current.session?.accessToken, expectedAccessToken)
      )
        return current;
      return { ...current, onboarding };
    });
  }, []);

  return { api, state, login, register, resendEmailVerification, logout, refresh, setSocialProfile, setOnboarding };
}
