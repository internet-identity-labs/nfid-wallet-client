import React from "react"
import { Button } from "components/atoms/button"

interface NFIDPersonasProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  personas: { persona_id: string }[]
  onClickPersona: ({ persona_id }: { persona_id: string }) => () => void
  onClickCreatePersona: () => void
}

export const NFIDPersonas: React.FC<NFIDPersonasProps> = ({
  personas,
  onClickPersona,
  onClickCreatePersona,
}) => {
  return (
    <div className="px-6 py-4">
      {personas?.map(({ persona_id }) => (
        <Button
          key={persona_id}
          block
          secondary
          onClick={onClickPersona({ persona_id })}
          className="mt-1"
        >
          Continue as NFID persona {persona_id}
        </Button>
      ))}
      <Button
        block
        secondary
        color="white"
        onClick={onClickCreatePersona}
        className="mt-1"
      >
        Create new persona
      </Button>
    </div>
  )
}
