import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card, CardBody, H3, P, Button } from "frontend/ui-kit/src/index"
import { Link } from "react-router-dom"
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
  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardBody className="max-w-lg">
          <div className="font-bold mb-4">{"applicationName"} uses NFID</div>
          <Swiper
            className="overflow-hidden rounded-lg md:max-w-2xl flex flex-col-reverse"
            pagination={true}
            grabCursor={true}
          >
            <SwiperSlide>
              <H3>Your passport to a secure and private Internet</H3>
              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <H3>Isn't the Internet already secure?</H3>
              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <H3>Isn't the Internet already private?</H3>
              <P>
                NFID guarantees the security and privacy of your online identity
                by making the process of successfully unlocking your personal
                devices' hardware encryption protocols – like facial or
                fingerprint scans – the only way to access your accounts.
              </P>
            </SwiperSlide>
            <SwiperSlide>
              <H3>Continue to {"applicationName"}</H3>
              <P>
                Restore your NFID on this {"device"} or create a new NFID with{" "}
                {"platformAuthenticator"}.
              </P>

              <Link
                to={`${RAC.base}/${RAC.createNFIDProfile}`}
                className="flex justify-center mt-6"
              >
                <Button block large filled>
                  Create new NFID
                </Button>
              </Link>

              {/* TODO: map button to route */}
              <Button block large className="mt-2">
                Restore my NFID
              </Button>
            </SwiperSlide>
          </Swiper>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
