import {
  Button,
  Card,
  CardBody,
  H5,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import { PoapDescription } from "frontend/design-system/atoms/typography/poapDescription"
import { PoapLocation } from "frontend/design-system/atoms/typography/poapLocation"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

import image_dog from "./image_dog.png"

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
  const [lastSlide, setLastSlide] = React.useState(false)
  const [firstSlide, setFirstSlide] = React.useState(true)

  const [prevEl, setPrevEl] = React.useState<HTMLElement | null>(null)
  const [nextEl, setNextEl] = React.useState<HTMLElement | null>(null)
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
      <img src={image_dog} alt="anonymous dog" />
      <Card className="offset-header" style={{ marginTop: "-3rem" }}>
        <H5 className="mb-2 font-bold">April 22-28, 2022</H5>

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
                swiper.realIndex === swiper.slides.length - 1 ? true : false,
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
                <PoapLocation className="pb-4">
                  <div style={{ display: "inline" }}>
                    Computer History Museum,{" "}
                  </div>
                  <div style={{ display: "inline" }}>Mountain View, CA</div>
                </PoapLocation>

                <PoapDescription>
                  Add proof that you attended today's workshop as a verifiable
                  credential to one of infinite DIDs, powered by NFID.
                </PoapDescription>
              </div>
            </SwiperSlide>
          </Swiper>

          <Button secondary onClick={onContinueButtonClick} className="mt-8">
            {continueButtonContent}
          </Button>

          <Loader isLoading={!!isLoading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
