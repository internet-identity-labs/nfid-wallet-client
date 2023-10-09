import clsx from "clsx"

import { NFIDLogoSpinning } from "../nfid-logo-spinning"
import logo from "./logo.svg"

export const NFIDLogo = () => {
  return (
    <div className="flex items-center w-24 text-2xl">
      <span className="font-black">NF</span>
      <div className="transition duration-100 group">
        <NFIDLogoSpinning
          className={clsx(
            "select-none pointer-events-none group-hover:flex hidden",
            "w-12 h-12",
          )}
        />

        <div className="w-12 h-12 p-1 group-hover:hidden">
          <img src={logo} />
        </div>
      </div>
    </div>
  )
}
