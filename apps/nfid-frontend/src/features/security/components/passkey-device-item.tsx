import clsx from "clsx"
import React from "react"

import {
  IconCmpDots,
  IconCmpWarning,
  Tooltip,
  useClickOutside,
} from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"

import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"

import { IHandleWithLoading } from ".."
import { DetailsPasskey } from "../passkey/details-passkey"
import { DeletePasskey } from "../passkey/remove-passkey"
import { IDevice } from "../types"

export interface PasskeyDeviceItemProps {
  showLastPasskeyWarning: boolean
  device: IDevice
  handleWithLoading: IHandleWithLoading
}

export const PasskeyDeviceItem = ({
  showLastPasskeyWarning,
  device,
  handleWithLoading,
}: PasskeyDeviceItemProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))

  return (
    <tr className="items-center text-sm border-b border-gray-200">
      <td className="flex h-[61px] items-center">
        <div className="flex items-center w-10 shrink-0">
          <DeviceIconDecider
            icon={device.isLegacyDevice ? Icon.unknown : device.icon}
          />
        </div>
        {device.label.length ? (
          <span>{device.label}</span>
        ) : (
          <span className="text-sm text-gray-400">
            This is not an NFID device
          </span>
        )}
        {device.isMultiDevice && (
          <span className="ml-2.5 px-2 py-1 text-gray-600 uppercase bg-gray-50 font-bold tracking-[0.2px] text-[10px]">
            Multi-device
          </span>
        )}
      </td>
      <td className="hidden sm:table-cell">{device.created_at}</td>
      <td className="hidden sm:table-cell">{device.last_used}</td>
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
            <DetailsPasskey device={device}>
              <div
                className={clsx(
                  "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                  "flex items-center space-x-2 cursor-pointer",
                )}
              >
                <span>Details</span>
              </div>
            </DetailsPasskey>
            <DeletePasskey
              handleWithLoading={handleWithLoading}
              device={device}
              showLastPasskeyWarning={showLastPasskeyWarning}
            >
              <div
                className={clsx(
                  "pl-[10px] leading-10 hover:bg-gray-100 rounded-md",
                  "flex items-center space-x-2 cursor-pointer",
                )}
              >
                <span>Delete</span>
              </div>
            </DeletePasskey>
          </div>
        </div>
      </td>
    </tr>
  )
}
