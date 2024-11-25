import Lottie, { AnimationItem } from "lottie-web"
import React, { useEffect, useRef } from "react"

export interface LottieAnimationProps {
  animationData: any
  loop?: boolean
  autoplay?: boolean
  width?: number | string
  height?: number | string
  className?: string
  onComplete?: () => void
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  width = "100%",
  height = "100%",
  className,
  onComplete,
}) => {
  const animationContainer = useRef<HTMLDivElement>(null)
  const animationInstance = useRef<AnimationItem | null>(null)
  const animationProgress = useRef<number>(0)

  useEffect(() => {
    if (animationContainer.current) {
      animationInstance.current = Lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop,
        autoplay,
        animationData,
      })

      if (onComplete) {
        animationInstance.current.addEventListener("loopComplete", onComplete)
      }

      animationInstance.current.addEventListener("enterFrame", handleEnterFrame)

      animationInstance.current.setSpeed(1.5)
    }

    return () => {
      if (animationInstance.current) {
        animationInstance.current.removeEventListener(
          "enterFrame",
          handleEnterFrame,
        )
        animationInstance.current.destroy()
      }
    }
  }, [animationData, autoplay, loop])

  const handleEnterFrame = () => {
    if (animationInstance.current) {
      animationProgress.current = animationInstance.current.currentFrame
    }
  }

  return (
    <div
      className={className}
      ref={animationContainer}
      style={{ width, height }}
    />
  )
}
