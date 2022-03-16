import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import { IFrame } from "@identity-labs/ui"
import React from "react"

interface RequestCredentialProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RequestCredential: React.FC<RequestCredentialProps> = ({
  children,
  className,
}) => {
  const { identityProvider } = useInternetIdentity()

  // TODO: Remove this once we have a way to get the url from II plugin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [protocol, _, domain] = identityProvider.split("/")
  const phonenumberCredentialProvider = `${protocol}//${domain}/request-credential-iframe/phonenumber`

  return <IFrame src={phonenumberCredentialProvider} />
}
