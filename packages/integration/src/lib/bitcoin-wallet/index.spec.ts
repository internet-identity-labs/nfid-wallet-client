/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";
import { BigNumber } from "@rarible/utils";

import { btcWallet, generateDelegationIdentity, mockIdentityA, replaceActorIdentity } from "@nfid/integration";

import { BtcAsset } from "./btc-asset";
import { BtcWallet } from "./btc-wallet";

describe("BTC suite", () => {
  jest.setTimeout(200000);

  let address = "";

  it("get btc address", async () => {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA);
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity);
    replaceActorIdentity(btcWallet, delegationIdentity);
    address = await new BtcWallet(delegationIdentity).getBitcoinAddress();
    expect(address).toEqual("mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc");
  });

  it("get balance", async () => {
    const balance = await BtcAsset.getBalance(address);
    expect(balance).toMatchObject({
      balance: expect.any(BigNumber),
      balanceinUsd: expect.any(BigNumber)
    });
  });

  it("get activities to", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor: undefined,
      size: 1,
      direction: "to"
    });
    expect(txs.activities.length).toEqual(1);
    expect(txs).toEqual({
      activities: [
        {
          id: "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          date: 1680169535,
          to: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          from: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          transactionHash:
            "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          price: 10
        }
      ],
      cursor:
        "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4"
    });
  });

  it("get activities with cursor", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor:
        "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99",
      size: 7,
      direction: "to"
    });
    expect(txs.activities.length).toEqual(2);
    expect(txs).toEqual({
      activities: [
        {
          id: "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          date: 1680169535,
          to: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          from: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          transactionHash:
            "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          price: 10
        },
        {
          id: "c174f8c49c7d65db829e8cb40675bc8868f6ec356e3c5668b07943ea9d85f6d5",
          date: 1680166433,
          to: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          from: "tb1qkc3spt0llkgcp7lzrfpms5t29srtm84hsgjk5j",
          transactionHash:
            "c174f8c49c7d65db829e8cb40675bc8868f6ec356e3c5668b07943ea9d85f6d5",
          price: 11180
        }
      ],
      cursor:
        "e1a7aa68258849bd01d4ad460204327a00cae2a154260edc68211f9534ea1f99"
    });
  });

  it("get activities from", async () => {
    const txs = await BtcAsset.getFungibleActivityByTokenAndUser({
      address,
      cursor: undefined,
      size: 1,
      direction: "from"
    });
    expect(txs.activities.length).toEqual(1);
    expect(txs).toEqual({
      activities: [
        {
          id: "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          date: 1680169535,
          to: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          from: "mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc",
          transactionHash:
            "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4",
          price: 11180
        }
      ],
      cursor:
        "3d1aed3299deb41ff8ae42ba7219bc3155a40766635e105b08ba18d0f9ada3d4"
    });
  });
});
