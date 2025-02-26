import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

import { IconCmpDots, IconCmpWarning, Tooltip } from "@nfid-frontend/ui"
import { useClickOutside } from "@nfid-frontend/utils"
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
        <div className="flex items-center w-[24px] h-[24px] shrink-0 ml-2 mr-[26px]">
          <DeviceIconDecider
            color="#9CA3AF"
            icon={device.isLegacyDevice ? Icon.unknown : device.icon}
          />
        </div>
        {device.label.length ? (
          <div>
            <p className="leading-[26px]">{device.label}</p>
            <p className="text-xs text-gray-400 leading-[16px]">
              {device.origin}
            </p>
          </div>
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
              "This is a legacy Passkey and should be replaced with an upgraded one."
            }
          >
            <IconCmpWarning className="w-[18px] text-orange" />
          </Tooltip>
        )}
      </td>
      <td className="w-6">
        <div className="relative w-6 shrink-0" ref={ref}>
          <IconCmpDots
            className="cursor-pointer text-secondary hover:text-black shrink-0"
            onClick={(e) => {
              e.preventDefault()
              setIsTooltipOpen(!isTooltipOpen)
            }}
          />
          <AnimatePresence>
            {isTooltipOpen && (
              <motion.div
                className={clsx(
                  "absolute top-6 right-0 w-[150px]",
                  "bg-white rounded-[12px] shadow-md",
                  "text-sm z-10",
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <DetailsPasskey device={device}>
                  <div
                    className={clsx(
                      "pl-[10px] leading-10 hover:bg-gray-100 rounded-[12px]",
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
                      "pl-[10px] leading-10 hover:bg-gray-100 rounded-[12px]",
                      "flex items-center space-x-2 cursor-pointer",
                    )}
                  >
                    <span>Remove</span>
                  </div>
                </DeletePasskey>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  )
}
