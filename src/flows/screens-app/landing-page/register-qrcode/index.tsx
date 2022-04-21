import { QRCode } from "@internet-identity-labs/nfid-sdk-react"
import { QRCodeRenderersOptions } from "qrcode"
import React, { CSSProperties } from "react"

import { useInterval } from "frontend/hooks/use-interval"

import { useRegisterQRCode } from "./use-register-qrcode"

interface RegisterQRCodeProps {
  options?: QRCodeRenderersOptions
  className?: string
  style?: CSSProperties
}

export const RegisterQRCode: React.FC<RegisterQRCodeProps> = ({
  options,
  className,
  style,
}) => {
  const { url, handlePollForDelegate } = useRegisterQRCode()

  useInterval(handlePollForDelegate, 2000)

  return (
    <a href={url} rel="noreferrer" className={className} style={style}>
      <QRCode options={options} content={url} />
    </a>
  )
}
