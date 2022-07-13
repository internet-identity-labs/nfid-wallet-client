import { useAtom } from "jotai"

import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"

export const EnterPhoneNumber: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)
  return (
    <CredentialRequesterNotVerified
      onSubmit={() => send("VALID_PHONE_NUMBER")}
    />
  )
}
