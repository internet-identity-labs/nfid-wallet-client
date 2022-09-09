import React from "react"

import { Button } from "frontend/ui/atoms/button"
import { RadioButton } from "frontend/ui/atoms/button/radio"
import ErrorDisplay from "frontend/ui/atoms/error"
import { P } from "frontend/ui/atoms/typography/paragraph"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"

interface CredentialRequesterVerifiedProps {
  applicationLogo?: string
  applicationName?: string
  onPresent: () => void
  onSkip: () => void
  error?: string
}

export const CredentialRequesterVerified: React.FC<
  CredentialRequesterVerifiedProps
> = ({ applicationLogo, applicationName, onPresent, onSkip, error }) => {
  const [radioValue, setRadioValue] = React.useState("rb_present")

  const handleClick = () => {
    if (radioValue === "rb_present") onPresent()
    else onSkip()
  }

  return (
    <>
      <ApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title={"Verification request"}
        subTitle={`to continue to ${applicationName ?? "the application"}`}
      />
      <P className="mt-5 text-sm">
        You already have a verified phone credential from Internet Identity
        Labs.
      </P>
      <P className="mt-2 text-sm">Would you like to present it now?</P>
      <div className="py-3">
        <RadioButton
          onChange={() => setRadioValue("rb_present")}
          checked={radioValue === "rb_present"}
          value={"rb_present"}
          name={"rb_present"}
          text={"Yes, present it anonymously"}
        />
        <RadioButton
          onChange={() => setRadioValue("rb_skip")}
          checked={radioValue === "rb_skip"}
          value={"rb_skip"}
          name={"rb_skip"}
          text={"Skip for now"}
        />
      </div>
      <Button
        primary
        className="px-10 mb-6 sm:mt-2"
        block
        onClick={handleClick}
      >
        Continue
      </Button>
      {error && <ErrorDisplay>{error}</ErrorDisplay>}
    </>
  )
}
