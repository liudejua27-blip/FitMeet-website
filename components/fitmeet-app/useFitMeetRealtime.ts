"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FITMEET_REALTIME_BASE_URL } from "@/lib/fitmeet-api-contract";

export type FitMeetRealtimeEvent = {
  eventId: string;
  eventType: string;
  userId: number;
  payload: Record<string, unknown>;
  createdAt: string;
};

type RealtimeStatus = "offline" | "connecting" | "connected" | "reconnecting";

/**
 * Realtime payloads never mutate business state directly.  They only tell a
 * signed-in client what to reload, which keeps authorization and recovery on
 * the normal HTTP contract after reconnects or missed browser wake-ups.
 */
export function useFitMeetRealtime(
  accessToken: string | undefined,
  onEvent: (event: FitMeetRealtimeEvent) => void,
  onResync: () => void,
) {
  const eventRef = useRef(onEvent);
  const resyncRef = useRef(onResync);
  const seenEventIds = useRef(new Set<string>());
  const connectedOnce = useRef(false);
  const [status, setStatus] = useState<RealtimeStatus>("offline");

  useEffect(() => { eventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { resyncRef.current = onResync; }, [onResync]);

  useEffect(() => {
    if (!accessToken) {
      connectedOnce.current = false;
      setStatus("offline");
      return;
    }
    setStatus("connecting");
    const socket = io(`${FITMEET_REALTIME_BASE_URL}/realtime`, {
      path: "/socket.io/",
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      reconnectionDelayMax: 15_000,
      randomizationFactor: 0.35,
    });
    const onConnect = () => {
      const wasConnected = connectedOnce.current;
      connectedOnce.current = true;
      setStatus("connected");
      if (wasConnected) resyncRef.current();
    };
    const onDisconnect = () => setStatus("reconnecting");
    const onEventPayload = (event: FitMeetRealtimeEvent) => {
      if (!event?.eventId || seenEventIds.current.has(event.eventId)) return;
      seenEventIds.current.add(event.eventId);
      if (seenEventIds.current.size > 200) seenEventIds.current = new Set([...seenEventIds.current].slice(-100));
      eventRef.current(event);
    };
    const onWake = () => {
      if (document.visibilityState === "visible") {
        socket.connect();
        resyncRef.current();
      }
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect_attempt", () => setStatus("reconnecting"));
    socket.on("realtime:event", onEventPayload);
    window.addEventListener("online", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      window.removeEventListener("online", onWake);
      document.removeEventListener("visibilitychange", onWake);
      socket.close();
    };
  }, [accessToken]);

  return status;
}
