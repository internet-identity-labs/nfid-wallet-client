import clsx from "clsx"
import { PropsWithChildren } from "react"

import { Button, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface RPCPromptTemplateProps extends PropsWithChildren<{}> {
  onApprove: () => void
  onReject: () => void
  title?: string | JSX.Element
  subTitle: string | JSX.Element
}

export const RPCPromptTemplate = ({
  onApprove,
  onReject,
  title,
  subTitle,
  children,
}: RPCPromptTemplateProps) => {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col items-center mt-10 text-sm text-center">
        <img
          alt="NFID Wallet"
          className="w-[182px] mb-4"
          src={IconSvgNFIDWalletLogo}
        />
        {title && (
          <div className="block w-full text-lg font-bold mb-1.5">{title}</div>
        )}
        <div className="block w-full text-sm">{subTitle}</div>
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
