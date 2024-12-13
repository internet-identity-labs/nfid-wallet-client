import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { useState } from "react"

import { SNS_STEP_VISITED } from "frontend/features/authentication/constants"

import { SnsBanner } from "./sns-banner"

export function SnsModal() {
  const [isVisible, setIsVisible] = useState(
    !localStorage.getItem(SNS_STEP_VISITED),
  )

  return (
    <ModalComponent
      className="w-[calc(100%-60px)] sm:w-[80%] xl:w-[1012px] max-h-[calc(100vh-40px)] !bg-transparent"
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
    >
      <SnsBanner />
    </ModalComponent>
  )
}
