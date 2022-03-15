import React from "react"

import { useMultipass } from "frontend/hooks/use-multipass"

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
  const { applicationName } = useMultipass()

  return (
    <div>
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

      <Button block stroke onClick={onClickCreatePersona} className="mt-2">
        Create a new {applicationName} persona
      </Button>
    </div>
  )
}
