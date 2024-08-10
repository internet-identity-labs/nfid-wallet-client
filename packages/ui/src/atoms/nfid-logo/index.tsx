import { FC } from "react"

import logoMain from "./NFID-logo-main.svg"
import logo from "./NFID-logo.svg"

interface NFIDLogoProps {
  className?: string
}

export const NFIDLogo: FC<NFIDLogoProps> = ({ className }) => (
  <img src={logo} alt="NFID" className={className} />
)

export const NFIDLogoMain: FC<NFIDLogoProps> = ({ className }) => (
  <img src={logoMain} alt="NFID" className={className} />
)
