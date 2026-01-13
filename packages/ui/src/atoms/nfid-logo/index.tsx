import clsx from "clsx"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { LogoLanding, LogoMain } from "@nfid-frontend/ui"

interface NFIDLogoProps {
  className?: string
  assetsLink?: string
}

export const NFIDLogo: FC<NFIDLogoProps> = ({ className, assetsLink }) => {
  const navigate = useNavigate()
  return (
    <img
      src={LogoLanding}
      alt="NFID Wallet"
      className={clsx("cursor-pointer", className)}
      onClick={() => {
        if (!assetsLink) return
        navigate(assetsLink)
      }}
    />
  )
}

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
