import Lottie, { AnimationItem } from "lottie-web"
import React, { useEffect, useRef } from "react"

export interface LottieAnimationProps {
  animationData: any
  loop?: boolean
  autoplay?: boolean
  width?: number | string
  height?: number | string
  className?: string
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  width = "100%",
  height = "100%",
  className,
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

      animationInstance.current.addEventListener("enterFrame", handleEnterFrame)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && animationInstance.current) {
        animationInstance.current.playSegments(
          [animationProgress.current, animationInstance.current.totalFrames],
          true,
        )
      } else if (
        document.visibilityState === "hidden" &&
        animationInstance.current
      ) {
        animationInstance.current.pause()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (animationInstance.current) {
        animationInstance.current.removeEventListener(
          "enterFrame",
          handleEnterFrame,
        )
        animationInstance.current.destroy()
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
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
