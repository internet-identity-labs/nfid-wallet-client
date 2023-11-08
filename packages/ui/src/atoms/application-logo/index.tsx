import React from "react"

interface ApplicationLogoProps {
  src: string
  applicationName?: string
}

export const ApplicationLogo: React.FC<ApplicationLogoProps> = ({
  src: url,
  applicationName = "unknown-application",
}) => {
  return (
    <img
      src={decodeURIComponent(url)}
      alt={`application-logo-${applicationName}`}
      className="inline-block w-10 h-10"
    />
  )
}
