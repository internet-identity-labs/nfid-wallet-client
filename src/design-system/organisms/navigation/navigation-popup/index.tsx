import clsx from "clsx"
import React from "react"
// @ts-ignore
import { Fade } from "react-reveal"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { PopupLogin } from "./popup-login"
import { PopupRegister } from "./popup-register"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { PopupRegisterDecider } from "frontend/design-system/organisms/navigation/navigation-popup/popup-register-decider"

interface NavigationPopupProps extends React.HTMLAttributes<HTMLDivElement> {
}

export const NavigationPopup: React.FC<NavigationPopupProps> = () => {
  const { account } = useAccount()
  const { isAuthenticated } = useAuthentication()
  const { status } = useRegisterQRCode()

  return (
    <Fade>
      <div
        className={clsx(
          "absolute right-0 flex flex-col items-center pb-6 bg-white shadow-iframe rounded-xl top-14",
          status !== "" && "w-[25rem] px-8",
          isAuthenticated || status === 'registerDevice' ? "w-60" : "w-80",
        )}
      >
        <div
          className="absolute top-0 w-10/12 h-1 rounded-b-sm"
          style={{
            background:
              "linear-gradient(90deg, #3DEDD7 0%, #02CDFE 25%, #3781F4 50.52%, #7063FF 76.04%, #CC5CDC 100%)",
          }}
        />
        {status === "registerDecider" && <PopupRegisterDecider />}
        {status === "registerDevice" && <PopupLogin />}
        {status !== "" ? null : isAuthenticated || account ? <PopupLogin /> : <PopupRegister />}
      </div>
    </Fade>
  )
}
