import React from "react"
import { Fade } from "react-awesome-reveal"
import Tilt from "react-parallax-tilt"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { RegisterQRCode } from "frontend/apps/marketing/landing-page/register-qrcode"
import { ElementProps } from "frontend/types/react"

import Group from "./assets/Group.svg"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isQRCode?: boolean
  hasAccount?: boolean
}

export const HeroRightSide: React.FC<HeroRightSideProps> = ({
  children,
  className,
  isQRCode,
  hasAccount,
}) => {
  const { isMobile } = useDeviceInfo()

  return isQRCode && !isMobile ? (
    // @ts-ignore TODO: Pasha fix
    <Fade>
      <Tilt className="mb-[20vh] sm:mb-[60vh] hidden sm:block">
        <RegisterQRCode
          className="flex items-center justify-center p-8 mx-auto border border-white sm:mt-20 sm:p-16 rounded-3xl"
          style={{
            background:
              "linear-gradient(154.83deg, #FFFFFF 42.25%, rgba(255, 255, 255, 0) 112.96%)",
            filter: "drop-shadow(0px 10px 60px rgba(48, 139, 245, 0.3))",
            width: "max-content",
          }}
          options={{
            margin: 0,
            width: isMobile ? 210 : window.screen.availWidth * 0.18,
          }}
        />
        <p className="mt-4 text-xs text-center text-gray-500 tracking-[0.16px]">
          Scan this code with your phone's camera to register your NFID
        </p>
      </Tilt>
    </Fade>
  ) : hasAccount ? (
    <div className="mb-[75px] sm:mb-[87px] z-10 relative">
      <img src={Group} alt="Group" />
    </div>
  ) : (
    <span></span>
  )
}
