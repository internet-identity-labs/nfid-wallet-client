import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { KongSwapTransactionImpl } from "src/integration/swap/kong/impl/kong-swap-transaction-impl"
import { SwapStage } from "src/integration/swap/types/enums"

import { authState } from "@nfid/integration"

import { IcpSwapTransactionImpl } from "../../icpswap/impl/icp-swap-transaction-impl"
import { SwapTransaction as SwapTransactionCandid } from "../idl/swap_trs_storage.d"
import { SwapTransactionService } from "../transaction-service"

const mockDuration = 2 * 1000
const mock: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

describe("SwapTransactionService", () => {
  const service = new SwapTransactionService()

  it("should return the correct tx loading state", async () => {
    jest.setTimeout(10000)
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mock)
    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 44),
      {},
    )
    const mockErrorMessage = "Mocked Error message"

    const mockTransaction: SwapTransactionCandid = {
      source_ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
      target_ledger: "mxzaz-hqaaa-aaaar-qaada-cai",
      target_amount: BigInt(1110),
      source_amount: BigInt(50),
      start_time: BigInt(Date.now()),
      uid: "mock-uid",
      withdraw: [],
      swap: [],
      errors: [],
      deposit: [],
      transfer_id: [],
      stage: { Withdraw: null },
      end_time: [],
      transfer_nfid_id: [],
      swap_provider: { Kong: null },
    }

    const mockCompletedTransaction: SwapTransactionCandid = {
      source_ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
      target_ledger: "mxzaz-hqaaa-aaaar-qaada-cai",
      target_amount: BigInt(1110),
      source_amount: BigInt(50),
      start_time: BigInt(Date.now()),
      uid: "mock-uid",
      withdraw: [],
      swap: [],
      errors: [],
      deposit: [],
      transfer_id: [],
      stage: { Completed: null },
      end_time: [],
      transfer_nfid_id: [],
      swap_provider: { Kong: null },
    }

    const mockFailedTransaction: SwapTransactionCandid = {
      source_ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
      target_ledger: "mxzaz-hqaaa-aaaar-qaada-cai",
      target_amount: BigInt(1110),
      source_amount: BigInt(50),
      start_time: BigInt(Date.now()),
      uid: "mock-uid",
      withdraw: [],
      swap: [],
      errors: [{ time: BigInt(Date.now()), message: mockErrorMessage }],
      deposit: [],
      transfer_id: [],
      stage: { Withdraw: null } as any,
      end_time: [],
      transfer_nfid_id: [],
      swap_provider: { Kong: null },
    }

    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chainRoot,
    )

    await authState.set({
      identity: delegationIdentity,
      delegationIdentity: delegationIdentity,
    })

    jest
      .spyOn(service["storageActor"], "get_transactions")
      .mockResolvedValue([
        mockTransaction,
        mockCompletedTransaction,
        mockFailedTransaction,
      ])

    const result = await service.getTransactions()

    expect(result[0]).toBeInstanceOf(KongSwapTransactionImpl)
    expect(result[0].getIsLoading()).toBe(true)
    expect(result[1].getIsLoading()).toBe(false)
    expect(result[2].getIsLoading()).toBe(false)
    expect(result[1].getStage()).toBe(SwapStage.Completed)
    expect(result[2].getErrors()[0].message).toBe(mockErrorMessage)

    setTimeout(() => {
      expect(result[0].getIsLoading()).toBe(false)
    }, mockDuration + 1)
  })
})
