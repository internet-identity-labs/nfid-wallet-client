import {
  MenuWrapper,
  NFIDLogo,
  SidebarItem,
  SidebarWrapper,
} from "@nfid-frontend/ui"
import clsx from "clsx"
import { Helmet } from "react-helmet-async"
import { BiMobile, BiWallet } from "react-icons/bi"

import { Link, NavLink } from "./common"
import { RoutePathPhoneNumberVerification } from "./phone-number-credential"
import { RoutePath as RoutePathRequestTransfer } from "./request-transfer"

interface PageTemplateProps {
  title: string
  children: React.ReactNode | React.ReactNode[]
}

export const PageTemplate: React.FC<PageTemplateProps> = ({
  children,
  title,
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
            "h-full w-72",
          )}
        >
          <SidebarWrapper>
            <NavLink route={RoutePathPhoneNumberVerification}>
              <SidebarItem
                icon={<BiMobile />}
                title="Phone number verification"
              />
            </NavLink>
            <NavLink route={RoutePathRequestTransfer}>
              <SidebarItem icon={<BiWallet />} title="Request transfer" />
            </NavLink>
          </SidebarWrapper>
        </div>
        <div className="w-full px-5 py-6">{children}</div>
      </div>
    </div>
  </>
)
