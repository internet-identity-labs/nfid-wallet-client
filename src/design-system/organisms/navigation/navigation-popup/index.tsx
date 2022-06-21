import { NFIDGradientBar } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
// @ts-ignore
import { Fade } from "react-reveal"

import { PopupRegisterDecider } from "frontend/design-system/organisms/navigation/navigation-popup/popup-register-decider"
import { useRegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode/use-register-qrcode"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { PopupLogin } from "./popup-login"
import { PopupRegister } from "./popup-register"

interface NavigationPopupProps extends React.HTMLAttributes<HTMLDivElement> { }

export const NavigationPopup: React.FC<NavigationPopupProps> = () => {
  const { account } = useAccount()
  const { user } = useAuthentication()
  const { status } = useRegisterQRCode()

  const isPopupLogin = React.useMemo(() => {
    return user || account
  }, [user, account])

  return (
    <Fade>
      <div
        className={clsx(
          "absolute right-0 flex flex-col items-center pb-6 bg-white shadow-iframe rounded-xl top-14",
          (user && status !== "registerDecider") ||
            status === "registerDevice"
            ? "w-60"
            : "w-80",
          status === "" && !isPopupLogin && window.scrollY < 500 && "hidden",
        )}
      >
        <NFIDGradientBar />
        {status === "registerDecider" && <PopupRegisterDecider />}
        {status === "registerDevice" && <PopupLogin />}
        {status !== "" ? null : user || account ? (
          <PopupLogin />
        ) : (
          <PopupRegister />
        )}
      </div>
    </Fade>
  )
}
