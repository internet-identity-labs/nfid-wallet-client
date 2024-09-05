import clsx from "clsx"
import { Fragment } from "react"
import { useNavigate, Location } from "react-router-dom"

import { INavigationPopupLinks } from "../profile-header"

export const shouldRenderLink = (
  linkItem: INavigationPopupLinks,
  hasVaults: boolean,
  location: Location,
) => {
  const { id } = linkItem
  const { pathname } = location

  if (!hasVaults && id === "nav-vaults") return false
  if (id === "nav-vaults" && pathname === "/vaults") return false
  if (id === "nav-assets" && pathname.includes("/wallet")) return false

  return true
}

export const renderLink = (
  linkItem: INavigationPopupLinks,
  navigate: ReturnType<typeof useNavigate>,
) => {
  const isExternalLink = linkItem.id === "nav-knowledge-base"
  const LinkComponent = isExternalLink ? "a" : "div"
  const linkProps = isExternalLink
    ? { href: linkItem.link, target: "_blank" }
    : { onClick: () => navigate(linkItem.link) }

  return (
    <Fragment key={linkItem.id}>
      <LinkComponent
        id={linkItem.id}
        {...linkProps}
        className={clsx(
          "flex items-center gap-[10px] h-[40px] px-[10px]",
          "hover:bg-gray-100 cursor-pointer text-sm block text-black font-semibold",
        )}
      >
        <img
          className="w-[20px] h-[20px]"
          src={linkItem.icon}
          alt={`${linkItem.title} icon`}
        />
        {linkItem.title}
      </LinkComponent>
      {linkItem.separator && (
        <div className="my-[8px] bg-gray-100 h-[1px]"></div>
      )}
    </Fragment>
  )
}
