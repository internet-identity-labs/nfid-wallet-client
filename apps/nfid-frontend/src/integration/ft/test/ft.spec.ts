import {Principal} from "@dfinity/principal";
import {ftService} from "src/integration/ft/ft-service";
import {icrc1Service} from "@nfid/integration/token/icrc1/icrc1-service";
import {PaginatedResponse} from "src/integration/nft/impl/nft-types";
import {FT} from "src/integration/ft/ft";

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("ft test suite", () => {
  jest.setTimeout(35000)
  describe("ft", () => {
    it("should return", async () => {
      jest
        .spyOn(icrc1Service as any, "getICRC1ActiveCanisters")
        .mockResolvedValue([{
          "ledger": "2ouva-viaaa-aaaaq-aaamq-cai",
          "name": "Chat",
          "symbol": "CHAT",
          "logo": "Some logo",
          "index": "2awyi-oyaaa-aaaaq-aaanq-cai",
          "state": "Active",
          "category": "Unknown"
        }, {
          "ledger": "ryjl3-tyaaa-aaaaa-aaaba-cai",
          "name": "Internet Computer",
          "symbol": "ICP",
          "index": "qhbym-qaaaa-aaaaa-aaafq-cai",
          "state": "Active",
          "category": "Native"
        }])
      const result: PaginatedResponse<FT> = await ftService.getAllUserTokens(principal)
      expect(result.items.length).toEqual(2)
      const icpResult = result.items.find((r) => r.getTokenName() === "Internet Computer")
      expect(icpResult).toBeDefined()
      expect(icpResult!.getTokenBalance()).toEqual("0.0002 ICP")
      expect(icpResult!.getTokenCategory()).toEqual("Native")
      expect(icpResult!.getTokenAddress()).toEqual("ryjl3-tyaaa-aaaaa-aaaba-cai")
      expect(icpResult!.getBlockExplorerLink()).toEqual("https://dashboard.internetcomputer.org/canister/ryjl3-tyaaa-aaaaa-aaaba-cai")
      expect(await icpResult!.getUSDBalance()).toEqual("0.00 USD")
    })
    it('should calculate USD balance', async function () {
      jest
        .spyOn(icrc1Service as any, "getICRC1ActiveCanisters")
        .mockResolvedValue([{
          "ledger": "ryjl3-tyaaa-aaaaa-aaaba-cai",
          "name": "Internet Computer",
          "symbol": "ICP",
          "index": "qhbym-qaaaa-aaaaa-aaafq-cai",
          "state": "Active",
          "category": "Native"
        }])

      jest.spyOn(icrc1Service as any, "getICRC1Data")
        .mockResolvedValue([{
            "owner": principal,
            "balance": "20000000000n",
            "canisterId": "ryjl3-tyaaa-aaaaa-aaaba-cai",
            "decimals": 8,
            "fee": "10000n",
            "name": "Internet Computer",
            "symbol": "ICP"
          }]
        )

      const balance = await ftService.getTotalUSDBalance(principal)
      expect(balance).toEqual("0.00 USD")
    });
  })
})