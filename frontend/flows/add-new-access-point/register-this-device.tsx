import React from "react"
import clsx from "clsx"

interface CreateKeysForNewAccessPointProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CreateKeysForNewAccessPoint: React.FC<
  CreateKeysForNewAccessPointProps
> = ({ className }) => {
  return <div className={clsx("", className)}>CreateKeysForNewAccessPoint</div>
}
