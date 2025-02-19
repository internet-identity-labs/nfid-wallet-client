import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React from "react"

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
      className="!rounded-[24px]"
    >
      <div className="relative z-10 flex flex-col justify-between w-[95vw] sm:w-[450px] h-[600px] p-5">
        {isVisible && <NFIDAuthCoordinator />}
      </div>
    </ModalComponent>
  )
}
