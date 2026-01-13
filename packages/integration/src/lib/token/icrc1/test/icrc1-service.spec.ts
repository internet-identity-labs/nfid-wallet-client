/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"

import { icrc1StorageService } from "../service/icrc1-storage-service"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("ICRC1 suite", () => {
  jest.setTimeout(200000)
  it("should filter", async () => {
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValue([
        {
          ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
          name: "Chat",
          symbol: "CHAT",
          logo: "Some logo",
          index: "2awyi-oyaaa-aaaaq-aaanq-cai",
          state: "Active",
          category: "Unknown",
        },
        {
          ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          name: "Internet Computer",
          symbol: "ICP",
          index: "qhbym-qaaaa-aaaaa-aaafq-cai",
          state: "Active",
          category: "Native",
        },
      ])
    const filteredCanisters =
      await icrc1StorageService.getICRC1FilteredCanisters(
        principal.toText(),
        "Ch",
      )
    expect(filteredCanisters.length).toEqual(1)
    expect(filteredCanisters[0].name).toEqual("Chat")
    const filteredCanisters2 =
      await icrc1StorageService.getICRC1FilteredCanisters(
        principal.toText(),
        "CH",
      )
    expect(filteredCanisters2.length).toEqual(1)
    expect(filteredCanisters2[0].name).toEqual("Chat")
    const filteredCanisters3 =
      await icrc1StorageService.getICRC1FilteredCanisters(
        principal.toText(),
        "C",
      )
    expect(filteredCanisters3.length).toEqual(2)
  })

  it("should return active", async () => {
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValue([
        {
          ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
          name: "Chat",
          symbol: "CHAT",
          logo: "Some logo",
          index: "2awyi-oyaaa-aaaaq-aaanq-cai",
          state: "Inactive",
          category: "Unknown",
        },
        {
          ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          name: "Internet Computer",
          symbol: "ICP",
          index: "qhbym-qaaaa-aaaaa-aaafq-cai",
          state: "Active",
          category: "Native",
        },
      ])
    const filteredCanisters = await icrc1StorageService.getICRC1ActiveCanisters(
      principal.toText(),
    )
    expect(filteredCanisters.length).toEqual(1)
    expect(filteredCanisters[0].name).toEqual("Internet Computer")
  })
})
