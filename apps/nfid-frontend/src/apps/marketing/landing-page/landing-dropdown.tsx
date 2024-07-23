import clsx from "clsx"
import { useState } from "react"

import { Dropdown, DropdownOption } from "@nfid-frontend/ui"

import IconClose from "./assets/menu-close.svg"
import IconMenu from "./assets/menu-white.svg"

type ILandingDropdown = {
  handler: () => void
}

export const LandingDropdown: React.FC<ILandingDropdown> = ({ handler }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Dropdown
        className="text-white bg-[#18181B] overflow-hidden p-[20px] top-[35px] !right-0"
        triggerElement={
          <img
            className={clsx("transition-all", isOpen ? "rotate-180 " : "")}
            src={isOpen ? IconClose : IconMenu}
          />
        }
        setIsOpen={(v) => setIsOpen(v)}
        minWidth={160}
      >
        <DropdownOption
          className="hover:!bg-[#27272A] rounded-lg !gap-0"
          textClassName="!text-white"
          label="Knowledge base"
          link="https://learn.nfid.one/"
        />
        <DropdownOption
          className="hover:!bg-[#27272A] rounded-lg !gap-0"
          textClassName="!text-white"
          label="Get started"
          handler={handler}
        />
      </Dropdown>
    </>
  )
}
