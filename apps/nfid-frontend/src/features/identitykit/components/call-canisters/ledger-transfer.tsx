import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"

import { Address } from "@nfid-frontend/ui"
import { ICP_DECIMALS, WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { LedgerTransferMetadata } from "../../service/canister-calls-helpers/ledger-transfer"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface CallCanisterLedgerTransferProps {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  request: any
  metadata: LedgerTransferMetadata
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterLedgerTransfer = (props: CallCanisterLedgerTransferProps) => {
  const { origin, request, args, onApprove, onReject, metadata } = props

  const applicationName = new URL(origin).host
  const [requestParams] = JSON.parse(args)

  return (
    <RPCPromptTemplate
      title={"Approve transfer"}
      subTitle={
        <>
          Request from{" "}
          <a
            href={origin}
            target="_blank"
            className="text-[#146F68] no-underline"
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
        symbol: "ICP",
        balance: metadata.balance,
        decimals: ICP_DECIMALS,
        address: metadata.address,
      }}
    >
      <div className="flex flex-col flex-1 mt-3">
        <p className="text-[32px] font-medium text-center">
          <TickerAmount
            symbol={"ICP"}
            value={Number(requestParams.amount.e8s)}
            decimals={ICP_DECIMALS}
          />
        </p>
        <p className="text-sm text-center text-gray-400">
          <TickerAmount
            symbol="ICP"
            value={Number(requestParams.amount.e8s)}
            usdRate={metadata.usdRate}
            decimals={ICP_DECIMALS}
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
                symbol={"ICP"}
                value={WALLET_FEE_E8S}
                decimals={ICP_DECIMALS}
              />
              <br />
              <span className="text-xs text-gray-400">
                <TickerAmount
                  symbol={"ICP"}
                  value={WALLET_FEE_E8S}
                  decimals={ICP_DECIMALS}
                  usdRate={metadata.usdRate}
                />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between h-[54px] font-bold border-t border-gray-200">
            <div>Total</div>
            <div className="text-right">
              <TickerAmount
                symbol={"ICP"}
                value={Number(requestParams.amount.e8s) + WALLET_FEE_E8S}
                decimals={ICP_DECIMALS}
              />
              <br />
              <span className="text-xs font-normal text-gray-400">
                <TickerAmount
                  symbol={"ICP"}
                  value={Number(requestParams.amount.e8s) + WALLET_FEE_E8S}
                  decimals={ICP_DECIMALS}
                  usdRate={metadata.usdRate}
                />
              </span>
            </div>
          </div>
        </div>
        {metadata.isInsufficientBalance && (
          <p className="flex flex-col justify-end flex-1 text-xs text-center text-red-600">
            Insufficient ICP balance
          </p>
        )}
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterLedgerTransfer
