import { PencilIcon, TrashIcon } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import { format } from "date-fns"
import React from "react"

import { IconRecovery } from "frontend/design-system/atoms/icons/recovery"
import { USBIcon } from "frontend/design-system/atoms/icons/usb"

import { recoveryMethod } from "../"

interface recoveryMethodListItemProps {
  recoveryMethod: recoveryMethod
  onRecoveryUpdate: (recoveryMethod: recoveryMethod) => Promise<void>
  onRecoveryDelete: (recoveryMethod: recoveryMethod) => Promise<void>
}

export const RecoveryMethodListItem: React.FC<recoveryMethodListItemProps> = ({
  recoveryMethod,
  onRecoveryUpdate,
  onRecoveryDelete,
}) => {
  return (
    <div
      className={clsx(
        "relative flex flex-row hover:bg-gray-200 hover:rounded transition-colors duration-100 -mx-3 mt-2",
      )}
    >
      <div className="flex flex-wrap items-center flex-1 px-3 py-2 cursor-pointer select-none peer">
        <div className="mr-4">
          <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
            {recoveryMethod.isSecurityKey ? <USBIcon /> : <IconRecovery />}
          </div>
        </div>

        <div className="relative flex items-center flex-1">
          <div className="flex-1 flex-shrink">
            <div className="flex-1 flex-shrink">
              <div className="text-gray-700">{recoveryMethod.label}</div>
              <div className="my-1 text-sm text-gray-400">
                {recoveryMethod.lastUsed &&
                  format(recoveryMethod.lastUsed, "eee d, yyyy")}
              </div>
            </div>
          </div>
        </div>
        <div className="pl-1 md:pl-4">
          <div
            className="flex space-x-2"
            style={{ display: !recoveryMethod.isSecurityKey ? "none" : "" }}
          >
            <div className="hover:bg-gray-200 text-red-base">
              <PencilIcon />
            </div>
            <div className="hover:bg-gray-200 text-red-base">
              <TrashIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-0 w-full mx-3 border-b -bottom-1"></div>
    </div>
  )
}
