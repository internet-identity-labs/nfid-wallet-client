import clsx from "clsx"
import { PropsWithChildren } from "react"

import { Button, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface RPCPromptTemplateProps extends PropsWithChildren<{}> {
  onApprove: () => void
  onReject: () => void
  subTitle: string | JSX.Element
}

export const RPCPromptTemplate = ({
  onApprove,
  onReject,
  subTitle,
  children,
}: RPCPromptTemplateProps) => {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col items-center mt-10 text-sm text-center">
        <img
          alt="NFID Wallet"
          className="w-[182px]"
          src={IconSvgNFIDWalletLogo}
        />
        <div className="block w-full mt-5">{subTitle}</div>
      </div>
      {children}
      <div className={clsx("grid grid-cols-2 gap-5 mt-5 lg:mt-32")}>
        <Button type="stroke" onClick={onReject}>
          Reject
        </Button>
        <Button type="primary" onClick={onApprove}>
          Approve
        </Button>
      </div>
    </div>
  )
}
