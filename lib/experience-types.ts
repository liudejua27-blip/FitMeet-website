export type SocialFieldMode = "home" | "world" | "agent" | "moments" | "safety" | "app" | "about";

export type MotionScene = {
  id: string;
  start: string;
  end: string;
  scrub?: number;
  reducedMotion: "static" | "short" | "hidden";
};

export type RouteTransitionContext = {
  from: string;
  to: string;
  direction: "forward" | "back";
};

export type MediaAssetMeta = {
  src: string;
  source: "generated" | "stock" | "owned";
};

export type SoundPreference = "off" | "ambient";

export type HomeCinematicPhase = "arrival" | "depth" | "gather" | "passage" | "handoff";

export type WorldSceneState = {
  selectedId: "life" | "sport" | "social" | "help";
  query: string;
  category: string;
  expanded: boolean;
};

export type AppDemoScreen = "assistant" | "plan";

export type AppStagePhase = "device" | "expandedAssistant" | "expandedPlan";

export type AppDemoScenario = {
  id: "sport" | "travel" | "photo";
  label: string;
  intent: string;
  title: string;
  time: string;
  place: string;
  people: string;
  budget: string;
  boundary: string;
  asset: string;
};
