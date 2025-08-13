import clsx from "clsx"
import { motion } from "framer-motion"
import React from "react"

import { IconCmpDots, IconCmpWarning, Tooltip } from "@nfid-frontend/ui"
import { useClickOutside } from "@nfid-frontend/utils"
import { Icon } from "@nfid/integration"

import { useDarkTheme } from "frontend/hooks"
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
  const isDarkTheme = useDarkTheme()
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false)
  const ref = useClickOutside(() => setIsTooltipOpen(false))

  return (
    <tr className="items-center text-sm border-b border-gray-200 dark:border-zinc-700">
      <td className="flex h-[61px] items-center">
        <div className="flex items-center w-[24px] h-[24px] shrink-0 ml-2 mr-[26px]">
          <DeviceIconDecider
            color={isDarkTheme ? "#71717A" : "#9CA3AF"}
            icon={device.isLegacyDevice ? Icon.unknown : device.icon}
          />
        </div>
        {device.label.length ? (
          <div>
            <p className="dark:text-white leading-[26px]">{device.label}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 leading-[16px]">
              {device.origin}
            </p>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-zinc-500">
            This is not an NFID device
          </span>
        )}
        {device.isMultiDevice && (
          <span className="ml-2.5 px-2 py-1 text-gray-600 dark:text-white uppercase bg-gray-50 dark:bg-zinc-700 font-bold tracking-[0.2px] text-[10px] rounded-[6px]">
            Multi-device
          </span>
        )}
      </td>
      <td className="hidden sm:table-cell dark:text-white">
        {device.created_at}
      </td>
      <td className="hidden sm:table-cell dark:text-white">
        {device.last_used}
      </td>
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
            className="cursor-pointer text-secondary dark:text-zinc-500 hover:text-black shrink-0"
            onClick={(e) => {
              e.preventDefault()
              setIsTooltipOpen(!isTooltipOpen)
            }}
          />
          <>
            {isTooltipOpen && (
              <motion.div
                key="passkeys"
                className={clsx(
                  "absolute top-6 right-0 w-[150px]",
                  "bg-white dark:bg-darkGray rounded-[12px] shadow-md",
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
                      "pl-[10px] leading-10 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-[12px]",
                      "flex items-center space-x-2 cursor-pointer",
                    )}
                  >
                    <span className="dark:text-white">Details</span>
                  </div>
                </DetailsPasskey>
                <DeletePasskey
                  handleWithLoading={handleWithLoading}
                  device={device}
                  showLastPasskeyWarning={showLastPasskeyWarning}
                >
                  <div
                    className={clsx(
                      "pl-[10px] leading-10 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-[12px]",
                      "flex items-center space-x-2 cursor-pointer",
                    )}
                  >
                    <span className="dark:text-white">Remove</span>
                  </div>
                </DeletePasskey>
              </motion.div>
            )}
          </>
        </div>
      </td>
    </tr>
  )
}
