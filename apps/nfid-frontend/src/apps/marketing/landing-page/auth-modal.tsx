import React from "react"

import NFIDAuthCoordinator from "frontend/features/authentication/nfid/coordinator"
import { ElementProps } from "frontend/types/react"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

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
      className="!rounded-xl h-[580px]"
    >
      <div className="relative z-10 flex flex-col justify-between w-[95vw] md:w-[450px] h-[580px] p-5">
        <NFIDAuthCoordinator />
      </div>
    </ModalComponent>
  )
}
