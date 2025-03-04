/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { generateDelegationIdentity, mockIdentityA } from "@nfid/integration"
import { transferICRC1 } from "@nfid/integration/token/icrc1/index"

import { TransferArg } from "../../_ic_api/icrc1.d"
import { icrc1TransactionHistoryService } from "./service/icrc1-transaction-history-service"

describe("ICRC1 suite", () => {
  jest.setTimeout(300000)
  let root: string
  const iCRC1TestCanister = "6jq2j-daaaa-aaaap-absuq-cai"

  it.skip("Get index data", async () => {
    const data = await icrc1TransactionHistoryService.getICRC1IndexData(
      [
        {
          icrc1: {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
          },
          blockNumberToStartFrom: BigInt(298680),
        },
      ],
      "7cpx7-5iqxa-df2t7-jktca-2mfbq-b7keh-dsunz-k256d-55byp-7lkyp-uqe",
      BigInt(1),
    )
    const testICRC1 = data[0]
    expect(testICRC1.transactions.length).toBeGreaterThan(0)
    expect(testICRC1.transactions[0].transactionId).toEqual(BigInt(298669))
    expect(testICRC1.transactions[0].from).toEqual(
      "7cpx7-5iqxa-df2t7-jktca-2mfbq-b7keh-dsunz-k256d-55byp-7lkyp-uqe",
    )
    expect(testICRC1.transactions[0].to).toEqual("l3k5l-liaaa-aaaan-qmhkq-cai")
    expect(testICRC1.transactions[0].type).toEqual("Sent")
    expect(testICRC1.transactions[0].symbol).toEqual("CHAT")
    expect(testICRC1.transactions[0].amount).toEqual(BigInt(10000000))
    expect(testICRC1.oldestTransactionId).toEqual(BigInt(246792))
  })

  it("Transfer", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const { delegationIdentity } = await generateDelegationIdentity(
      mockedIdentity,
    )
    const transferArgs: TransferArg = {
      amount: BigInt(10),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(
          "sculj-2sjuf-dxqlm-dcv5y-hin5x-zfyvr-tzngf-bt5b5-dwhcc-zbsqf-rae",
        ),
      },
    }
    const block = await transferICRC1(
      delegationIdentity,
      iCRC1TestCanister,
      transferArgs,
    )
    // @ts-ignore
    expect(block.Ok).toBeGreaterThan(0)
  })
})
