import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { useState } from "react"

import { SnsBanner } from "./sns-banner"

export function SnsModal() {
  const [isVisible, setIsVisible] = useState(
    !localStorage.getItem("sns-page-visited"),
  )

  return (
    <ModalComponent
      className="w-[calc(100%-60px)] sm:w-[80%] xl:w-[1012px] max-h-[calc(100vh-40px)]"
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
    >
      <SnsBanner />
    </ModalComponent>
  )
}
