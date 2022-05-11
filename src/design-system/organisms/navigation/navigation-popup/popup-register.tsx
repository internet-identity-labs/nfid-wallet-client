import React from "react"
import { Link } from "react-router-dom"

import { RegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode"
import { RecoverNFIDRoutesConstants as RAC } from "frontend/flows/screens-app/recover-nfid/routes"

interface PopupRegisterProps {}

export const PopupRegister: React.FC<PopupRegisterProps> = () => {
  return (
    <div>
      <h2 className="mt-5 text-xl font-bold text-center">Register your NFID</h2>

      <div className="mx-auto">
        <RegisterQRCode />
      </div>
      <p className="text-xs text-center text-gray-500">
        Scan this code with your phone's camera
      </p>
      <Link
        className="block mt-4 text-sm font-light text-center cursor-pointer text-blue-base"
        to={`${RAC.base}/${RAC.enterRecoveryPhrase}`}
        state={{ from: "loginWithRecovery" }}
      >
        Or recover an existing NFID
      </Link>
    </div>
  )
}
