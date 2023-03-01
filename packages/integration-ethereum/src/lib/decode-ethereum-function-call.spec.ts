import { decodeToken } from "./decode-ethereum-function-call"

describe("Decode function call data.", () => {
  it("should return tokenId for 721_LAZY", async () => {
    const encoded =
      "0x0d5f7d35000000000000000000000000000000000000000000000000000000000000002000000000000000000000000006da1d898598933d6b4bae08e73520f3d9f662c50000000000000000000000000000000000000000000000000000000000000001d8f960c10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000016bcc41e900000000000000000000000000000000000000000000000000000000000000000000e423c57286501476ba845d311d360c9978dde138c742d19b5be39100f7751f330000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000480000000000000000000000000000000000000000000000000000000000000056000000000000000000000000000000000000000000000000000016bcc41e90000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000005e00000000000000000000000000000000000000000000000000000000000000280000000000000000000000000d8560c88d1dc85f9ed05b25878e366c49b68bef9000000000000000000000000000000000000000000000000000000000000004006da1d898598933d6b4bae08e73520f3d9f662c500000000000000000000000800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000002e516d5764376b485564657831777634347a6a62544661716770487637595772756e795663523752767234316b7737000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000006da1d898598933d6b4bae08e73520f3d9f662c500000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000041e43665d8357025cb9d59f6d52076bff37512554f22b2b07895d3fb371aed9b6518041ca82c1156d11bb93be3331cc7c3c6ec52ad089b3728a88568e53f3456e51b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041a3eda989eddd3246f8b33223fefacca8152d7e32e03f686e1d554eb31ccf03e2390b1a0ced6728c12843a5eccf9a23392b252de162f604bdeb38e8739d8172601c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678900000000000000000000000000123456789face09616c6c64617461"
    const id = await decodeToken(encoded)
    expect(id).toEqual(
      expect.objectContaining({
        blockchain: "ETHEREUM",
        collection: expect.stringMatching(
          /ETHEREUM:0xd8560c88d1dc85f9ed05b25878e366c49b68bef9/i,
        ),
        contract: expect.stringMatching(
          /ETHEREUM:0xd8560c88d1dc85f9ed05b25878e366c49b68bef9/i,
        ),
        tokenId: expect.stringMatching(
          /3099253609847337010599495937138288429512178397116104279154407086947014017032/i,
        ),
      }),
    )
  })

  it("should return tokenId for 1155_LAZY", async () => {
    const encoded =
      "0x0d5f7d3500000000000000000000000000000000000000000000000000000000000000200000000000000000000000007857aeb275ce51f7c3338d9f4d2676a329a021ec00000000000000000000000000000000000000000000000000000000000000151cdfaa400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000b1310c5a2c30000000000000000000000000000000000000000000000000000000000000000000069bf9b535572ee716ee80117dc951e6136bc9d473b2e112e03957286d52afdea0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e000000000000000000000000000000000000000000000000000000000000005c0000000000000000000000000000000000000000000000000010e0198eaee00000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000002e00000000000000000000000007c4b13b5893cd82f371c5e28f12fb2f37542bbc500000000000000000000000000000000000000000000000000000000000000407857aeb275ce51f7c3338d9f4d2676a329a021ec00000000000000000000005d00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000342f697066732f516d664d574c6b6545384d6b65763757527173586574474246395551334a517464414735704c76596e514259673700000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000007857aeb275ce51f7c3338d9f4d2676a329a021ec000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000000000010000000000000000000000007857aeb275ce51f7c3338d9f4d2676a329a021ec00000000000000000000000000000000000000000000000000000000000002580000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000410cfd11fba6c30c1c877a0ee0531bee3271d681c693142c9f01420facda29afe7262aeae17f75dc24d05206dcb5b441393e92c8d78ad0e52e906e1bb6d1f45fd11c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041ede8c7a3471771fe081d52ba6604f28d38411091cc9f9da4de29c8ef1993865f471fa29ae18d9b366aef39230598ed10670d1758c0da3f8a0f521151ae7733e81b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678900000000000000000000000000123456789face09616c6c64617461"
    const id = await decodeToken(encoded)

    expect(id).toEqual(
      expect.objectContaining({
        blockchain: "ETHEREUM",
        collection: expect.stringMatching(
          /ETHEREUM:0x7c4B13B5893cD82f371c5e28f12FB2F37542BbC5/i,
        ),
        contract: expect.stringMatching(
          /ETHEREUM:0x7c4B13B5893cD82f371c5e28f12FB2F37542BbC5/i,
        ),
        tokenId: expect.stringMatching(
          /54432463239768947679520813681406064870422328906862735308373753226626766733405/i,
        ),
      }),
    )
  })

  it("should return tokenId for 1155", async () => {
    const encoded =
      "0x0d5f7d350000000000000000000000000000000000000000000000000000000000000020000000000000000000000000913aa8fe2516752ba1a74a0f1d5168b43977a4310000000000000000000000000000000000000000000000000000000000000001973bb6400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000174876e8000000000000000000000000000000000000000000000000000000000000000000daa6bcdee654340b8bdb432562980f51c8395cafa0c36a027210b05bc87400b90000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006425cdbf23d235ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000174876e800000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000003e00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000f4910c763ed4e47a585e2d34baa9a4b611ae448cd5be662cf4d6d9722990ca2cdd16bf53ecb943250000000000000a00000000010000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d6ffd79b52a587a0a9941a61f4e6cb0d386d545800000000000000000000000000000000000000000000000000000000000000fa00000000000000000000000000000000000000000000000000000000000000412c37d0c3b23b1ef0cf99a8273304923539c483e42a004f915ece1f76f2adefd11888154d97a597ce688dd2644a627d23c8cfaab3cbed10742935c6bded14e2101b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678900000000000000000000000000123456789face09616c6c64617461"
    const id = await decodeToken(encoded)

    expect(id).toEqual(
      expect.objectContaining({
        blockchain: "ETHEREUM",
        collection: expect.stringMatching(
          /ETHEREUM:0xf4910C763eD4e47A585E2D34baA9A4b611aE448C/i,
        ),
        contract: expect.stringMatching(
          /ETHEREUM:0xf4910C763eD4e47A585E2D34baA9A4b611aE448C/i,
        ),
        tokenId: expect.stringMatching(
          /96679042880693242821382367246033072756415480234129085295252366780302115209217/i,
        ),
      }),
    )
  })

  it("should return tokenId for 721", async () => {
    const encoded =
      "0x0d5f7d350000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f5156e07f9e10c6a6a308d8fe1ad912e983c534a000000000000000000000000000000000000000000000000000000000000000173ad21460000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000003faa2522600000000000000000000000000000000000000000000000000000000000000000001d5a5143913695b0f3cd1bd3695b2311064feb1e994bd8a125f31b01269720860000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000003faa25226000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000003a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000d8560c88d1dc85f9ed05b25878e366c49b68bef9be55859659f74e70899c5832b493043361e8c31c00000000000000000000000900000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000415edfafb5e08423c10f853daa2443cd7c8a9595206a90e247028363735e94d79e441e78dbf25dd509446096b94e79e605288d9b875288ed28d5f338a33f7a048c1b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678900000000000000000000000000123456789face09616c6c64617461"
    const id = await decodeToken(encoded)

    expect(id).toEqual(
      expect.objectContaining({
        blockchain: "ETHEREUM",
        collection: expect.stringMatching(
          /ETHEREUM:0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9/i,
        ),
        contract: expect.stringMatching(
          /ETHEREUM:0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9/i,
        ),
        tokenId: expect.stringMatching(
          /86090545217057429589019094455964497579787873809883022909766658167983963111433/i,
        ),
      }),
    )
  })
})
