import React from "react"
import { Button } from "../atoms/button"

export const LoginTemporarily: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>> = ({ onClick }) => (
  <Button large onClick={onClick}>
    Log me in this time only
  </Button>
)
