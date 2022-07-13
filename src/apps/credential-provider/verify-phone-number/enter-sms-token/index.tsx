import { useAtom } from "jotai"

import { CredentialRequesterSMSVerify } from "frontend/ui/pages/credential-requester/sms-verify"

export const EnterSMSToken: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)
  return (
    <CredentialRequesterSMSVerify
      onSubmit={() => send("VALID_TOKEN") as any}
      onChangePhone={() => send("CHANGE_PHONE_NUMBER") as any}
      onResendCode={function (): void {
        throw new Error("Function onResendCode not implemented.")
      }}
    />
  )
}
