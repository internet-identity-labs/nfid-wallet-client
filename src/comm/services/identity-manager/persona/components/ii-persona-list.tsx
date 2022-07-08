import { List } from "@internet-identity-labs/nfid-sdk-react"
import { H5, ListItem } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

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
  className,
}) => {
  return (
    <div className={clsx("pb-5", className)}>
      <List>
        {personas.length > 0 && (
          <List.Header>
            <div className="pt-12 pb-5">
              <H5>We have found several anchors.</H5>
              <div>Choose with which one you want to continue:</div>
            </div>
          </List.Header>
        )}
        <List.Items>
          {personas?.map(({ anchor }) => (
            <ListItem
              key={anchor}
              title={`Continue as NFID persona ${anchor}`}
              onClick={onClickPersona({ anchor })}
            />
          ))}
        </List.Items>
      </List>
    </div>
  )
}
