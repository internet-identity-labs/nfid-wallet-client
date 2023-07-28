import Lottie from "lottie-react"
import React, { useRef, useEffect, useState } from "react"

interface Props {
  animationData: any
}

const AnimationWrapper: React.FC<Props> = ({ animationData }) => {
  const animationRef = useRef<HTMLDivElement | null>(null)
  const lottieRef = useRef<any | null>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          if (lottieRef.current) {
            lottieRef.current.play()
          }
        }
      },
      {
        root: null,
        threshold: 0.1,
      },
    )

    if (animationRef.current) {
      observer.observe(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        observer.unobserve(animationRef.current)
      }
    }
  }, [isVisible])

  return (
    <div ref={animationRef}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        autoplay={false} // disable autoplay because we're handling play state manually
        loop={false}
        rendererSettings={{ progressiveLoad: true }}
      />
    </div>
  )
}

export default AnimationWrapper
