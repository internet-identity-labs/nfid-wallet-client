import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { NFIDPersonalizeContent } from "frontend/flows/screens-app/profile/personalize/content"

interface IFrameNFIDPersonalizeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameNFIDPersonalize: React.FC<IFrameNFIDPersonalizeProps> = ({
  children,
  className,
}) => {
  return (
    <IFrameScreen logo>
      <NFIDPersonalizeContent iframe />
    </IFrameScreen>
  )
}
