import {
  MenuWrapper,
  NFIDLogo,
  SidebarItem,
  SidebarWrapper,
} from "@nfid-frontend/ui"
import clsx from "clsx"
import { BiMobile, BiWallet } from "react-icons/bi"

import { NavLink } from "./modules/common"
import { PagePhoneNumberVerification } from "./modules/phone-number-verification/page"
import { RoutePath as RoutePhoneNumberVerification } from "./modules/phone-number-verification/route"
import { PageRequestTransfer } from "./modules/request-transfer/page"
import { RoutePath as RouteRequestTransfer } from "./modules/request-transfer/route"

export function App() {
  return (
    <div className={clsx("flex flex-col", "h-full")}>
      <MenuWrapper>
        <NFIDLogo />
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
            <NavLink route={RoutePhoneNumberVerification}>
              <SidebarItem
                icon={<BiMobile />}
                title="Phone number verification"
              />
            </NavLink>
            <NavLink route={RouteRequestTransfer}>
              <SidebarItem icon={<BiWallet />} title="Request transfer" />
            </NavLink>
          </SidebarWrapper>
        </div>
        <div className="w-full px-5 py-6">
          <PagePhoneNumberVerification />
          <PageRequestTransfer />
        </div>
      </div>
    </div>
  )
}

export default App
