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
      className="inline-block w-10 h-10"
    />
  )
}
