import React from "react"
import { Button } from "frontend/ui-kit/src"
import { RadioButton } from "frontend/ui-kit/src/components/atoms/button/radio-button"

interface PhonenumberVerifiedProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
  onPresent: () => void
  onSkip: () => void
}

export const PhonenumberVerified: React.FC<PhonenumberVerifiedProps> = ({
  children,
  className,
  iframe,
  onPresent,
  onSkip,
}) => {
  const [phonenumberCredential, setPhonenumberCredential] = React.useState(
    "rb_phonenumber_credential_present",
  )

  const radioOptions = {
    present: "rb_phonenumber_credential_present",
    skip: "rb_phonenumber_credential_skip",
  }

  const handleContinue = () => {
    if (phonenumberCredential === radioOptions.present) {
      onPresent()
    }

    if (phonenumberCredential === radioOptions.skip) {
      onSkip()
    }
  }

  return (
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

      <Button
        secondary
        block={iframe}
        large={!iframe}
        onClick={handleContinue}
        className="mt-6"
      >
        Continue
      </Button>
    </div>
  )
}
