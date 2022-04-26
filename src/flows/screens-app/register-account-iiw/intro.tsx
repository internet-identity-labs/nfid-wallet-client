import {
  Button,
  Card,
  CardBody,
  H5,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { generatePath } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"

import { PoapDescription } from "frontend/design-system/atoms/typography/poapDescription"
import { PoapLocation } from "frontend/design-system/atoms/typography/poapLocation"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"

import image_dog from "./image_dog.png"
import { RegisterAccountConstantsIIW as RACIIW } from "./routes"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  children,
  className,
}) => {
  const { secret, scope } = useParams()

  const { isLoading, setIsloading } = useIsLoading()
  const navigate = useNavigate()
  const { applicationName, createWebAuthNIdentity } = useMultipass()
  const [lastSlide, setLastSlide] = React.useState(false)
  const [firstSlide, setFirstSlide] = React.useState(true)

  const appName = applicationName || "This application"

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

  const handleCreateKeys = React.useCallback(async () => {
    try {
      setIsloading(true)
      const registerPayload = await createWebAuthNIdentity()

      // TODO: fix url
      const captchaPath = generatePath(`${RACIIW.base}/${RACIIW.captcha}`, {
        secret,
        scope,
      })

      navigate(captchaPath, {
        state: {
          registerPayload,
        },
      })
    } catch (error) {
      setIsloading(false)
    }
  }, [createWebAuthNIdentity, navigate, scope, secret, setIsloading])

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
      <img src={image_dog}></img>
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

          <Button secondary onClick={handleCreateKeys} className="mt-8">
            Create an NFID with biometric on this device
          </Button>

          <Loader isLoading={isLoading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
