import clsx from "clsx"
import React, { useCallback } from "react"

import {
  IconCmpDots,
  IconCmpWarning,
  Tooltip,
  useClickOutside,
} from "@nfid-frontend/ui"

import { removeAccessPointFacade } from "frontend/integration/facade"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"

import { IHandleWithLoading } from ".."
import { IDevice } from "../types"

export interface PasskeyDeviceItemProps {
  device: IDevice
  handleWithLoading: IHandleWithLoading
}

export const PasskeyDeviceItem = ({
  device,
  handleWithLoading,
}: PasskeyDeviceItemProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))

  const { profile } = useProfile()

  const onDelete = useCallback(async () => {
    if (device.isLegacyDevice) {
      handleWithLoading(() =>
        removeAccessPointFacade(BigInt(profile?.anchor!), device.principal),
      )
    } else handleWithLoading(() => removeAccessPoint(device.principal))
  }, [
    device.isLegacyDevice,
    device.principal,
    handleWithLoading,
    profile?.anchor,
  ])

  return (
    <tr className="items-center text-sm border-b border-gray-200">
      <td className="flex h-[61px] items-center">
        <div className="flex items-center w-10 shrink-0">
          <DeviceIconDecider icon={device.icon} />
        </div>
        <span>{device.label}</span>
        {device.isMultiDevice && (
          <span className="ml-2.5 px-2 py-1 text-gray-600 uppercase bg-gray-50 font-bold tracking-[0.2px] text-[10px]">
            Multi-device
          </span>
        )}
      </td>
      <td>{device.created_at}</td>
      <td>{device.last_used}</td>
      <td className="w-11 pr-[14px]">
        {device.isLegacyDevice && (
          <Tooltip
            className="w-[262px] !p-2.5"
            tip={
              "This is a legacy passkey and should be replaced with an upgraded one."
            }
          >
            <IconCmpWarning className="w-[18px] text-orange" />
          </Tooltip>
        )}
      </td>
      <td className="w-6">
        <div className="relative w-6 shrink-0" ref={ref}>
          <IconCmpDots
            className={clsx(
              "text-secondary cursor-pointer hover:text-black",
              "rotate-90 shrink-0",
            )}
            onClick={(e) => {
              e.preventDefault()
              setIsTooltipOpen(!isTooltipOpen)
            }}
          />
          <div
            className={clsx(
              "absolute top-6 right-0 w-[150px]",
              "bg-white rounded-md shadow-md",
              "text-sm z-10",
              !isTooltipOpen && "hidden",
            )}
          >
            {/* <div
              className={clsx(
                "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                "flex items-center space-x-2 cursor-pointer",
              )}
            >
              <span>Details</span>
            </div> */}
            {/* <div
              className={clsx(
                "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                "flex items-center space-x-2",
              )}
            >
              <span>Rename</span>
            </div> */}
            <div
              className={clsx(
                "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                "flex items-center space-x-2 cursor-pointer",
              )}
              onClick={onDelete}
            >
              <span>Delete</span>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}