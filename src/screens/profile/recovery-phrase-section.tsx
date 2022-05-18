import clsx from "clsx"
import React from "react"

import { IconRecovery } from "frontend/design-system/atoms/icons/recovery"
import { H5 } from "frontend/design-system/atoms/typography"
import { DeviceData } from "frontend/services/internet-identity/generated/internet_identity_types"

interface RecoveryPhraseSectionProps {
  recoveryPhrase: DeviceData
}

export const RecoveryPhraseSection: React.FC<RecoveryPhraseSectionProps> = ({
  recoveryPhrase,
}) => {
  return (
    <div className={clsx("px-5 md:px-16 pt-8", "bg-white flex-1")}>
      <div className="flex items-center justify-between mb-3">
        <H5>Recovery Phrase</H5>
      </div>
      <div
        className={clsx(
          "relative flex flex-row hover:bg-gray-200 hover:rounded transition-colors duration-100 -mx-3 mt-2",
        )}
      >
        <div className="flex flex-wrap items-center flex-1 px-3 py-2 cursor-pointer select-none peer">
          <div className="mr-4">
            <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
              <IconRecovery />
            </div>
          </div>

          <div className="relative flex items-center flex-1">
            <div className="flex-1 flex-shrink">
              <div className="text-gray-700">{recoveryPhrase.alias}</div>
              <div className="my-1 text-sm text-gray-400">
                {/* TODO: LAST USED AND BROWSER */}
              </div>
            </div>
          </div>
          <div className="absolute left-0 w-full mx-3 border-b -bottom-1"></div>
        </div>
      </div>
    </div>
  )
}
