import React from "react"

import { Image } from "@nfid-frontend/ui"

interface ApplicationLogoProps {
  src: string
  applicationName?: string
}

export const ApplicationLogo: React.FC<ApplicationLogoProps> = ({
  src: url,
  applicationName = "unknown-application",
}) => {
  return (
    <Image
      src={decodeURIComponent(url)}
      alt={`application-logo-${applicationName}`}
      className="w-[37px] h-[37px] inline-block mb-4"
    />
  )
}
