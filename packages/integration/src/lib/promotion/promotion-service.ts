import { HttpAgent, SignIdentity } from "@icp-sdk/core/agent"
import {
  ApproveParams,
  IcrcLedgerCanister,
  type IcrcLedgerDid,
} from "@icp-sdk/canisters/ledger/icrc"
import { Principal } from "@icp-sdk/core/principal"

import { idlFactory } from "../_ic_api/icrc1_oracle"
import type {
  FeaturedSlot as RawFeaturedSlot,
  HistoricalBid as RawHistoricalBid,
  PlaceBidError as RawPlaceBidError,
  PlaceBidResult,
  PromotionStatus as RawPromotionStatus,
  _SERVICE,
} from "../_ic_api/icrc1_oracle.d"
import { actorBuilder, agentBaseConfig, iCRC1OracleActor } from "../actors"
// ICRC1_ORACLE_CANISTER_ID is a global env var (see types/env/index.d.ts).
import {
  FeaturedSlot,
  HistoricalBid,
  PlaceBidError,
  PromotionConfig,
  PromotionError,
  PromotionStatus,
} from "./types"

const NS_PER_MS = BigInt(1_000_000)
const HISTORY_PAGE_SIZE = 100

export class PromotionService {
  async getStatus(): Promise<PromotionStatus> {
    const raw =
      (await iCRC1OracleActor.get_promotion_status()) as RawPromotionStatus
    return this.mapStatus(raw)
  }

  async placeBid(
    identity: SignIdentity,
    appId: number,
    amountE8s: bigint,
  ): Promise<FeaturedSlot> {
    const status = await this.getStatus()
    const guard = validate(amountE8s, status)
    if (guard) throw new PromotionError(guard)

    await this.approveTreasury(
      identity,
      status.config.ledgerCanisterId,
      ICRC1_ORACLE_CANISTER_ID,
      amountE8s,
    )

    const actor = actorBuilder<_SERVICE>(ICRC1_ORACLE_CANISTER_ID, idlFactory, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })
    const result = (await actor.place_bid({
      app_id: appId,
      amount_e8s: amountE8s,
    })) as PlaceBidResult

    if ("Err" in result) {
      throw new PromotionError(this.mapError(result.Err))
    }
    return this.mapSlot(result.Ok)
  }

  async getBidHistory(
    pageSize: number = HISTORY_PAGE_SIZE,
  ): Promise<HistoricalBid[]> {
    const total = (await iCRC1OracleActor.count_bid_history()) as bigint
    const pages = Math.ceil(Number(total) / pageSize)
    const result: HistoricalBid[] = []
    for (let i = 0; i < pages; i++) {
      const batch = (await iCRC1OracleActor.get_bid_history_paginated(
        BigInt(i * pageSize),
        BigInt(pageSize),
      )) as RawHistoricalBid[]
      result.push(...batch.map((b) => this.mapHistoricalBid(b)))
    }
    return result
  }

  // ── private helpers ──

  private async approveTreasury(
    identity: SignIdentity,
    ledgerCanisterId: string,
    treasuryPrincipal: string,
    amountE8s: bigint,
  ): Promise<bigint> {
    const ledger = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(ledgerCanisterId),
      agent: new HttpAgent({ ...agentBaseConfig, identity }),
    })
    const spender: IcrcLedgerDid.Account = {
      owner: Principal.fromText(treasuryPrincipal),
      subaccount: [],
    }
    const params: ApproveParams = { spender, amount: amountE8s }
    const blockIndex = await ledger.approve(params)
    return BigInt(blockIndex)
  }

  private mapStatus(raw: RawPromotionStatus): PromotionStatus {
    return {
      config: this.mapConfig(raw.config),
      featured:
        raw.featured.length === 0 ? undefined : this.mapSlot(raw.featured[0]),
      minNextBidE8s: raw.min_next_bid_e8s,
      locked: raw.locked,
      now: nsToDate(raw.now_ns),
    }
  }

  private mapConfig(raw: RawPromotionStatus["config"]): PromotionConfig {
    return {
      minBidE8s: raw.min_bid_e8s,
      bidIncrementE8s: raw.bid_increment_e8s,
      lockedPeriodMs: Number(raw.locked_period_ns / NS_PER_MS),
      featureDurationMs: Number(raw.feature_duration_ns / NS_PER_MS),
      ledgerCanisterId: raw.ledger_canister.toText(),
      treasuryPrincipal: raw.treasury.toText(),
    }
  }

  private mapSlot(raw: RawFeaturedSlot): FeaturedSlot {
    return {
      appId: raw.app_id,
      bidder: raw.bidder.toText(),
      bidAmountE8s: raw.bid_amount_e8s,
      bidTime: nsToDate(raw.bid_time_ns),
      lockedUntil: nsToDate(raw.locked_until_ns),
      expiresAt: nsToDate(raw.expires_at_ns),
    }
  }

  private mapHistoricalBid(raw: RawHistoricalBid): HistoricalBid {
    return {
      appId: raw.app_id,
      bidder: raw.bidder.toText(),
      bidAmountE8s: raw.bid_amount_e8s,
      bidTime: nsToDate(raw.bid_time_ns),
    }
  }

  private mapError(raw: RawPlaceBidError): PlaceBidError {
    if ("Locked" in raw)
      return { kind: "locked", until: nsToDate(raw.Locked.until_ns) }
    if ("BelowFloor" in raw)
      return { kind: "belowFloor", floorE8s: raw.BelowFloor.floor_e8s }
    if ("BelowIncrement" in raw)
      return {
        kind: "belowIncrement",
        requiredE8s: raw.BelowIncrement.required_e8s,
      }
    if ("UnknownApp" in raw) return { kind: "unknownApp" }
    if ("TransferFailed" in raw)
      return { kind: "transferFailed", message: raw.TransferFailed }
    return { kind: "notConfigured" }
  }
}

export function computePreFill(status: PromotionStatus): bigint {
  return status.minNextBidE8s
}

export function validate(
  amountE8s: bigint,
  status: PromotionStatus,
): PlaceBidError | undefined {
  if (status.locked && status.featured)
    return { kind: "locked", until: status.featured.lockedUntil }
  if (!status.featured && amountE8s < status.config.minBidE8s)
    return { kind: "belowFloor", floorE8s: status.config.minBidE8s }
  if (amountE8s < status.minNextBidE8s)
    return { kind: "belowIncrement", requiredE8s: status.minNextBidE8s }
  return undefined
}

const nsToDate = (ns: bigint): Date => new Date(Number(ns / NS_PER_MS))

export const promotionService = new PromotionService()
