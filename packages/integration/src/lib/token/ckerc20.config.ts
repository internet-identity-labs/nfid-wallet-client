import { ChainId } from "./icrc1/enum/enums"
import { CKETH_MINTER_CANISTER_ID, MINTER_ADDRESS } from "./constants"

export interface CkErc20Token {
  symbol: string
  underlyingSymbol: string
  ledgerCanisterId: string
  erc20ContractAddress: string
  decimals: number
  chainId: ChainId
  minterCanisterId: string
  helperContractAddress: string
  minWithdrawalAmount: bigint
}

const CKUSDC_LEDGER_CANISTER_ID = "xevnm-gaaaa-aaaar-qafnq-cai"
const CKUSDT_LEDGER_CANISTER_ID = "cngnf-vqaaa-aaaar-qag4q-cai"

export const CKERC20_TOKENS: Record<string, CkErc20Token> = {
  [CKUSDC_LEDGER_CANISTER_ID]: {
    symbol: "ckUSDC",
    underlyingSymbol: "USDC",
    ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKUSDT_LEDGER_CANISTER_ID]: {
    symbol: "ckUSDT",
    underlyingSymbol: "USDT",
    ledgerCanisterId: CKUSDT_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
}

export const getCkErc20ByLedgerId = (
  ledgerCanisterId: string,
): CkErc20Token | undefined => CKERC20_TOKENS[ledgerCanisterId]

export const isCkErc20Token = (ledgerCanisterId: string): boolean =>
  ledgerCanisterId in CKERC20_TOKENS

export const getCkErc20ByErc20Address = (
  erc20ContractAddress: string,
): CkErc20Token | undefined => {
  const target = erc20ContractAddress.toLowerCase()
  return Object.values(CKERC20_TOKENS).find(
    (token) => token.erc20ContractAddress.toLowerCase() === target,
  )
}
