import { useMultipass } from "frontend/hooks/use-multipass"
import { Button, H2, H5 } from "frontend/ui-kit/src"
import { RadioButton } from "frontend/ui-kit/src/components/atoms/button/radio-button"
import React from "react"

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

  const [phonenumberCredential, setPhonenumberCredential] = React.useState(
    "rb_phonenumber_credential_present",
  )

  const verified = true
  const title = `${applicationName} is requesting verification`

  const radioOptions = {
    present: "rb_phonenumber_credential_present",
    skip: "rb_phonenumber_credential_skip",
  }

  const handleClick = () => {
    if (phonenumberCredential === radioOptions.present) {
      onPresent()
    }

    if (phonenumberCredential === radioOptions.skip) {
      onSkip()
    }
  }

  return (
    <>
      {iframe ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      {verified ? (
        <div>
          <div>You already have a verified phone number credential.</div>
          <div className="mt-3 mb-5">Would you like to present it now?</div>

          <RadioButton
            checked={phonenumberCredential === radioOptions.present}
            name={radioOptions.present}
            text={"Yes, prove I've verified my phone number"}
            value={radioOptions.present}
            onChange={() => setPhonenumberCredential(radioOptions.present)}
          />
          <RadioButton
            checked={phonenumberCredential === radioOptions.skip}
            name={radioOptions.skip}
            text={"Skip for now"}
            value={radioOptions.skip}
            onChange={() => setPhonenumberCredential(radioOptions.skip)}
          />

          <div className="mt-6">
            <Button
              secondary
              block={iframe}
              large={!iframe}
              onClick={handleClick}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}
