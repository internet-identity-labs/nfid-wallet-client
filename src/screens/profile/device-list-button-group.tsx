import {
  MobileIcon,
  TabletIcon,
  DesktopIcon,
  LaptopIcon,
  KeyIcon,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

interface DeviceListButtonGroupProps {}

export const DeviceListButtonGroup: React.FC<
  DeviceListButtonGroupProps
> = () => {
  return (
    <div className="flex justify-center space-x-2">
      <MobileIcon onClick={function noRefCheck() {}} />
      <TabletIcon onClick={function noRefCheck() {}} />
      <DesktopIcon onClick={() => {}} />
      <LaptopIcon onClick={function noRefCheck() {}} />
      <KeyIcon onClick={function noRefCheck() {}} />
    </div>
  )
}
