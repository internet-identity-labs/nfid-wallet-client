import clsx from "clsx"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { FaceId } from "frontend/ui-utils/atoms/icons/face-id"
import React from "react"

export const RegisterConfirmation = () => {
  // TODO: get device from communication channel
  const DEVICE = "MacBook Pro"
  return (
    <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>
      <h1 className={clsx("text-center font-bold text-3xl")}>
        Awaiting confirmation
      </h1>
      <div className={clsx("text-center")}>
        Follow instructions on your {DEVICE}
      </div>
      <div className={clsx("flex justify-center mt-10")}>
        <FaceId />
      </div>
      <div className={clsx("text-center mt-40")}>
        This screen will update once you've registered your device
      </div>
    </div>
  )
}
