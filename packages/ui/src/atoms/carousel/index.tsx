import { useRef, useState, useCallback, useEffect } from "react"
import type { ReactNode } from "react"

import { Carousel as C } from "@fancyapps/ui/dist/carousel/"
import { Autoplay } from "@fancyapps/ui/dist/carousel/carousel.autoplay"
import { Dots } from "@fancyapps/ui/dist/carousel/carousel.dots"
import "@fancyapps/ui/dist/carousel/carousel.css"
import "@fancyapps/ui/dist/carousel/carousel.dots.css"

import { canUseDOM } from "@fancyapps/ui/dist/utils/canUseDOM.js"
import { isEqual } from "@fancyapps/ui/dist/utils/isEqual.js"

export interface Slide {
  id: string
  content: ReactNode
}

interface CarouselProps {
  slides: Slide[]
  autoplayTimeout?: number
  className?: string
}

export const Carousel = ({
  slides,
  autoplayTimeout = 5000,
  className,
}: CarouselProps) => {
  const options = {
    Autoplay: { timeout: autoplayTimeout, showProgressbar: false },
    gestures: false as const,
  }
  const storedOptions = useRef(options)

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [carouselInstance, setCarouselInstance] = useState<
    ReturnType<typeof C> | undefined
  >(undefined)

  const reInit = useCallback(() => {
    if (carouselInstance) {
      carouselInstance.destroy().init()
    }
  }, [carouselInstance])

  useEffect(() => {
    if (!isEqual(options, storedOptions.current)) {
      storedOptions.current = options
      reInit()
    }
  }, [options, reInit])

  useEffect(() => {
    if (canUseDOM() && container) {
      const newCarouselInstance = C(container, storedOptions.current, {
        Autoplay,
        Dots,
      }).init()

      setCarouselInstance(newCarouselInstance)

      return () => {
        newCarouselInstance.destroy()
      }
    } else {
      setCarouselInstance(undefined)
      return undefined
    }
  }, [container])

  return (
    <>
      <style>{`
        .f-carousel__dots {
          --f-carousel-dot-opacity: 1;
          --f-carousel-dots-width: 8px;

          top: auto;
          left: auto;
          right: 30px;
          bottom: 30px;
          gap: 6px;
        }

        @media (max-width: 1023px) {
          .f-carousel__dots {
            top: calc(30px + 100vw / 2.15 - 30px);
            bottom: auto;
            right: 10px;
          }
        }

        .f-carousel__dot {
          height: 10px;
          width: 10px;
          position: relative;
          overflow: hidden;
          border-radius: 5px;
          background: rgba(190, 234, 231, 1);
          transition: width 0.3s ease;
        }

        .f-carousel__dot:after {
          display: none !important;
        }

        .f-carousel__dot[aria-current="true"] {
          width: 35px !important;
        }

        .f-carousel__dot[aria-current="true"]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(255, 255, 255, 1);
          border-radius: 5px;
          transform-origin: left;
          transform: scaleX(0);
          animation: dot-progress var(--autoplay-timeout, 3000ms) linear forwards;
        }

        @keyframes dot-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <div
        ref={setContainer}
        className={`f-carousel banner-carousel ${className ?? ""}`}
        style={
          {
            "--autoplay-timeout": `${autoplayTimeout}ms`,
          } as React.CSSProperties
        }
      >
        {slides.map((slide) => (
          <div key={slide.id} className="f-carousel__slide">
            {slide.content}
          </div>
        ))}
      </div>
    </>
  )
}
