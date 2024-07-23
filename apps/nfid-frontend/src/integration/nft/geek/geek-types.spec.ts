/**
 * @jest-environment jsdom
 */


import {nftGeekService} from "src/integration/nft/geek/nft-geek-service";
import {JsonnableEd25519KeyIdentity} from "@dfinity/identity/lib/cjs/identity/ed25519";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {expectedGeekResponse, mockGeekResponse} from "src/integration/nft/mock/mock";

//j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae
//0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df

const MOCK: JsonnableEd25519KeyIdentity = [
  '302a300506032b6570032100f9d64b254d1afe726be978cf6f79b790d392804196c63ec67d6382232657b491',
  '155d3f962bf54ccb7ed7421cb358e276f28c6d64e406f46bbc41c3d3a9328054'
]

describe("geek api test", () => {
  it('should fetch and map NFT data correctly', async () => {
    let identity = Ed25519KeyIdentity.fromParsedJson(MOCK)
    jest.spyOn(nftGeekService as any, 'fetchNftGeekData').mockResolvedValue(mockGeekResponse);
    const result = await nftGeekService.getNftGeekData(identity.getPrincipal());
    expect(result).toEqual(expectedGeekResponse);
  });
})
