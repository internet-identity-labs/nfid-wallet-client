import Lottie, { AnimationItem } from "lottie-web"
import React, { useEffect, useRef } from "react"

export interface LottieAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  animationData: any
  loop?: boolean
  autoplay?: boolean
  width?: number | string
  height?: number | string
  className?: string
  speed?: number
  onComplete?: () => void
  viewBox?: string
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  width = "100%",
  height = "100%",
  className,
  onComplete,
  speed = 1,
  style = {},
  viewBox,
  ...props
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
        rendererSettings: {
          viewBoxSize: viewBox,
          className: "!w-[332px] !h-[160px]",
        },
      })

      if (onComplete) {
        animationInstance.current.addEventListener("loopComplete", onComplete)
      }

      animationInstance.current.addEventListener("enterFrame", handleEnterFrame)

      animationInstance.current.setSpeed(speed)
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
  }, [animationData, autoplay, loop, onComplete, speed, viewBox])

  const handleEnterFrame = () => {
    if (animationInstance.current) {
      animationProgress.current = animationInstance.current.currentFrame
    }
  }

  return (
    <div
      {...props}
      className={className}
      ref={animationContainer}
      style={{ ...style, width, height }}
    />
  )
}
