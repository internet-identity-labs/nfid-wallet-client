import { Ed25519KeyIdentity } from "@dfinity/identity"
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { Principal } from "@dfinity/principal"
import { ftService } from "src/integration/ft/ft-service"
import {
  bytesToHexString,
  stakingService,
} from "src/integration/staking/service/staking-service-impl"

import { disburse, querySnsNeurons } from "@nfid/integration"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

import { mockFt, mock2 } from "./mock"

const NFIDW_ROOT_CANISTER = "m2blf-zqaaa-aaaaq-aaejq-cai"

const pairPrincipal =
  "ayigd-u23ly-o65by-pzgtm-udimh-ktcue-hyzwp-uqccr-t3vl4-b3mxe-bae"

const identityJSON: JsonnableEd25519KeyIdentity = [
  "302a300506032b6570032100131aeb46319e402bb2930889ab86caf1175efe71e9f313a4c5f91bb91153f63e",
  "2803f8e8547e0ed4deced3c645c9758fc72b6e61f60aa7b46f7705925b8a28fe",
]

describe("Staking", () => {
  jest.setTimeout(90000)
  it.skip("should stake neuron", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    console.log(edId.getPrincipal().toText())
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce(mockFt)
    try {
      let neuronsNFIDW = await querySnsNeurons({
        identity: edId.getPrincipal(),
        rootCanisterId: Principal.fromText(NFIDW_ROOT_CANISTER),
        certified: false,
      })
      let a = neuronsNFIDW.find(
        (n) => n.cached_neuron_stake_e8s === BigInt(500000000),
      )
      await disburse({
        identity: edId,
        rootCanisterId: Principal.fromText(NFIDW_ROOT_CANISTER),
        neuronId: a!.id[0]!,
      })
    } catch (e: any) {
      console.log(e.message)
    }
    let token = await ftService
      .getTokens(pairPrincipal)
      .then((tokens) =>
        tokens.find((token) => token.getTokenSymbol() === "NFIDW"),
      )
    let staked = await stakingService.stake(token!, "5", edId)
    expect(staked).toBeDefined()
    let neuronsNFIDW = await querySnsNeurons({
      identity: edId.getPrincipal(),
      rootCanisterId: Principal.fromText(NFIDW_ROOT_CANISTER),
      certified: false,
    })
    let actual = neuronsNFIDW.find(
      (n) => bytesToHexString(n!.id[0]!.id) === bytesToHexString(staked.id),
    )
    expect(actual?.followees.length).toBeGreaterThan(0)
  })

  it("should return staked neurons", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce(mockFt)
    jest.spyOn(stakingService as any, "getNeurons").mockResolvedValueOnce(mock2)

    const stakedTokens = await stakingService.getStakedTokens(
      pairPrincipal,
      pairPrincipal,
      edId,
    )

    const nfidwStake = stakedTokens[0]
    const available = nfidwStake
      .getAvailable()
      .filter((s) => s.getInitialStake() > 0)
    const locked = nfidwStake.getLocked()
    const unlocking = nfidwStake.getUnlocking()

    expect(nfidwStake.getToken().getTokenName()).toEqual("NFIDW")

    expect(nfidwStake.getStaked()).toEqual(BigInt(1800000000))
    expect(nfidwStake.getStakedFormatted().getTokenValue()).toEqual("18")

    expect(nfidwStake.getRewards()).toEqual(BigInt(100000000))
    expect(nfidwStake.getRewardsFormatted().getTokenValue()).toEqual("1")

    expect(nfidwStake.getStakingBalance()).toEqual(BigInt(1900000000))
    expect(nfidwStake.getStakingBalanceFormatted().getTokenValue()).toEqual(
      "19",
    )

    expect(nfidwStake.isDiamond()).toBe(false)

    expect(available.length).toEqual(1)
    expect(locked.length).toEqual(1)
    expect(unlocking.length).toEqual(1)

    expect(available[0].getInitialStake()).toEqual(BigInt(700000000))
    expect(available[0].getInitialStakeFormatted().getTokenValue()).toEqual(
      "7 NFIDW",
    )

    expect(available[0].getRewards()).toEqual(BigInt(100000000))
    expect(available[0].getRewardsFormatted().getTokenValue()).toEqual(
      "1 NFIDW",
    )

    expect(available[0].getTotalValue()).toEqual(BigInt(800000000))
    expect(available[0].getTotalValueFormatted().getTokenValue()).toEqual(
      "8 NFIDW",
    )

    expect(available[0].getLockTime()).toEqual(0)
    expect(available[0].getLockTimeInMonths()).toEqual(0)
    expect(available[0].getUnlockIn()).toBeUndefined()
    expect(available[0].getUnlockInMonths()).toBeUndefined()
    expect(available[0].getUnlockInFormatted()).toBeUndefined()
    expect(available[0].getCreatedAt()).toEqual(1722298123)
    expect(available[0].getCreatedAtFormatted().getDate()).toEqual(
      "Jul 30, 2024",
    )
    expect(available[0].getCreatedAtFormatted().getTime()).toEqual(
      "12:08:43 AM",
    )

    expect(locked[0].getLockTime()).toEqual(18144000)
    expect(locked[0].getLockTimeInMonths()).toEqual(7)
    expect(locked[0].getUnlockIn()).toBeUndefined()
    expect(locked[0].getUnlockInMonths()).toBeUndefined()
    expect(locked[0].getUnlockInFormatted()).toBeUndefined()
    expect(locked[0].getCreatedAt()).toEqual(1742298123)
    expect(locked[0].getCreatedAtFormatted().getDate()).toEqual("Mar 18, 2025")
    expect(locked[0].getCreatedAtFormatted().getTime()).toEqual("11:42:03 AM")

    expect(unlocking[0].getLockTime()).toBeUndefined()
    expect(unlocking[0].getLockTimeInMonths()).toBeUndefined()
    expect(unlocking[0].getUnlockIn()).toEqual(1750357341)
    expect(unlocking[0].getUnlockInMonths()).toEqual(1)
    expect(unlocking[0].getUnlockInFormatted()?.getDate()).toEqual(
      "Jun 19, 2025",
    )
    expect(unlocking[0].getUnlockInFormatted()?.getTime()).toEqual("6:22:21 PM")
    expect(unlocking[0].getCreatedAt()).toEqual(1742298123)
    expect(unlocking[0].getCreatedAtFormatted().getDate()).toEqual(
      "Mar 18, 2025",
    )
    expect(unlocking[0].getCreatedAtFormatted().getTime()).toEqual(
      "11:42:03 AM",
    )
  })

  it("should return staking parameters", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce(mockFt)

    let token = await ftService
      .getTokens(pairPrincipal)
      .then((tokens) =>
        tokens.find((token) => token.getTokenSymbol() === "NFIDW"),
      )

    const params = await stakingService.getStakeCalculator(token!, edId)

    expect(params).toBeDefined()
    expect(params?.getMinimumToStake()).toBe(5)
    expect(params?.getFee().getTokenValue()).toBe("0.0001 NFIDW")
    expect(params?.getMaximumLockTimeInMonths()).toBe(12)
    expect(params?.getMinimumLockTimeInMonths()).toBe(1)
  })

  it("should return staked neurons", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce(mockFt)
    jest.spyOn(stakingService as any, "getNeurons").mockResolvedValueOnce(mock2)

    const stakedTokens = await stakingService.getStakedTokens(
      pairPrincipal,
      pairPrincipal,
      edId,
    )

    const nfidwStake = stakedTokens[0]
    const available = nfidwStake
      .getAvailable()
      .filter((s) => s.getInitialStake() > 0)
    const locked = nfidwStake.getLocked()
    const unlocking = nfidwStake.getUnlocking()

    expect(nfidwStake.getToken().getTokenName()).toEqual("NFIDW")

    expect(nfidwStake.getStaked()).toEqual(BigInt(1800000000))
    expect(nfidwStake.getStakedFormatted().getTokenValue()).toEqual("18")

    expect(nfidwStake.getRewards()).toEqual(BigInt(100000000))
    expect(nfidwStake.getRewardsFormatted().getTokenValue()).toEqual("1")

    expect(nfidwStake.getStakingBalance()).toEqual(BigInt(1900000000))
    expect(nfidwStake.getStakingBalanceFormatted().getTokenValue()).toEqual(
      "19",
    )

    expect(nfidwStake.isDiamond()).toBe(false)

    expect(available.length).toEqual(1)
    expect(locked.length).toEqual(1)
    expect(unlocking.length).toEqual(1)

    expect(available[0].getInitialStake()).toEqual(BigInt(700000000))
    expect(available[0].getInitialStakeFormatted().getTokenValue()).toEqual(
      "7 NFIDW",
    )

    expect(available[0].getRewards()).toEqual(BigInt(100000000))
    expect(available[0].getRewardsFormatted().getTokenValue()).toEqual(
      "1 NFIDW",
    )

    expect(available[0].getTotalValue()).toEqual(BigInt(800000000))
    expect(available[0].getTotalValueFormatted().getTokenValue()).toEqual(
      "8 NFIDW",
    )

    expect(available[0].getLockTime()).toEqual(0)
    expect(available[0].getLockTimeInMonths()).toEqual(0)
    expect(available[0].getUnlockIn()).toBeUndefined()
    expect(available[0].getUnlockInMonths()).toBeUndefined()
    expect(available[0].getUnlockInFormatted()).toBeUndefined()
    expect(available[0].getCreatedAt()).toEqual(1722298123)
    expect(available[0].getCreatedAtFormatted().getDate()).toEqual(
      "Jul 30, 2024",
    )
    expect(available[0].getCreatedAtFormatted().getTime()).toEqual(
      "12:08:43 AM",
    )

    expect(locked[0].getLockTime()).toEqual(18144000)
    expect(locked[0].getLockTimeInMonths()).toEqual(7)
    expect(locked[0].getUnlockIn()).toBeUndefined()
    expect(locked[0].getUnlockInMonths()).toBeUndefined()
    expect(locked[0].getUnlockInFormatted()).toBeUndefined()
    expect(locked[0].getCreatedAt()).toEqual(1742298123)
    expect(locked[0].getCreatedAtFormatted().getDate()).toEqual("Mar 18, 2025")
    expect(locked[0].getCreatedAtFormatted().getTime()).toEqual("11:42:03 AM")

    expect(unlocking[0].getLockTime()).toBeUndefined()
    expect(unlocking[0].getLockTimeInMonths()).toBeUndefined()
    expect(unlocking[0].getUnlockIn()).toEqual(1750357341)
    expect(unlocking[0].getUnlockInMonths()).toEqual(1)
    expect(unlocking[0].getUnlockInFormatted()?.getDate()).toEqual(
      "Jun 19, 2025",
    )
    expect(unlocking[0].getUnlockInFormatted()?.getTime()).toEqual("6:22:21 PM")
    expect(unlocking[0].getCreatedAt()).toEqual(1742298123)
    expect(unlocking[0].getCreatedAtFormatted().getDate()).toEqual(
      "Mar 18, 2025",
    )
    expect(unlocking[0].getCreatedAtFormatted().getTime()).toEqual(
      "11:42:03 AM",
    )
  })

  it("should return staking parameters", async () => {
    let edId = Ed25519KeyIdentity.fromParsedJson(identityJSON)
    jest
      .spyOn(icrc1StorageService as any, "getICRC1Canisters")
      .mockResolvedValueOnce(mockFt)

    let token = await ftService
      .getTokens(pairPrincipal)
      .then((tokens) =>
        tokens.find((token) => token.getTokenSymbol() === "NFIDW"),
      )

    const params = await stakingService.getStakeCalculator(token!, edId)

    expect(params).toBeDefined()
    expect(params?.getMinimumToStake()).toBe(5)
    expect(params?.getFee().getTokenValue()).toBe("0.0001 NFIDW")
    expect(params?.getMaximumLockTimeInMonths()).toBe(12)
    expect(params?.getMinimumLockTimeInMonths()).toBe(1)
  })
})
