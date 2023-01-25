import clsx from "clsx"
import { Helmet } from "react-helmet-async"
import { BiMobile, BiWallet, BiUser, BiLock } from "react-icons/bi"

import {
  MenuWrapper,
  NFIDLogo,
  SidebarItem,
  SidebarWrapper,
} from "@nfid-frontend/ui"

import { RoutePathAuthentication } from "./authentication"
import { RoutePathAuthenticationIFrame } from "./authentication-iframe"
import { Link, NavLink } from "./common"
import { RoutePathGetAccounts } from "./get-accounts"
import { RoutePathPhoneNumberVerification } from "./phone-number-credential"
import { RoutePath as RoutePathRequestTransfer } from "./request-transfer"

interface PageTemplateProps {
  title: string
  children: React.ReactNode | React.ReactNode[]
  className?: string
}

export const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  title,
  className,
}) => (
  <>
    <Helmet>
      <title>NFIDemo | {title}</title>
    </Helmet>
    <div className={clsx("flex flex-col", "h-full")}>
      <MenuWrapper>
        <Link to="/">
          <NFIDLogo />
        </Link>
        <div className="text-2xl font-bold">Testbed</div>
      </MenuWrapper>
      <div className={clsx("flex h-full")}>
        <div
          className={clsx(
            "px-5 py-6",
            "border-gray-100 border-r",
            "h-full w-72 shrink-0",
          )}
        >
          <SidebarWrapper>
            <NavLink route={RoutePathAuthentication}>
              <SidebarItem icon={<BiLock />} title="Authentication" />
            </NavLink>
            <NavLink route={RoutePathAuthenticationIFrame}>
              <SidebarItem icon={<BiLock />} title="Authentication iFrame" />
            </NavLink>
            <NavLink route={RoutePathPhoneNumberVerification}>
              <SidebarItem
                icon={<BiMobile />}
                title="Phone number verification"
              />
            </NavLink>
            <NavLink route={RoutePathRequestTransfer}>
              <SidebarItem icon={<BiWallet />} title="Request transfer" />
            </NavLink>
            <NavLink route={RoutePathGetAccounts}>
              <SidebarItem icon={<BiUser />} title="Request accounts" />
            </NavLink>
          </SidebarWrapper>
        </div>
        <div className={clsx("w-full px-5 py-6", className)}>{children}</div>
      </div>
    </div>
  </>
)
