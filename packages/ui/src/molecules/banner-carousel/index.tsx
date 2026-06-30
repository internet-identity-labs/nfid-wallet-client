import clsx from "clsx"
import { FC, ReactNode, useEffect, useState } from "react"
import colors from "tailwindcss/colors"

import { Carousel, Slide } from "../../atoms/carousel"
import { CloseIcon } from "../../atoms/icons/close-button"
import { Button, ButtonType } from "../button"

export interface BannerSlide {
  id: string
  title: string
  text: ReactNode
  image: string
  actions: {
    text: string
    type: ButtonType
    classnames: string
    handler: () => void
  }[]
}

interface BannerCarouselProps {
  slides: BannerSlide[]
}

export const BannerCarousel: FC<BannerCarouselProps> = ({ slides }) => {
  const [visibleIds, setVisibleIds] = useState<string[]>([])

  useEffect(() => {
    const visible = slides
      .filter((s) => localStorage.getItem(s.id) !== "false")
      .map((s) => s.id)
    setVisibleIds(visible)
  }, [])

  const handleClose = (id: string) => {
    localStorage.setItem(id, "false")
    setVisibleIds((prev) => prev.filter((v) => v !== id))
  }

  const visibleSlides = slides.filter((s) => visibleIds.includes(s.id))

  if (visibleSlides.length === 0) return null

  const carouselSlides: Slide[] = visibleSlides.map((s) => ({
    id: s.id,
    content: (
      <div
        className={clsx(
          "rounded-[24px] mt-[30px] relative bg-[linear-gradient(to_bottom,_#008d7f,_#012d2f)] font-inter",
          "lg:h-[260px] lg:bg-[linear-gradient(to_right,_#008d7f,_#012d2f)] lg:p-[30px] overflow-hidden",
        )}
      >
        <div
          className={clsx(
            "w-full aspect-[2.15] top-0 right-0 bg-cover",
            "lg:w-[560px] lg:h-full lg:absolute",
          )}
          style={{ backgroundImage: `url(${s.image})` }}
        ></div>
        <div
          className="w-6 h-6 absolute right-[10px] top-[10px]"
          onClick={() => handleClose(s.id)}
        >
          <CloseIcon color={colors.white} className="w-full h-full" />
        </div>
        <div
          className={clsx(
            "text-white relative p-5",
            "lg:w-[50%] lg:max-w-[510px] lg:p-0",
          )}
        >
          <div className="text-[24px] leading-[24px] tracking-[0.01em] mb-5">
            {s.title}
          </div>
          {s.text}
          <div className="flex gap-[10px] md:gap-[20px] mt-5 flex-wrap">
            {s.actions.map((a) => (
              <Button
                type="stroke"
                className={a.classnames}
                isSmall
                onClick={a.handler}
              >
                {a.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    ),
  }))

  return <Carousel key={visibleIds.join(",")} slides={carouselSlides} />
}
