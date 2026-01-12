import { SignIdentity } from "@dfinity/agent"
import { NeuronState } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"
import {
  Followees,
  Neuron,
  NeuronId,
} from "@dfinity/sns/dist/candid/sns_governance"
import {
  bytesToHexString,
  hexStringToBytes,
} from "src/integration/staking/service/staking-service-impl"

import {
  disburse,
  hasOwnProperty,
  startDissolving,
  stopDissolving,
  TransferArg,
} from "@nfid/integration"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { FT } from "frontend/integration/ft/ft"

import { StakeSnsParamsCalculatorImpl } from "../calculator/stake-sns-params-calculator"
import { NfidNeuronImpl } from "./nfid-neuron-impl"

const MILISECONDS_PER_SECOND = 1000
export class NfidSNSNeuronImpl extends NfidNeuronImpl<Neuron> {
  getState(): NeuronState {
    const now = Math.floor(Date.now() / 1000)
    const dissolveState = this.neuron.dissolve_state[0]
    if (!dissolveState) return NeuronState.Unspecified

    if (
      "DissolveDelaySeconds" in dissolveState &&
      dissolveState.DissolveDelaySeconds > BigInt(0)
    )
      return NeuronState.Locked

    if (
      "DissolveDelaySeconds" in dissolveState &&
      dissolveState.DissolveDelaySeconds === BigInt(0)
    )
      return NeuronState.Dissolved

    if (
      "WhenDissolvedTimestampSeconds" in dissolveState &&
      dissolveState.WhenDissolvedTimestampSeconds <= now
    )
      return NeuronState.Dissolved

    if (
      "WhenDissolvedTimestampSeconds" in dissolveState &&
      dissolveState.WhenDissolvedTimestampSeconds > now
    )
      return NeuronState.Dissolving

    return NeuronState.Unspecified
  }

  getStakeId(): NeuronId {
    return { id: this.neuron.id[0]!.id }
  }

  getFollowees(): [bigint, Followees][] {
    return this.neuron.followees
  }

  getStakeIdFormatted(): string {
    return bytesToHexString(this.neuron.id[0]!.id)
  }

  getInitialStake(): bigint {
    return this.neuron.cached_neuron_stake_e8s
  }

  getRewards(): bigint {
    return this.neuron.staked_maturity_e8s_equivalent[0] || BigInt(0)
  }

  getLockTime(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return

    if (
      "DissolveDelaySeconds" in dissolveState &&
      dissolveState.DissolveDelaySeconds > BigInt(0)
    ) {
      return Number(dissolveState.DissolveDelaySeconds)
    }
  }

  getUnlockIn(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return

    if ("WhenDissolvedTimestampSeconds" in dissolveState) {
      return Number(dissolveState.WhenDissolvedTimestampSeconds)
    }
  }

  getCreatedAt(): number {
    return Number(this.neuron.created_timestamp_seconds)
  }

  async startUnlocking(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    await startDissolving({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }

  async stopUnlocking(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    await stopDissolving({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })
  }

  isDiamond(): boolean {
    const lockTime = this.getLockTime()
    if (
      !lockTime ||
      lockTime + this.getCreatedAt() <=
        Math.floor(Date.now() / MILISECONDS_PER_SECOND)
    )
      return false

    return this.params?.getMaximumLockTime() === lockTime
  }

  serialize(): unknown {
    const dissolveState = this.neuron.dissolve_state[0]

    return {
      id: bytesToHexString(this.neuron.id[0]!.id),
      dissolveState: dissolveState
        ? "DissolveDelaySeconds" in dissolveState
          ? {
              DissolveDelaySeconds:
                dissolveState.DissolveDelaySeconds.toString(),
            }
          : {
              WhenDissolvedTimestampSeconds:
                dissolveState.WhenDissolvedTimestampSeconds.toString(),
            }
        : undefined,
      followees: this.neuron.followees.map(([nid, f]) => [
        nid.toString(),
        {
          followees: f.followees.map(({ id }) => bytesToHexString(id)),
        },
      ]),
      cachedNeuronStake: this.neuron.cached_neuron_stake_e8s.toString(),
      stakedMaturityE8sEquivalent: this.neuron.staked_maturity_e8s_equivalent[0]
        ? this.neuron.staked_maturity_e8s_equivalent[0].toString()
        : undefined,
      createdTimestampSeconds: this.neuron.created_timestamp_seconds.toString(),
    }
  }

  static deserialize(
    raw: any,
    token: FT,
    params: StakeSnsParamsCalculatorImpl,
  ): NfidSNSNeuronImpl {
    const dissolveStateRaw = raw.dissolveState
      ? "DissolveDelaySeconds" in raw.dissolveState
        ? {
            DissolveDelaySeconds: BigInt(
              raw.dissolveState.DissolveDelaySeconds,
            ),
          }
        : {
            WhenDissolvedTimestampSeconds: BigInt(
              raw.dissolveState.WhenDissolvedTimestampSeconds,
            ),
          }
      : undefined

    const neuron = {
      id: [{ id: hexStringToBytes(raw.id) }],
      dissolve_state: dissolveStateRaw ? [dissolveStateRaw] : [],
      followees: raw.followees.map(
        ([nid, f]: [string, { followees: string[] }]) => [
          BigInt(nid),
          {
            followees: f.followees.map((hexId: string) => ({
              id: hexStringToBytes(hexId),
            })),
          },
        ],
      ),
      cached_neuron_stake_e8s: BigInt(raw.cachedNeuronStake),
      staked_maturity_e8s_equivalent: raw.stakedMaturityE8sEquivalent
        ? [BigInt(raw.stakedMaturityE8sEquivalent)]
        : [],
      created_timestamp_seconds: BigInt(raw.createdTimestampSeconds),
    } as unknown as Neuron

    return new NfidSNSNeuronImpl(neuron, token, params)
  }

  async redeem(signIdentity: SignIdentity): Promise<void> {
    const rootCanisterId = this.token.getRootSnsCanister()
    if (!rootCanisterId) return

    const transferArgs: TransferArg = {
      amount: this.getProtocolFee(),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET_CANISTER_STAKING),
      },
    }

    const ledgerCanisterId = await icrc1OracleService
      .getICRC1Canisters()
      .then((canisters) =>
        canisters
          .filter((canister) => canister.root_canister_id.length > 0)
          .find(
            (canister) =>
              canister.root_canister_id[0] === rootCanisterId.toText(),
          ),
      )

    await disburse({
      identity: signIdentity,
      rootCanisterId: rootCanisterId,
      neuronId: this.neuron.id[0]!,
    })

    const result = await transferICRC1(
      signIdentity,
      ledgerCanisterId!.ledger,
      transferArgs,
    )

    if (!hasOwnProperty(result, "Ok")) {
      console.warn(
        "Error transferring protocol fee: " + JSON.stringify(result.Err),
      )
    }
  }
}
