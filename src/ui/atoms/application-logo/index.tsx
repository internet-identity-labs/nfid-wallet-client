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
      className="w-[37px] h-[37px] inline-block mb-4"
    />
  )
}
