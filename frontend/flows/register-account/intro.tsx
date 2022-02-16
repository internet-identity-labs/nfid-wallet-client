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

  const slideStyles = {
    slide1: {
      background: `linear-gradient(90deg,#008DDD,#A400CD)`,
    },
    slide2: {
      background: `linear-gradient(90deg,#E324B5,#6500CA)`,
    },
    slide3: {
      background: `linear-gradient(90deg,#FF6B00,#D900B6)`,
    },
    slide4: [
      {
        background: `linear-gradient(90deg,#00dd59,#009e6e)`,
      },
      {
        background: `linear-gradient(90deg,#00cc60,#016081)`,
      },
    ],
    slide5: {
      background: `linear-gradient(90deg,#008DDD,#A400CD)`,
    },
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
    <AppScreen>
      <Card className="offset-header">
        <CardBody>
          <Swiper
            navigation={{
              prevEl,
              nextEl,
            }}
            className="overflow-hidden rounded-lg"
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
                  The only way to guarantee your{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide1}
                  >
                    privacy and security
                  </span>{" "}
                  on the Internet
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-2xl">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide2}
                  >
                    This is your {device}.
                  </span>{" "}
                  There are many like it but this one is yours.
                </div>
                <P className="mb-3">
                  {`This ${device} is equipped with the most advanced security in the world – a biometric scanner that ensures only you have access.`}
                </P>

                <P>
                  NFID introduces this security model to your online activity.
                </P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-2xl">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  Without{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide3}
                  >
                    you and your {device},
                  </span>{" "}
                  your online accounts are inaccessible.
                </div>
                <P className="mb-3">
                  Anyone could pretend to be you with your username and
                  password, but only you can unlock your {device}.
                </P>

                <P>Authenticate simply and securely with NFID.</P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-3xl">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  Without{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide4[0]}
                  >
                    your consent,
                  </span>{" "}
                  nobody can access{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide4[1]}
                  >
                    any information
                  </span>{" "}
                  about you.
                </div>
                <P className="mb-3">
                  Every single thing we do online is tracked, sold, and used to
                  understand and manipulate us.
                </P>

                <P>Stay anonymous and untrackable with NFID.</P>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="max-w-[750px]">
                <H5 className="mb-4 font-bold md:mb-7">{appName} uses NFID</H5>
                <div className="swiper-title">
                  So be it, until{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide5}
                  >
                    convenience, security,
                  </span>{" "}
                  <span
                    className="clip-text whitespace-nowrap"
                    style={slideStyles.slide5}
                  >
                    and privacy online
                  </span>{" "}
                  are no longer required.
                </div>

                <div className="grid max-w-sm gap-2 py-3 mt-12 md:grid-cols-2 md:mt-6">
                  <Button secondary onClick={handleCreateKeys}>
                    Create new NFID
                  </Button>

                  <Button stroke>Restore my NFID</Button>
                </div>
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
