import clsx from "clsx"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Dropdown, DropdownOption } from "@nfid-frontend/ui"

import IconClose from "../assets/menu-close.svg"
import IconMenu from "../assets/menu-white.svg"

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
        className="!rounded-[24px] text-white !bg-[#18181B] overflow-hidden p-[20px] top-[35px] !right-0"
        triggerElement={
          <img
            className={clsx(
              "transition-all cursor-pointer",
              isOpen ? "rotate-180 " : "",
            )}
            src={isOpen ? IconClose : IconMenu}
          />
        }
        setIsOpen={(v) => setIsOpen(v)}
        minWidth={160}
      >
        <DropdownOption
          className="hover:!bg-[#27272A] rounded-[12px] !gap-0"
          textClassName="!text-white"
          element={({ className }) => (
            <Link className={className} to="/sns">
              Sns
            </Link>
          )}
        />
        <DropdownOption
          className="hover:!bg-[#27272A] rounded-[12px] !gap-0"
          textClassName="!text-white"
          label="Knowledge base"
          link="https://learn.nfid.one/"
        />
        {isAuthenticated ? (
          <>
            <DropdownOption
              className="hover:!bg-[#27272A] rounded-[12px] !gap-0"
              textClassName="!text-white"
              label="Profile"
              handler={handler}
            />
            <DropdownOption
              className="hover:!bg-[#27272A] rounded-[12px] !gap-0"
              textClassName="!text-white"
              label="Sign out"
              handler={logoutHandler}
            />
          </>
        ) : (
          <DropdownOption
            className="hover:!bg-[#27272A] rounded-[12px] !gap-0"
            textClassName="!text-white"
            label="Sign in"
            handler={handler}
          />
        )}
      </Dropdown>
    </>
  )
}