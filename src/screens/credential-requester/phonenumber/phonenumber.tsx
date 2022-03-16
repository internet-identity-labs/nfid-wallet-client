import { useMultipass } from "frontend/hooks/use-multipass"
import { H2, H5 } from "frontend/ui-kit/src"
import React from "react"
import { PhonenumberUnverified } from "./phonenumber-unverified"
import { PhonenumberVerified } from "./phonenumber-verified"

interface CredentialRequesterPhonenumberProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
  onPresent: () => void
  onSkip: () => void
}

export const CredentialRequesterPhonenumber: React.FC<
  CredentialRequesterPhonenumberProps
> = ({ children, className, iframe, onSkip, onPresent }) => {
  const { applicationName } = useMultipass()

  const verified = false
  const title = `${applicationName} is requesting verification`

  return (
    <>
      {iframe ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      {verified ? (
        <PhonenumberVerified
          iframe={iframe}
          onPresent={onPresent}
          onSkip={onSkip}
        />
      ) : (
        <PhonenumberUnverified iframe={iframe} />
      )}
    </>
  )
}
