import { useState } from "react"

import { BurgerMenu, Dropdown, DropdownOption } from "@nfid-frontend/ui"

type ILandingDropdown = {
  handler: () => void
  logoutHandler: () => void
  isAuthenticated: boolean
}

export const LandingDropdown: React.FC<ILandingDropdown> = ({
  handler,
  logoutHandler,
  isAuthenticated,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Dropdown
        className="!rounded-[24px] text-white !bg-zinc-900 overflow-hidden p-[20px] top-[45px] !right-0"
        triggerElement={<BurgerMenu isOpened={isOpen} isLanding={true} />}
        setIsOpen={(v) => setIsOpen(v)}
        minWidth={160}
      >
        {isAuthenticated ? (
          <>
            <DropdownOption
              className="hover:!bg-zinc-800 rounded-[12px] !gap-0"
              textClassName="!text-white"
              label="Profile"
              handler={handler}
            />
            <DropdownOption
              className="hover:!bg-zinc-800 rounded-[12px] !gap-0"
              textClassName="!text-white"
              label="Sign out"
              handler={logoutHandler}
            />
          </>
        ) : (
          <DropdownOption
            className="hover:!bg-zinc-800 rounded-[12px] !gap-0"
            textClassName="!text-white"
            label="Sign in"
            handler={handler}
          />
        )}
      </Dropdown>
    </>
  )
}
