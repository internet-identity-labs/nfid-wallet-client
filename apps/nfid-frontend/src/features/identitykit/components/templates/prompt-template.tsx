import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { PropsWithChildren } from "react"
import useSWR from "swr"

import { Button, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"

export interface RPCPromptTemplateProps extends PropsWithChildren<{}> {
  primaryButtonText?: string
  onPrimaryButtonClick: () => void
  secondaryButtonText?: string
  onSecondaryButtonClick: () => void
  title?: string | JSX.Element
  subTitle: string | JSX.Element
  senderPrincipal?: string
  isPrimaryDisabled?: boolean
}

export const RPCPromptTemplate = ({
  primaryButtonText = "Approve",
  secondaryButtonText = "Reject",
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  title,
  subTitle,
  children,
  senderPrincipal,
  isPrimaryDisabled,
}: RPCPromptTemplateProps) => {
  const { data: balance } = useSWR(
    senderPrincipal ? ["userBalance", senderPrincipal] : null,
    ([_, id]) =>
      icTransferConnector.getBalance(
        AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(id),
        }).toHex(),
      ),
  )
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
      <div
        className={clsx(
          "grid grid-cols-2 gap-5 mt-5",
          senderPrincipal && "mb-[60px]",
        )}
      >
        <Button type="stroke" onClick={onSecondaryButtonClick}>
          {secondaryButtonText}
        </Button>
        <Button
          type="primary"
          disabled={isPrimaryDisabled}
          onClick={onPrimaryButtonClick}
        >
          {primaryButtonText}
        </Button>
      </div>
      {senderPrincipal && (
        <div
          className={clsx(
            "bg-gray-50 flex flex-col text-sm text-gray-500",
            "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
          )}
        >
          <div className="flex items-center justify-between">
            <p>Wallet address</p>
            <p>Balance:</p>
          </div>
          <div className="flex items-center justify-between">
            <p>{truncateString(senderPrincipal, 6, 4)}</p>
            <div className="flex items-center space-x-0.5">
              {balance !== undefined ? (
                <TickerAmount
                  value={Number(balance)}
                  decimals={ICP_DECIMALS}
                  symbol={"ICP"}
                />
              ) : (
                <Spinner className="w-3 h-3 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
