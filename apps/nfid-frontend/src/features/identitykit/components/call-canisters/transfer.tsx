import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"

import { Address } from "@nfid-frontend/ui"

import { CanisterCallTitle } from "../../constants"
import { TransferMetadata } from "../../service/canister-calls-helpers/interfaces"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface CallCanisterTransferProps {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  request: any
  metadata: TransferMetadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterTransfer = (props: CallCanisterTransferProps) => {
  const { origin, request, onApprove, onReject, metadata } = props

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      title={CanisterCallTitle.transfer}
      subTitle={
        <>
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="text-primaryButtonColor no-underline"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </>
      }
      onPrimaryButtonClick={() => onApprove(request)}
      onSecondaryButtonClick={onReject}
      isPrimaryDisabled={metadata.isInsufficientBalance}
      balance={{
        symbol: metadata.symbol,
        balance: metadata.balance,
        decimals: metadata.decimals,
        address: metadata.address,
      }}
    >
      <div className="flex flex-col flex-1 mt-3">
        <p className="text-[32px] font-medium text-center">
          <TickerAmount
            symbol={metadata.symbol}
            value={metadata.amount}
            decimals={metadata.decimals}
          />
        </p>
        <p className="text-sm text-center text-gray-400">
          <TickerAmount
            symbol={metadata.symbol}
            value={metadata.amount}
            usdRate={metadata.usdRate}
            decimals={metadata.decimals}
          />
        </p>
        <div className="flex flex-col flex-1 text-sm">
          <div className="flex items-center justify-between h-[54px]">
            <div>To</div>
            <div>
              <Address address={metadata.toAddress} />
            </div>
          </div>
          <div className="flex items-center justify-between h-[54px]">
            <div>Network fee</div>
            <div className="text-right">
              <TickerAmount
                symbol={metadata.symbol}
                value={metadata.fee}
                decimals={metadata.decimals}
              />
              <br />
              <span className="text-xs text-gray-400">
                <TickerAmount
                  symbol={metadata.symbol}
                  value={metadata.fee}
                  decimals={metadata.decimals}
                  usdRate={metadata.usdRate}
                />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between h-[54px] font-bold border-t border-gray-200">
            <div>Total</div>
            <div className="text-right">
              <TickerAmount
                symbol={metadata.symbol}
                value={metadata.total}
                decimals={metadata.decimals}
              />
              <br />
              <span className="text-xs font-normal text-gray-400">
                <TickerAmount
                  symbol={metadata.symbol}
                  value={metadata.total}
                  decimals={metadata.decimals}
                  usdRate={metadata.usdRate}
                />
              </span>
            </div>
          </div>
        </div>
        {metadata.isInsufficientBalance && (
          <p className="flex flex-col justify-end flex-1 text-xs text-center text-red-600">
            Insufficient {metadata.symbol} balance
          </p>
        )}
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterTransfer
