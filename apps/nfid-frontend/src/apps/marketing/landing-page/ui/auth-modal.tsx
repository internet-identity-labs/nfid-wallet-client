import React from "react"

import { ModalComponent } from "@nfid/ui/molecules/modal"

import NFIDAuthCoordinator from "frontend/features/authentication/nfid/coordinator"
import { ElementProps } from "frontend/types/react"

interface HeroRightSideProps extends ElementProps<HTMLDivElement> {
  isVisible: boolean
  onClose: () => void
}

export const NFIDAuthentication: React.FC<HeroRightSideProps> = ({
  isVisible,
  onClose,
}) => {
  return (
    <ModalComponent
      onClose={onClose}
      isVisible={isVisible}
      className="!rounded-[24px] overflow-hidden"
    >
      <div className="relative z-10 flex flex-col justify-between w-[95vw] sm:w-[450px] min-h-[600px] p-5">
        {isVisible && <NFIDAuthCoordinator />}
      </div>
    </ModalComponent>
  )
}
