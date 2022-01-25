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
        className={clsx(
          "h-full flex flex-col sm:block md:max-w-2xl md:mt-20",
          className,
        )}
      >
        <CardBody small>
          <Swiper
            navigation={{
              prevEl,
              nextEl,
              disabledClass: "swiper-nav-disabled",
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
              <H5 className="md:mb-7 font-bold mb-4">
                {"applicationName"} uses NFID
              </H5>
              <div className="swiper-title">
                Your passport to a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008DDD] to-[#A400CD]">
                  secure and private Internet
                </span>
              </div>

              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <H5 className="md:mb-7 font-bold mb-4">
                {"applicationName"} uses NFID
              </H5>
              <div className="swiper-title">
                Isn't the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E324B5] to-[#6500CA]">
                  Internet
                </span>{" "}
                already{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E324B5] to-[#6500CA]">
                  secure?
                </span>
              </div>

              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <H5 className="md:mb-7 font-bold mb-4">
                {"applicationName"} uses NFID
              </H5>
              <div className="swiper-title">
                Isn't the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#FF6B00] to-[#D900B6]">
                  Internet
                </span>{" "}
                already{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#FF6B00] to-[#D900B6]">
                  private?
                </span>
              </div>
              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <div className="swiper-title">
                Continue to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DE59] to-[#005B83]">
                  applicationName
                </span>
              </div>
              <P>
                Restore your NFID on this {"device"} or create a new NFID with{" "}
                {"platformAuthenticator"}.
              </P>

              <div className="grid md:grid-cols-2 mt-6 md:gap-x-3 gap-y-3">
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

            <div className="swiper-pagination pb-[5px] mx-8"></div>

            <div
              className={clsx(
                "swiper-button-next",
                "p-5 rounded-full",
                lastSlide ? "bg-opacity-10 text-gray-400 bg-transparent" : "cursor-pointer bg-black-base",
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
