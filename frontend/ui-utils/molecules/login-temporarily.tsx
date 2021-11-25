import clsx from "clsx"
import React from "react"
import { Button } from "../atoms/button"
import { TemporarId } from "../atoms/icons/temporar-id"

export const LoginTemporarily: React.FC<
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
      <TemporarId />
    </div>
    <div className="ml-1 p-2 align-middle">Log me in temporarily</div>
  </Button>
)
