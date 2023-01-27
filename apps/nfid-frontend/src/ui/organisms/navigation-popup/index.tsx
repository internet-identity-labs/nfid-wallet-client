import clsx from "clsx"
import React from "react"
import User from "src/assets/userpics/userpic_6.svg"

import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface IAuthenticatedPopup extends React.HTMLAttributes<HTMLDivElement> {
  onSignOut: () => void
  anchor: number
  isLanding?: boolean
}

const AuthenticatedPopup: React.FC<IAuthenticatedPopup> = ({
  anchor,
  onSignOut,
  isLanding = false,
}) => {
  const { navigate } = useNFIDNavigate()

  return (
    <div
      className={clsx(
        "w-60 z-40 min-h-[260px] absolute right-0 top-[50px] bg-white",
        "shadow-sm rounded-md flex flex-col justify-between",
      )}
    >
      <div className="mb-6">
        <img
          className={clsx("w-20 h-20 mx-auto mt-[30px]")}
          src={User}
          alt="profile icon"
        />
        <p className={clsx("text-xs text-secondary text-center mt-5")}>
          NFID number: {anchor}
        </p>
      </div>
      <div>
        {isLanding ? (
          <div
            className={clsx(
              "w-full h-10 text-center border-t border-gray-200 leading-10",
              "hover:bg-gray-100 cursor-pointer text-sm",
            )}
            id="#profileButton"
            onClick={() => navigate("/profile/assets")}
          >
            NFID Profile
          </div>
        ) : null}
        <a
          className={clsx(
            "w-full h-10 text-center border-t border-gray-200 leading-10",
            "hover:bg-gray-100 cursor-pointer text-sm block",
          )}
          href="/faq"
          target="_blank"
          rel="noreferrer"
        >
          Help
        </a>
        <div
          id="logout"
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

export default AuthenticatedPopup
