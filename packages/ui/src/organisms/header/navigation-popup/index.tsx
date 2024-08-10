import clsx from "clsx"
import DisconnectIcon from "packages/ui/src/atoms/icons/nav-logout.svg"
import { HTMLAttributes, FC, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { INavigationPopupLinks } from "../profile-header"

export interface IAuthenticatedPopup extends HTMLAttributes<HTMLDivElement> {
  onSignOut: () => void
  anchor: number
  isLanding?: boolean
  links: INavigationPopupLinks[]
}

export const AuthenticatedPopup: FC<IAuthenticatedPopup> = ({
  anchor,
  onSignOut,
  isLanding = false,
  links,
}) => {
  const navigate = useNavigate()

  return (
    <div
      className={clsx(
        "z-40 min-h-[300px] w-[340px] absolute right-0 top-[30px] bg-white p-[20px]",
        "shadow-xl rounded-[24px] flex flex-col justify-between",
      )}
    >
      <div className="mb-[16px]">
        <div
          className={clsx(
            "flex items-center justify-center bg-gray-50 h-[50px] rounded-[12px]",
            "text-xs text-gray-500",
          )}
          id="nfid-anchor"
        >
          NFID number: {anchor}
        </div>
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
        {links.map((linkItem) => {
          if (linkItem.id === "nav-knowledge-base") {
            return (
              <Fragment key={linkItem.id}>
                <a
                  id={linkItem.id}
                  href={linkItem.link}
                  target="_blank"
                  className={clsx(
                    "flex items-center gap-[10px] h-[40px] px-[10px] block",
                    "hover:bg-gray-100 cursor-pointer text-sm block text-black font-semibold",
                  )}
                >
                  <img
                    className="w-[20px] h-[20px]"
                    src={linkItem.icon}
                    alt="nfid navigation"
                  />
                  {linkItem.title}
                </a>
                {linkItem.separator && (
                  <div className="my-[8px] bg-gray-100 h-[1px]"></div>
                )}
              </Fragment>
            )
          }
          return (
            <Fragment key={linkItem.id}>
              <div
                id={linkItem.id}
                onClick={() => navigate(linkItem.link)}
                className={clsx(
                  "flex items-center gap-[10px] h-[40px] px-[10px]",
                  "hover:bg-gray-100 cursor-pointer text-sm block text-black font-semibold",
                )}
              >
                <img
                  className="w-[20px] h-[20px]"
                  src={linkItem.icon}
                  alt="nfid navigation"
                />
                {linkItem.title}
              </div>
              {linkItem.separator && (
                <div className="my-[8px] bg-gray-100 h-[1px]"></div>
              )}
            </Fragment>
          )
        })}
        <div
          id="nav-logout"
          className={clsx(
            "flex items-center gap-[10px] h-[40px] px-[10px]",
            "hover:bg-gray-100 cursor-pointer text-sm block text-black font-semibold",
          )}
          onClick={onSignOut}
        >
          <img
            className="w-[20px] h-[20px]"
            src={DisconnectIcon}
            alt="nfid navigation"
          />
          Disconnect
        </div>
      </div>
    </div>
  )
}

export default AuthenticatedPopup
