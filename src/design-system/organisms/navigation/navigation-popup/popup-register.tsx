import React from "react"
import { Link } from "react-router-dom"

import { RegisterQRCode } from "frontend/flows/screens-app/landing-page/register-qrcode"
import { RestoreAccessPointConstants as RAC } from "frontend/flows/screens-app/restore-access-point/routes"

interface PopupRegisterProps {}

export const PopupRegister: React.FC<PopupRegisterProps> = () => {
  return (
    <div>
      <h2 className="mt-5 text-xl font-bold text-center">
        Register by scanning <br /> the code
      </h2>

      <a
        href="/authenticate/?applicationName=NFID-Demo"
        target="_blank"
        rel="noreferrer"
        className="mx-auto"
      >
        <RegisterQRCode />
      </a>
      <p className="text-xs text-center text-gray-500">
        Scan this code with your phone’s camera
      </p>
      <Link
        className="block mt-4 text-sm font-light text-center cursor-pointer text-blue-base"
        to={`${RAC.base}/${RAC.recoveryPhrase}`}
        state={{ from: "loginWithRecovery" }}
      >
        Unlock NFID with Security Key
      </Link>
    </div>
  )
}
