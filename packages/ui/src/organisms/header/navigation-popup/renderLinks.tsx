import clsx from "clsx"
import { Fragment } from "react"
import { useNavigate, Location } from "react-router-dom"

import { NFIDTheme } from "frontend/App"
import { useDarkTheme } from "frontend/hooks"

import { INavigationPopupLinks } from "../profile-header"

export const shouldRenderLink = (
  linkItem: INavigationPopupLinks,
  hasVaults: boolean,
  location: Location,
  profileConstants?: {
    base: string
    security: string
    vaults: string
  },
) => {
  const { id } = linkItem
  const { pathname } = location

  if (!hasVaults && id === "nav-vaults") return false
  if (!profileConstants) return true
  if (id === "nav-vaults" && pathname.includes(profileConstants.vaults))
    return false
  if (
    id === "nav-assets" &&
    (pathname.includes(profileConstants.base) ||
      pathname.includes(profileConstants.security))
  )
    return false

  return true
}

export const renderLink = (
  linkItem: INavigationPopupLinks,
  navigate: ReturnType<typeof useNavigate>,
  location: Location,
  walletTheme: NFIDTheme,
  profileConstants?: {
    security: string
  },
) => {
  const isDarkTheme = useDarkTheme()
  const isExternalLink = linkItem.id === "nav-knowledge-base"
  const LinkComponent = isExternalLink ? "a" : "div"
  const linkProps = isExternalLink
    ? { href: linkItem.link, target: "_blank" }
    : {
        onClick: () => {
          if (
            linkItem.id === "nav-security" &&
            location.pathname === profileConstants?.security
          ) {
            navigate(0)
          } else {
            navigate(linkItem.link)
          }
        },
      }

  return (
    <Fragment key={linkItem.id}>
      <LinkComponent
        id={linkItem.id}
        {...linkProps}
        className={clsx(
          "flex items-center gap-[10px] h-[40px] px-[10px] rounded-[12px]",
          "hover:bg-gray-50 dark:hover:bg-darkGrayHover/60 cursor-pointer text-sm block text-black dark:text-white font-semibold",
        )}
      >
        {linkItem.icon && (
          <linkItem.icon strokeColor={isDarkTheme ? "white" : "black"} />
        )}
        {linkItem.title}
      </LinkComponent>
      {linkItem.separator && (
        <div className="my-[8px] bg-gray-100 dark:bg-zinc-700 h-[1px]"></div>
      )}
    </Fragment>
  )
}
