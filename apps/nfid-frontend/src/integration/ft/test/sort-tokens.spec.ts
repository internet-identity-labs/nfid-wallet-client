import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"
import { sortFtTokens } from "frontend/integration/ft/ft-service"

const token = (address: string, category: Category): FT =>
  ({
    getTokenAddress: () => address,
    getTokenCategory: () => category,
  }) as unknown as FT

describe("sortFtTokens", () => {
  it("orders tokens as sc-19793 asks", () => {
    const input = [
      token("community-1", Category.Community),
      token("erc20-1", Category.ERC20),
      token("spam-1", Category.Spam),
      token(CKETH_LEDGER_CANISTER_ID, Category.ChainFusion),
      token("cf-other", Category.ChainFusion),
      token(CKBTC_CANISTER_ID, Category.ChainFusion),
      token("sns-1", Category.Sns),
      token("native-other", Category.Native),
      token(ETH_NATIVE_ID, Category.Native),
      token(NFIDW_CANISTER_ID, Category.Sns),
      token("known-1", Category.Known),
      token(BTC_NATIVE_ID, Category.Native),
      token("testnet-1", Category.TESTNET),
      token(ICP_CANISTER_ID, Category.Native),
      token("sns-2", Category.Sns),
    ]

    expect(sortFtTokens(input).map((t) => t.getTokenAddress())).toEqual([
      ICP_CANISTER_ID,
      NFIDW_CANISTER_ID,
      BTC_NATIVE_ID,
      ETH_NATIVE_ID,
      "native-other",
      "sns-1",
      "sns-2",
      CKBTC_CANISTER_ID,
      CKETH_LEDGER_CANISTER_ID,
      "cf-other",
      "erc20-1",
      "community-1",
      "known-1",
      "testnet-1",
      "spam-1",
    ])
  })

  it("pins only the first token of a shared id (EVM native ETH)", () => {
    const input = [
      token("native-other", Category.Native),
      token(ETH_NATIVE_ID, Category.Native),
      token(ETH_NATIVE_ID, Category.Native),
    ]
    const sorted = sortFtTokens(input)
    expect(sorted[0]).toBe(input[1])
    expect(sorted[1]).toBe(input[0])
    expect(sorted[2]).toBe(input[2])
  })

  it("does not modify the input", () => {
    const input = [
      token("sns-1", Category.Sns),
      token(ICP_CANISTER_ID, Category.Native),
    ]
    sortFtTokens(input)
    expect(input[0].getTokenAddress()).toBe("sns-1")
  })
})
