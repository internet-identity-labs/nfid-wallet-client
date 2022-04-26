import {
  Button,
  Card,
  CardBody,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import { CalendarIcon } from "frontend/design-system/atoms/icons/calendar"
import { MapPinIcon } from "frontend/design-system/atoms/icons/map-pin"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

import image_dog from "./image_dog.svg"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  continueButtonContent: string
  onContinueButtonClick: () => Promise<void>
  isLoading?: boolean
}

export const ProofOfAttendency: React.FC<RegisterAccountIntroProps> = ({
  onContinueButtonClick,
  continueButtonContent,
  isLoading,
}) => {
  const [, setLastSlide] = React.useState(false)
  const [, setFirstSlide] = React.useState(true)

  const [prevEl] = React.useState<HTMLElement | null>(null)
  const [nextEl] = React.useState<HTMLElement | null>(null)
  const [slide, setSlide] = React.useState<Number>()

  const gradientStyles = () => {
    switch (slide) {
      case 1:
        return {
          styles: {
            background: `linear-gradient(90deg,#0094FF,#A400CD)`,
          },
          bubbleBackground: ["#a69cff", "#4df1ffa8"],
        }
      case 2:
        return {
          styles: {
            background: `linear-gradient(90deg,#FF6B00,#D900B6)`,
          },
          bubbleBackground: ["#FFC83A95", "#FF1AF680"],
        }
      case 3:
        return {
          styles: {
            background: `linear-gradient(90deg,#00DE59,#005B83)`,
          },
          bubbleBackground: ["#ecfcae", "#a9fdd7"],
        }
      default:
        return {
          styles: {
            background: `linear-gradient(90deg,#B649FF,#FF9029)`,
          },
          bubbleBackground: ["#FFCD4E", "#B57BFF70"],
        }
    }
  }

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: [
          gradientStyles().bubbleBackground[0],
          gradientStyles().bubbleBackground[1],
        ],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh]",
          "bottom-[-10vh] md:right-[20vw] md:top-[30vh]",
        ],
      }}
    >
      <main className={clsx("flex flex-1")}>
        <div
          className={clsx(
            // MOBILE
            "container flex flex-col px-6 py-0 mx-auto sm:py-4",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div className="flex flex-grow w-60">
            <img
              src={image_dog}
              className="object-contain object-top"
              alt="anonymous dog"
            />
          </div>
          <Card
            className={clsx(
              // MOBILE
              "flex flex-col",
              // SMALL
              "md:pt-16",
            )}
          >
            <div className="flex flex-col">
              <div className="flex">
                <div>
                  <CalendarIcon />
                </div>
                <div className="mb-2 ml-2">April 22-28, 2022</div>
              </div>
              <div className="flex">
                <div>
                  <MapPinIcon />
                </div>
                <div className="mb-2 ml-2">
                  Computer History Museum, Mountain View, CA
                </div>
              </div>
            </div>

            <CardBody>
              <Swiper
                autoHeight
                navigation={{
                  prevEl,
                  nextEl,
                }}
                onSlideChange={(swiper) => setSlide(swiper.activeIndex + 1)}
                pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                }}
                grabCursor={true}
                onRealIndexChange={(swiper) => {
                  setFirstSlide(swiper.realIndex === 0 ? true : false)
                  setLastSlide(
                    swiper.realIndex === swiper.slides.length - 1
                      ? true
                      : false,
                  )
                }}
              >
                <SwiperSlide>
                  <div className="max-w-2xl">
                    <div className="swiper-title">
                      <span
                        className="clip-text whitespace-nowrap "
                        style={gradientStyles().styles}
                      >
                        Internet Identity
                      </span>{" "}
                      Workshop
                    </div>

                    <div className="font-bold">
                      Create an NFID to add this proof of attendance badge to
                      your identity
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>

              <Button
                secondary
                onClick={onContinueButtonClick}
                className="mt-8"
              >
                {continueButtonContent}
              </Button>

              <Loader isLoading={!!isLoading} />
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
