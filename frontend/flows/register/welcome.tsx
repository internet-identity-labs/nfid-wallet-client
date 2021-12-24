import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"

interface IdentityPersonaWelcomeScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterWelcome: React.FC<IdentityPersonaWelcomeScreenProps> = ({
  className,
}) => {
  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full block flex-col", className)}>
        <CardTitle>{"{applicationName}"} uses NFID</CardTitle>
        <CardBody className="text-center">
          It's your identity. <br /> Own it.
          <Swiper
            className="bg-gray-50 overflow-hidden rounded-lg md:max-w-2xl mt-12"
            pagination={true}
            grabCursor={true}
          >
            <SwiperSlide>Slide 1</SwiperSlide>
            <SwiperSlide>Slide 2</SwiperSlide>
            <SwiperSlide>Slide 3</SwiperSlide>
          </Swiper>
        </CardBody>
        <CardAction bottom className="justify-center">
          {/* TODO: map link to register/restore browser screen */}
          <Link to="#" className="flex justify-center">
            <Button block large>
              Proceed with my NFID
            </Button>
          </Link>
          <Link to="/register/create-persona" className="flex justify-center">
            <Button block large filled>
              Create my NFID
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
