import { Composition } from "remotion";
import { SocialWorldLoop } from "./SocialWorldLoop";

export const RemotionRoot = () => {
  return (
    <Composition
      id="SocialWorldLoop"
      component={SocialWorldLoop}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
