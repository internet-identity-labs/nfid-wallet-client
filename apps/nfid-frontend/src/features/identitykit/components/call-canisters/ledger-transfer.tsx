import { toHex } from "@dfinity/agent"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import useSWR from "swr"

import { Address } from "@nfid-frontend/ui"
import { exchangeRateService } from "@nfid/integration"
import { ICP_DECIMALS, WALLET_FEE_E8S } from "@nfid/integration/token/constants"

import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"

import { RPCPromptTemplate } from "../templates/prompt-template"

export interface CallCanisterLedgerTransferProps {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  request: any
  onApprove: (data: any) => void
  onReject: () => void
}

const CallCanisterLedgerTransfer = (props: CallCanisterLedgerTransferProps) => {
  const { origin, request, args, methodName, onApprove, onReject } = props

  const applicationName = new URL(origin).host
  const [requestParams] = JSON.parse(args)
  const toArray = Object.values(requestParams.to) as any as ArrayBuffer

  const { data } = useSWR("usdRate", () => exchangeRateService.getICP2USD())
  const { data: balance } = useSWR(
    request?.data?.params?.sender
      ? ["userBalance", request?.data?.params?.sender]
      : null,
    ([_, id]) =>
      icTransferConnector.getBalance(
        AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(id),
        }).toHex(),
      ),
  )

  const toAddress = toHex(toArray)
  const amount = Number(requestParams.amount.e8s)
  const isInsufficientBalance = amount + WALLET_FEE_E8S > Number(balance)

  return (
    <RPCPromptTemplate
      title={methodName}
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
      senderPrincipal={request?.data?.params?.sender}
      isPrimaryDisabled={isInsufficientBalance}
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
          $
          <TickerAmount
            symbol="ICP"
            value={Number(requestParams.amount.e8s)}
            usdRate={data?.toNumber()}
            decimals={ICP_DECIMALS}
            withUSDSymbol={false}
          />
        </p>
        <div className="flex flex-col flex-1 text-sm">
          <div className="flex items-center justify-between h-[54px]">
            <div>To</div>
            <div>
              <Address address={toAddress} />
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
                  usdRate={data?.toNumber()}
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
                  usdRate={data?.toNumber()}
                />
              </span>
            </div>
          </div>
        </div>
        {isInsufficientBalance && (
          <p className="flex flex-col justify-end flex-1 text-xs text-center text-red-600">
            Insufficient ICP balance
          </p>
        )}
      </div>
    </RPCPromptTemplate>
  )
}

export default CallCanisterLedgerTransfer
