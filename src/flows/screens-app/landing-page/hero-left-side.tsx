import { Button } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
// @ts-ignore
import { Slide } from "react-reveal"
import { Link, useNavigate } from "react-router-dom"

import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { RecoverNFIDRoutesConstants as RAC } from "frontend/flows/screens-app/recover-nfid/routes"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { ElementProps } from "frontend/types/react"

import MobileHero from "./assets/mobile_hero.svg"

interface HeroLeftSideProps extends ElementProps<HTMLDivElement> {
  isQRCode?: boolean
}

export const HeroLeftSide: React.FC<HeroLeftSideProps> = ({ isQRCode }) => {
  const { isMobile } = useDeviceInfo()
  const navigate = useNavigate()
  const { registerRoute } = useRegisterQRCode()

  return (
    <div className="sticky z-30 sm:mt-40 top-28">
      <Slide left>
        <div>
          <div>
            {" "}
            {isQRCode && isMobile && (
              <img src={MobileHero} alt="" className="mb-8 min-h-[300px]" />
            )}
            <h1 className="font-bold text-3xl lg:text-[54px] lg:leading-[110%]">
              <span
                style={{
                  WebkitTextFillColor: "transparent",
                  background:
                    "linear-gradient(90.02deg, #0094FF -5.65%, #A400CD 99.96%)",
                  WebkitBackgroundClip: "text",
                }}
              >
                Secure your data
              </span>{" "}
              <br /> with one touch
            </h1>
            {!isQRCode && isMobile && (
              <h2 className="leading-[1.5rem]">
                The decentralized one-touch multi-factor identity provider and
                crypto wallet
              </h2>
            )}
          </div>

          {isQRCode && isMobile && (
            <>
              <h2 className="mt-2 text-lg leading-[1.5rem]">
                The decentralized one-touch multi-factor <br /> identity
                provider and crypto wallet
              </h2>
              <div className="mt-8 pb-52">
                <Button
                  onClick={() => navigate(registerRoute)}
                  largeMax
                  secondary
                >
                  Register your NFID
                </Button>
                <Link
                  to={`${RAC.base}/${RAC.enterSeedPhrase}`}
                  className="block w-8/12 mx-auto mt-4 text-center cursor-pointer text-blue-base hover:underline hover:text-blue-hove"
                >
                  Recover NFID
                </Link>
              </div>
            </>
          )}
          {isQRCode && !isMobile && (
            <h2 className="mt-5 text-base sm:text-lg sm:leading-[150%] font-bold">
              Scan the QR code to register or <br />{" "}
              <span
                onClick={() =>
                  navigate(`${RAC.base}/${RAC.enterSeedPhrase}`, {
                    state: { from: "loginWithRecovery" },
                  })
                }
                className="cursor-pointer text-blue-base hover:underline hover:text-blue-hover"
              >
                Recover NFID
              </span>
            </h2>
          )}
          {!isQRCode && !isMobile && (
            <h2 className="mt-5 text-base sm:text-lg sm:leading-[26px]">
              The decentralized one-touch multi-factor identity provider and
              crypto wallet
            </h2>
          )}
        </div>
      </Slide>
    </div>
  )
}
