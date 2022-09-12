import clsx from "clsx"
import React from "react"
// @ts-ignore
import { Slide } from "react-awesome-reveal"
import sticky from "stickyfilljs"

import { ElementProps } from "frontend/types/react"

interface HeroLeftSideProps extends ElementProps<HTMLDivElement> {
  isUnregistered?: boolean
}

export const HeroLeftSide: React.FC<HeroLeftSideProps> = ({
  isUnregistered,
}) => {
  const text = React.useRef(null)

  React.useEffect(() => {
    text.current && sticky.add(text.current)
  }, [text])

  return (
    <div ref={text} className="z-30 sm:mt-40 top-28">
      {/* @ts-ignore: TODO: Pasha fix */}
      <Slide left>
        <div className="flex flex-wrap justify-start">
          <h1
            className={clsx(
              "font-bold text-[32px] leading-10 mt-2",
              "sm:leading-[64px] sm:text-[54px]",
            )}
          >
            Designed to be used <br />{" "}
            <span
              style={{
                WebkitTextFillColor: "transparent",
                background:
                  "linear-gradient(90.02deg, #0094FF -5.65%, #A400CD 99.96%)",
                WebkitBackgroundClip: "text",
              }}
            >
              only by you
            </span>
          </h1>
          <h2
            className={clsx(
              "leading-[26px] w-full text-lg mt-5",
              "sm:w-[409px] sm:font-bold sm:text-xl",
            )}
          >
            NFID is the digital identity for signing in to applications
            privately and securely <br /> <br />
          </h2>
        </div>
      </Slide>
    </div>
  )
}
