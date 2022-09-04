import clsx from "clsx"
import React from "react"
import { Fade } from "react-awesome-reveal"

import { NFIDGradientBar } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useRegisterQRCode } from "frontend/apps/marketing/landing-page/register-qrcode/use-register-qrcode"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { PopupRegisterDecider } from "frontend/ui/organisms/navigation/auth-popup/popup-register-decider"

import AuthenticatedPopup from "../../navigation-popup"
import { PopupRegister } from "./popup-register"

interface NavigationPopupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavigationPopup: React.FC<NavigationPopupProps> = () => {
  const { account } = useAccount()
  const { logout, isAuthenticated, user } = useAuthentication()
  const { status } = useRegisterQRCode()

  const isPopupLogin = React.useMemo(() => {
    return user || account
  }, [user, account])

  if (status === "" && isAuthenticated && account?.anchor)
    return <AuthenticatedPopup onSignOut={logout} anchor={account.anchor} />

  return (
    // @ts-ignore: TODO: Pasha fix
    <Fade>
      <div
        className={clsx(
          "absolute right-0 flex flex-col items-center pb-6 bg-white shadow-iframe rounded-xl top-14",
          (user && status !== "registerDecider") || status === "registerDevice"
            ? "w-60"
            : "w-80",
          status === "" && !isPopupLogin && window.scrollY < 500 && "hidden",
        )}
      >
        <NFIDGradientBar />
        {status === "registerDecider" && <PopupRegisterDecider />}
        {status === "" && !account && <PopupRegister />}
      </div>
    </Fade>
  )
}
