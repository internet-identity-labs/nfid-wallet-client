import clsx from "clsx"
import React from "react"

import { Button } from "../../atoms/button"

export interface IIAuthCompleteProps {
  anchor: string | number
  onCancel: () => void
  onRetry: () => void
}

export const IIAuthComplete: React.FC<IIAuthCompleteProps> = ({
  anchor,
  onCancel,
  onRetry,
}) => {
  return (
    <div className="flex flex-col justify-between flex-grow h-full">
      <div className="flex-grow text-sm">
        <p className="text-base font-bold">Connect Internet Identity</p>
        <p className="mt-5">Follow these steps to complete the connection:</p>
        <ul className="list-decimal list-inside ml-0.5 mt-2.5 leading-5">
          <li>
            On an existing device, log into <b>https://identity.ic0.app</b> with
            your II anchor <b>{anchor}</b>
          </li>
          <li>
            Click <b>Add new device</b>
          </li>
          <li>
            Select <b>Remote Device</b>
          </li>
          <li>
            Return to this screen and click <b>Retry</b>
          </li>
        </ul>
      </div>

      <div className={clsx("w-full grid grid-cols-2 gap-5 mt-5")}>
        <Button stroke onClick={onCancel}>
          Cancel
        </Button>
        <Button primary onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  )
}
