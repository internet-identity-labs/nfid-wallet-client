import { Button, Card, CardBody, H5, P } from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { HiArrowLeft, HiArrowRight } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { RegisterAccountConstants as RAC } from "./routes"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  children,
  className,
}) => {
  const navigate = useNavigate()
  const [lastSlide, setLastSlide] = React.useState(false)
  const [firstSlide, setFirstSlide] = React.useState(true)

  const [prevEl, setPrevEl] = React.useState<HTMLElement | null>(null)
  const [nextEl, setNextEl] = React.useState<HTMLElement | null>(null)

  return (
    <AppScreen>
      <Card
        className={clsx("h-full flex flex-col sm:block  md:mt-10", className)}
      >
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
                <H5 className="md:mb-7 font-bold mb-4">
                  {"applicationName"} uses NFID
                </H5>
                <div className="swiper-title">
                  The only way to guarantee your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008DDD] to-[#A400CD]">
                    privacy and security
                  </span>{" "}
                  on the Internet
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-2xl">
                <H5 className="md:mb-7 font-bold mb-4">
                  {"applicationName"} uses NFID
                </H5>
                <div className="swiper-title">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E324B5] to-[#6500CA]">
                    This is your {"device"}.
                  </span>{" "}
                  There are many like it but this one is yours.
                </div>
                <P className="mb-3">
                  This {"device"} is equipped with the most advanced security in
                  the world – a biometric scanner that ensures only you have
                  access.
                </P>

                <P>
                  NFID introduces this security model to your online activity.
                </P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-2xl">
                <H5 className="md:mb-7 font-bold mb-4">
                  {"applicationName"} uses NFID
                </H5>
                <div className="swiper-title">
                  Without{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#FF6B00] to-[#D900B6]">
                    you and your {"device"}
                  </span>
                  , your online accounts are inaccessible.
                </div>
                <P className="mb-3">
                  Anyone could pretend to be you with your username and
                  password, but only you can unlock your {"device"}.
                </P>

                <P>Authenticate simply and securely with NFID.</P>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="max-w-3xl">
                <H5 className="md:mb-7 font-bold mb-4">
                  {"applicationName"} uses NFID
                </H5>
                <div className="swiper-title">
                  Without{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DE59] to-[#005B83]">
                    your consent
                  </span>
                  , no government, business, or individual shall access any{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DE59] to-[#005B83]">
                    information about you.
                  </span>
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
                <H5 className="md:mb-7 font-bold mb-4">
                  {"applicationName"} uses NFID
                </H5>
                <div className="swiper-title">
                  So be it, until{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008DDD] to-[#A400CD]">
                    convenience, security, and privacy online
                  </span>{" "}
                  are no longer required.
                </div>

                <div className="grid md:grid-cols-2 mt-12 md:mt-6 md:gap-x-3 gap-y-3 max-w-lg">
                  <Button
                    large
                    filled
                    onClick={() =>
                      navigate(`${RAC.base}/${RAC.createNFIDProfile}`)
                    }
                  >
                    Create new NFID
                  </Button>

                  <Button large>Restore my NFID</Button>
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
        </CardBody>
      </Card>
    </AppScreen>
  )
}
