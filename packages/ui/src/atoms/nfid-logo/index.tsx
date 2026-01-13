import clsx from "clsx"
import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"

import { LogoLanding, LogoMain } from "@nfid/ui"

interface NFIDLogoProps {
  className?: string
  assetsLink?: string
}

export const NFIDLogo: FC<NFIDLogoProps> = ({ className }) => (
  <Link to="/">
    <img src={LogoLanding} alt="NFID Wallet" className={className} />
  </Link>
)

export const NFIDLogoMain: FC<NFIDLogoProps> = ({ className, assetsLink }) => {
  const navigate = useNavigate()
  return (
    <img
      src={LogoMain}
      alt="NFID Wallet"
      className={clsx("cursor-pointer", className)}
      onClick={() => {
        if (!assetsLink) return
        navigate(assetsLink)
      }}
    />
  )
}
