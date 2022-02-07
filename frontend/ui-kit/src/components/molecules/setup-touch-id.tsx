import React from "react"
import { HiFingerPrint } from "react-icons/hi"
import { Button } from "../atoms/button"

export const SetupTouchId: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>> = ({ onClick }) => (
  <Button large secondary onClick={onClick}>
    <div className="flex flex-row items-center justify-center">
      <HiFingerPrint className="mr-2" />
      <div>
        Set up {"{PA}"} for {"{BROWSERNAME}"}
      </div>
    </div>
  </Button>
)
