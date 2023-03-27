import { BlurredLoader, Button } from "@nfid-frontend/ui"
import { Image } from "@nfid-frontend/ui"

import securityKey from "./assets/security-key.png"
import webauthn from "./assets/webauthn.png"

export interface IIframeTrustDevice {
  isWebAuthN: boolean
  onSkip: () => void
  onTrust: () => void
  isLoading?: boolean
}

export const IframeTrustDevice = ({
  isWebAuthN,
  onSkip,
  onTrust,
  isLoading = false,
}: IIframeTrustDevice) => {
  return (
    <BlurredLoader isLoading={isLoading} className="p-0">
      <p className="mb-4 text-xl font-bold">
        {isWebAuthN ? "Trust this device" : "Register security key"}
      </p>
      <p className="text-sm">
        {isWebAuthN
          ? "Add a passkey for this browser on this device to sign in to NFID faster with a look, touch, or PIN."
          : "Add a passkey on your security key to sign in to NFID faster next time."}
      </p>
      <Image
        className="max-h-[200px] mx-auto mt-6 mb-7"
        src={isWebAuthN ? webauthn : securityKey}
        alt="webauthn"
      />
      <div className="flex justify-between gap-5">
        <Button type="stroke" className="w-full" onClick={onSkip}>
          Skip for now
        </Button>
        <Button type="primary" className="w-full" onClick={onTrust}>
          Add passkey
        </Button>
      </div>
    </BlurredLoader>
  )
}
