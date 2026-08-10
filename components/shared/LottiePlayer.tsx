import Lottie from "lottie-react";

interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

function LottiePlayer({ animationData, loop = true, autoplay = true, className }: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}

export default LottiePlayer;
