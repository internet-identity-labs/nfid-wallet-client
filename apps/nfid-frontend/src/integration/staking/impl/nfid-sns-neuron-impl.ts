import { SignIdentity } from "@dfinity/agent"
import { NeuronState } from "@dfinity/nns"
import { Principal } from "@dfinity/principal"
import {
  Followees,
  Neuron,
  NeuronId,
} from "@dfinity/sns/dist/candid/sns_governance"
import { bytesToHexString } from "src/integration/staking/service/staking-service-impl"

import {
  disburse,
  hasOwnProperty,
  startDissolving,
  stopDissolving,
  TransferArg,
} from "@nfid/integration"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { NfidNeuronImpl } from "./nfid-neuron-impl"

export class NfidSNSNeuronImpl extends NfidNeuronImpl<Neuron> {
  getState(): NeuronState {
    throw new Error("getState method is not supported for SNS neurons.")
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
    return this.neuron.maturity_e8s_equivalent
  }

  getLockTime(): number | undefined {
    const dissolveState = this.neuron.dissolve_state[0]

    if (!dissolveState) return

    if ("DissolveDelaySeconds" in dissolveState) {
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
    return false
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

    let ledgerCanisterId = await icrc1OracleService
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
