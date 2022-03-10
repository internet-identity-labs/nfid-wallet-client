import React from "react"
import { Button } from "../atoms/button"

export const SetupTouchId: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>> = ({ onClick }) => {
  return (
    <Button largeMax secondary onClick={onClick}>
      Confirm
    </Button>
  )
}
