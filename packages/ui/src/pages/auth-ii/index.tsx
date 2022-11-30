import clsx from "clsx"
import React, { useState } from "react"

import { Button } from "@nfid-frontend/ui"

import { RadioButton } from "../../atoms/radio"
import { SDKApplicationMeta } from "../../molecules/sdk-app-meta"

export interface AuthWithIIProps {
  applicationName?: string
  applicationLogo?: string
  onBack: () => void
  onContinue: (a: "new_nfid" | "existing_nfid") => void
}

export const IIAuthEntry: React.FC<AuthWithIIProps> = ({
  applicationName,
  applicationLogo,
  onBack,
  onContinue,
}) => {
  const [signType, setSignType] = useState<"new_nfid" | "existing_nfid">(
    "new_nfid",
  )

  return (
    <div>
      <SDKApplicationMeta
        applicationLogo={applicationLogo}
        title="Sign in"
        subTitle={`Choose how you’d like to sign in to ${applicationName}`}
      />
      <p className="mb-5 text-sm mt-7">
        Have you already used II to create an NFID?
      </p>
      <RadioButton
        name={"sign_with_ii"}
        text="No, I need to create an NFID"
        id="radio_new_nfid"
        value="new_nfid"
        defaultChecked
        onClick={() => setSignType("new_nfid")}
      />
      <RadioButton
        name={"sign_with_ii"}
        text="Yes, sign me in with Internet Identity"
        id="radio_existing_nfid"
        value="existing_nfid"
        onClick={() => setSignType("existing_nfid")}
      />
      <div className={clsx("w-full grid grid-cols-2 gap-5 mt-10")}>
        <Button type="stroke" onClick={onBack}>
          Back
        </Button>
        <Button type="primary" onClick={() => onContinue(signType)}>
          Continue
        </Button>
      </div>
    </div>
  )
}
