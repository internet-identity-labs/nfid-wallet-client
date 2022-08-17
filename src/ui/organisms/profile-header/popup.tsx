import clsx from "clsx"
import React from "react"

import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import ProfileIcon from "./assets/profile_img_dark.svg"

interface IProfileHeaderPopup extends React.HTMLAttributes<HTMLDivElement> {
  onSignOut: () => void
  anchor: number
}

const ProfileHeaderPopup: React.FC<IProfileHeaderPopup> = ({
  anchor,
  onSignOut,
}) => {
  const { navigate } = useNFIDNavigate()

  return (
    <div
      className={clsx(
        "w-60 z-40 h-[260px] absolute right-0 top-[50px] bg-white",
        "shadow-iframe rounded-md flex flex-col justify-between",
      )}
    >
      <div>
        <img
          className={clsx("w-20 h-20 mx-auto mt-[30px]")}
          src={ProfileIcon}
          alt="profile icon"
        />
        <p className={clsx("text-xs text-gray-400 text-center mt-5")}>
          NFID number: {anchor}
        </p>
      </div>
      <div>
        <div
          className={clsx(
            "w-full h-10 text-center border-t border-gray-200 leading-10",
            "hover:bg-gray-100 cursor-pointer text-sm",
          )}
          onClick={() => navigate("/faq")}
        >
          Help
        </div>
        <div
          className={clsx(
            "w-full h-10 text-center border-t border-gray-200 leading-10",
            "hover:bg-gray-100 cursor-pointer text-sm rounded-b-md",
          )}
          onClick={onSignOut}
        >
          Sign out
        </div>
      </div>
    </div>
  )
}

export default ProfileHeaderPopup
