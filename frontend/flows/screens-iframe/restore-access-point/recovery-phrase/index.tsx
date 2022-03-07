import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RestoreAccessPointRecoveryPhraseContent } from "frontend/flows/screens-app/restore-access-point/recovery-phrase/content"
import React from "react"

interface IFrameRestoreAccessPointRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameRestoreAccessPointRecoveryPhrase: React.FC<
  IFrameRestoreAccessPointRecoveryPhraseProps
> = ({ children, className }) => {
  return (
    <IFrameScreen logo>
      <RestoreAccessPointRecoveryPhraseContent iframe />
    </IFrameScreen>
  )
}
