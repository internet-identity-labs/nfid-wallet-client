import clsx from "clsx"
import React from "react"
import { Button } from "../atoms/button"
import { TouchId } from "../atoms/icons/touch-id"

export const SetupTouchId: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = ({ onClick }) => (
  <Button
    onClick={onClick}
    className={clsx(
      "flex flex-row w-full justify-start items-center bg-gray-50",
    )}
  >
    <div className={clsx("p-2 bg-gray-200")}>
      <TouchId />
    </div>
    <div className="ml-1 p-2">Setup Touch ID for Chrome</div>
  </Button>
)
