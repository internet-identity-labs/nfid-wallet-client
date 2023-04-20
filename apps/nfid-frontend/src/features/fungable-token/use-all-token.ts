import React from "react"
import { useBtcBalance } from "src/features/fungable-token/btc/hooks/use-btc-balance"
import { useBtcFee } from "src/features/fungable-token/btc/hooks/use-btc-fee"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"

import { IconPngEthereum, IconSvgBTC, IconSvgDfinity } from "@nfid-frontend/ui"
import { toPresentation, WALLET_FEE_E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { useAllDip20Token } from "./dip-20/hooks/use-all-token-meta"
import { useEthBalance } from "./eth/hooks/use-eth-balances"
import { useBalanceICPAll } from "./icp/hooks/use-balance-icp-all"

export interface TokenConfig {
  balance: bigint | undefined
  currency: string
  fee: bigint
  icon: string
  price: string | undefined
  title: string
  canisterId?: string
  tokenStandard: TokenStandards
  toPresentation: (value?: bigint) => number
  transformAmount: (value: string) => number
  blockchain: string
  feeCurrency?: string
  contract?: string
}

export const useAllToken = (): { token: TokenConfig[] } => {
  const { balances: btcSheet } = useBtcBalance()
  const { btcFee } = useBtcFee()
  const { appAccountBalance } = useBalanceICPAll()
  const { token: dip20Token } = useAllDip20Token()
  const { balance: ethSheet } = useEthBalance()
  const { erc20 } = useErc20()
  const token: TokenConfig[] = React.useMemo(() => {
    return [
      {
        icon: IconSvgDfinity,
        tokenStandard: TokenStandards.ICP,
        title: "Internet Computer",
        currency: "ICP",
        balance: appAccountBalance?.ICP.tokenBalance,
        price: appAccountBalance?.ICP.usdBalance,
        fee: BigInt(WALLET_FEE_E8S),
        toPresentation,
        transformAmount: stringICPtoE8s,
        blockchain: "Internet Computer",
      },
      {
        icon: IconSvgBTC,
        tokenStandard: TokenStandards.BTC,
        title: "Bitcoin",
        currency: "BTC",
        balance: btcSheet?.tokenBalance,
        price: btcSheet?.usdBalance,
        fee: BigInt(btcFee ? btcFee : 0),
        toPresentation,
        transformAmount: stringICPtoE8s,
        blockchain: "Bitcoin",
      },
      {
        icon: IconPngEthereum,
        tokenStandard: TokenStandards.ETH,
        title: "Ethereum",
        currency: "ETH",
        balance: ethSheet?.tokenBalance,
        price: ethSheet?.usdBalance,
        fee: BigInt(0),
        toPresentation,
        transformAmount: stringICPtoE8s,
        blockchain: "Ethereum",
      },
      ...(dip20Token
        ? dip20Token.map(({ symbol, name, logo, ...rest }) => ({
            tokenStandard: TokenStandards.DIP20,
            icon: logo,
            title: name,
            currency: symbol,
            balance: appAccountBalance?.[symbol].tokenBalance,
            price: appAccountBalance?.[symbol].usdBalance,
            blockchain: "Internet Computer",
            ...rest,
          }))
        : []),
      ...(erc20
        ? erc20.map((l) => ({
            tokenStandard: TokenStandards.ERC20,
            icon: l.icon,
            title: l.label,
            currency: l.token,
            balance: l.tokenBalance,
            price: l.usdBalance,
            blockchain: "Ethereum",
            fee: BigInt(0),
            toPresentation,
            transformAmount: stringICPtoE8s,
            feeCurrency: "ETH",
            contract: l.contract,
          }))
        : []),
    ]
  }, [
    appAccountBalance,
    btcSheet?.tokenBalance,
    btcSheet?.usdBalance,
    ethSheet?.tokenBalance,
    ethSheet?.usdBalance,
    dip20Token,
    btcFee,
    erc20,
  ])
  console.debug("useAllToken", { token })
  return { token }
}
