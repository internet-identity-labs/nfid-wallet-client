import clsx from "clsx"
import { Fragment } from "react"
import { useNavigate, Location } from "react-router-dom"
import { IconSwitch } from "packages/ui/src/atoms/icons/switch"

import { INavigationPopupLinks } from "../profile-header"

export const shouldRenderLink = (
  linkItem: INavigationPopupLinks,
  location: Location,
  profileConstants?: {
    base: string
    security: string
    vaults: string
    addressBook: string
    permissions: string
    discovery: string
    privateAccounts: string
  },
) => {
  const { id } = linkItem
  const { pathname } = location

  if (!profileConstants) return true
  if (
    id === "nav-vaults" &&
    (pathname.includes(profileConstants.vaults) ||
      pathname.includes(profileConstants.security) ||
      pathname.includes(profileConstants.addressBook) ||
      pathname.includes(profileConstants.permissions) ||
      pathname.includes(profileConstants.privateAccounts) ||
      pathname.includes(profileConstants.discovery))
  )
    return false
  if (
    id === "nav-assets" &&
    (pathname.includes(profileConstants.base) ||
      pathname.includes(profileConstants.security) ||
      pathname.includes(profileConstants.addressBook) ||
      pathname.includes(profileConstants.permissions) ||
      pathname.includes(profileConstants.privateAccounts) ||
      pathname.includes(profileConstants.discovery) ||
      pathname === profileConstants.vaults)
  )
    return false

  if (
    id === "nav-address-book" &&
    (pathname.includes(profileConstants.addressBook) ||
      pathname.includes(profileConstants.vaults))
  )
    return false

  if (
    id === "nav-security" &&
    (pathname.includes(profileConstants.security) ||
      pathname.includes(profileConstants.vaults))
  )
    return false

  if (
    id === "nav-permissions" &&
    (pathname.includes(profileConstants.permissions) ||
      pathname.includes(profileConstants.vaults))
  )
    return false

  if (
    id === "nav-discovery" &&
    (pathname.includes(profileConstants.discovery) ||
      pathname.includes(profileConstants.vaults))
  )
    return false

  if (
    id === "nav-private-accounts" &&
    (pathname.includes(profileConstants.privateAccounts) ||
      pathname.includes(profileConstants.vaults))
  )
    return false

  if (id === "nav-open-cryptopay" && pathname.includes(profileConstants.vaults))
    return false

  if (id === "nav-view-only" && pathname.includes(profileConstants.vaults))
    return false

  if (
    (id === "nav-vault-name" ||
      id === "nav-vault-policy" ||
      id === "nav-vault-advanced-controls") &&
    !pathname.includes(profileConstants.vaults + "/")
  )
    return false

  return true
}

export const renderLink = (
  linkItem: INavigationPopupLinks,
  navigate: ReturnType<typeof useNavigate>,
  isDarkTheme: boolean,
  onOpenViewOnlyModal: () => void,
  onOpenCryptopayModal: () => void,
  location?: Location,
  isVault?: boolean,
  vaultName?: string,
) => {
  if (isVault) {
    const vaultBase = location?.pathname.match(/^(\/vaults\/[^/]+)/)?.[1]
    return (
      <Fragment key={linkItem.id}>
        <div
          id={linkItem.id}
          className={clsx(
            "flex items-center justify-between px-[10px] py-[14px] rounded-[12px]",
            "hover:bg-gray-50 dark:hover:bg-darkGrayHover/60 cursor-pointer",
          )}
          onClick={() => {
            if (vaultBase) navigate(vaultBase)
          }}
        >
          <span className="text-sm font-bold text-black dark:text-white">
            {vaultName ?? linkItem.title}
          </span>
          <div
            className={clsx(
              "p-1.5 rounded-[8px] text-black dark:text-white",
              "hover:bg-gray-200 dark:hover:bg-zinc-600",
            )}
            onClick={(e) => {
              e.stopPropagation()
              navigate("/vaults")
            }}
          >
            <IconSwitch />
          </div>
        </div>
        {linkItem.separator && (
          <div className="my-[8px] bg-gray-100 dark:bg-zinc-700 h-[1px]"></div>
        )}
      </Fragment>
    )
  }

  const isExternalLink = linkItem.id === "nav-knowledge-base"
  const isModal =
    linkItem.id === "nav-view-only" || linkItem.id === "nav-open-cryptopay"
  const LinkComponent = isExternalLink ? "a" : "div"

  const linkProps = isExternalLink
    ? { href: linkItem.link, target: "_blank" }
    : !isModal
      ? {
          onClick: () => {
            if (linkItem.link.startsWith("/")) {
              navigate(linkItem.link)
            } else {
              const vaultBase =
                location?.pathname.match(/^(\/vaults\/[^/]+)/)?.[1]
              navigate(
                vaultBase ? `${vaultBase}/${linkItem.link}` : linkItem.link,
              )
            }
          },
        }
      : {
          onClick: () => {
            linkItem.id === "nav-open-cryptopay"
              ? onOpenCryptopayModal()
              : onOpenViewOnlyModal()
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
