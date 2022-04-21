import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RestoreAccessPoint } from "frontend/screens/restore-access-point"

interface IFrameRestoreAccessPointRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameRestoreAccessPointRecoveryPhrase: React.FC<IFrameRestoreAccessPointRecoveryPhraseProps> = ({
  children,
  className,
}) => {
  return (
    <IFrameScreen logo>
      <RestoreAccessPoint iframe />
    </IFrameScreen>
  )
}
