import React from "react"
import clsx from "clsx"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RestoreAccessPointRecoveryPhraseContent } from "../../../screens-app/restore-account/recovery/content"

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
