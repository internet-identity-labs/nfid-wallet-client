import clsx from "clsx"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Logo, LogoMain } from "@nfid-frontend/ui"

interface NFIDLogoProps {
  className?: string
  assetsLink?: string
}

export const NFIDLogo: FC<NFIDLogoProps> = ({ className }) => (
  <img src={Logo} alt="NFID" className={className} />
)

export const NFIDLogoMain: FC<NFIDLogoProps> = ({ className, assetsLink }) => {
  const navigate = useNavigate()
  return (
    <img
      src={LogoMain}
      alt="NFID"
      className={clsx("cursor-pointer", className)}
      onClick={() => {
        if (!assetsLink) return
        navigate(assetsLink)
      }}
    />
  )
}
