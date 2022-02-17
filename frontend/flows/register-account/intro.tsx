import { Button, Card, CardBody, H5, Loader, P } from "frontend/ui-kit/src"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import React from "react"
import { HiArrowLeft, HiArrowRight } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { RegisterAccountConstants as RAC } from "./routes"
import { useIsLoading } from "frontend/hooks/use-is-loading"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  children,
  className,
}) => {
  const { isLoading, setIsloading } = useIsLoading()
  const navigate = useNavigate()
  const { applicationName, createWebAuthNIdentity } = useMultipass()
  const [lastSlide, setLastSlide] = React.useState(false)
  const [firstSlide, setFirstSlide] = React.useState(true)

  const appName = applicationName || "This application"
  const device = "device"

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
            background: `linear-gradient(90deg,#0094FF,#A400CD)`,
          },
          bubbleBackground: ["#a69cff", "#4df1ffa8"],
        }
    }
  }

  const handleCreateKeys = React.useCallback(async () => {
    setIsloading(true)
    const registerPayload = await createWebAuthNIdentity()

    navigate(`${RAC.base}/${RAC.captcha}`, {
      state: {
        registerPayload,
      },
    })
  }, [createWebAuthNIdentity, navigate, setIsloading])

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
      <Card className="offset-header">
        <CardBody>
          <Swiper
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
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  <span
                    className="clip-text whitespace-nowrap"
                    style={gradientStyles().styles}
                  >
                    Privacy
                  </span>{" "}
                  with NFID
                </div>
                <P className="pb-4">
                  Every account you create across any service that supports NFID
                  will automatically create a new, untraceable hardware wallet.
                </P>

                <P>
                  You are the only person in the world able to trace accounts to
                  your NFID, providing you with the best possible privacy
                  online.
                </P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-2xl">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  <span
                    className="clip-text whitespace-nowrap"
                    style={gradientStyles().styles}
                  >
                    Security
                  </span>{" "}
                  with NFID
                </div>
                <P className="pb-4">
                  Hardware wallets offer the greatest security guarantees
                  because their private keys can't be exported, making it a
                  one-way vault that only you have the ability to access.
                </P>

                <P>
                  NFID makes each of your internet accounts exactly this kind of
                  vault.
                </P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-xl">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  <span
                    className="clip-text whitespace-nowrap"
                    style={gradientStyles().styles}
                  >
                    Convenience
                  </span>{" "}
                  with NFID
                </div>
                <P className="pb-4">
                  A hardware device for each online account used to be
                  impractical. NFID stores private keys on the
                  specially-designed cryptographic chips of your phones,
                  tablets, and computers so that creating new accounts or
                  authenticating is simply a face or touch scan away.
                </P>

                <Button secondary onClick={handleCreateKeys} className="mb-4">
                  Create new NFID
                </Button>
              </div>
            </SwiperSlide>
          </Swiper>

          <div className="swiper-controls">
            <div
              ref={(node) => setPrevEl(node)}
              className={clsx(
                "swiper-button-prev",
                !firstSlide && "cursor-pointer",
              )}
            >
              <HiArrowLeft
                className={clsx(
                  "text-2xl",
                  !firstSlide ? "text-black" : "text-gray-400",
                )}
              />
            </div>

            <div className="swiper-pagination"></div>

            <div
              className={clsx(
                "swiper-button-next",
                "p-5 rounded-full",
                lastSlide
                  ? "bg-opacity-10 text-gray-400 bg-transparent"
                  : "cursor-pointer bg-black-base",
              )}
              ref={(node) => setNextEl(node)}
            >
              <HiArrowRight
                className={clsx(
                  "text-2xl",
                  !lastSlide ? "text-white" : "text-gray-400",
                )}
              />
            </div>
          </div>
          <Loader isLoading={isLoading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
