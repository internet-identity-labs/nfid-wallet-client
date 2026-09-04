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
const CKLINK_LEDGER_CANISTER_ID = "g4tto-rqaaa-aaaar-qageq-cai"
const CKXAUT_LEDGER_CANISTER_ID = "nza5v-qaaaa-aaaar-qahzq-cai"
const CKUNI_LEDGER_CANISTER_ID = "ilzky-ayaaa-aaaar-qahha-cai"
const CKPEPE_LEDGER_CANISTER_ID = "etik7-oiaaa-aaaar-qagia-cai"
const CKEURC_LEDGER_CANISTER_ID = "pe5t5-diaaa-aaaar-qahwa-cai"
const CKSHIB_LEDGER_CANISTER_ID = "fxffn-xiaaa-aaaar-qagoa-cai"
const CKWBTC_LEDGER_CANISTER_ID = "bptq2-faaaa-aaaar-qagxq-cai"

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
  [CKLINK_LEDGER_CANISTER_ID]: {
    symbol: "ckLINK",
    underlyingSymbol: "LINK",
    ledgerCanisterId: CKLINK_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    decimals: 18,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKXAUT_LEDGER_CANISTER_ID]: {
    symbol: "ckXAUT",
    underlyingSymbol: "XAUT",
    ledgerCanisterId: CKXAUT_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    decimals: 6,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKUNI_LEDGER_CANISTER_ID]: {
    symbol: "ckUNI",
    underlyingSymbol: "UNI",
    ledgerCanisterId: CKUNI_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    decimals: 18,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKPEPE_LEDGER_CANISTER_ID]: {
    symbol: "ckPEPE",
    underlyingSymbol: "PEPE",
    ledgerCanisterId: CKPEPE_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    decimals: 18,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },

  [CKEURC_LEDGER_CANISTER_ID]: {
    symbol: "ckEURC",
    underlyingSymbol: "EURC",
    ledgerCanisterId: CKEURC_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x1abaea1f7c830bd89acc67ec4af516284b1bc33c",
    decimals: 6,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKSHIB_LEDGER_CANISTER_ID]: {
    symbol: "ckSHIB",
    underlyingSymbol: "SHIB",
    ledgerCanisterId: CKSHIB_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    decimals: 18,
    chainId: ChainId.ETH,
    minterCanisterId: CKETH_MINTER_CANISTER_ID,
    helperContractAddress: MINTER_ADDRESS,
    minWithdrawalAmount: BigInt(10_000_000),
  },
  [CKWBTC_LEDGER_CANISTER_ID]: {
    symbol: "ckWBTC",
    underlyingSymbol: "WBTC",
    ledgerCanisterId: CKWBTC_LEDGER_CANISTER_ID,
    erc20ContractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
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
