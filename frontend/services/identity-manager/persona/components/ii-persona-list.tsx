import React from "react"
import clsx from "clsx"
import { usePersona } from "../hooks"
import { Button } from "components/atoms/button"

interface IIPersonaListProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  personas: { anchor: string }[]
  onClickPersona: ({ anchor }: { anchor: string }) => () => void
}

export const IIPersonaList: React.FC<IIPersonaListProps> = ({
  personas,
  onClickPersona,
}) => {
  return (
    <div className="px-6 py-4">
      {personas?.map(({ anchor }) => (
        <Button
          key={anchor}
          block
          secondary
          onClick={onClickPersona({ anchor })}
          className="mt-1"
        >
          Continue as NFID persona {anchor}
        </Button>
      ))}
    </div>
  )
}
