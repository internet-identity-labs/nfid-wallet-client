import { HttpAgent } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"
import { Principal } from "@icp-sdk/core/principal"

/**
 * ICRC-7 / ICRC-37 batch updates whose result is read in either shape:
 * the spec returns `vec opt Result`, ORIGYN core_nft wraps it in an outer
 * `Result`. A per-token error comes back inside a successful reply, so it
 * must be checked: the call itself does not fail.
 */

export type ItemResult = { Ok: bigint } | { Err: Record<string, unknown> }

const Account = IDL.Record({
  owner: IDL.Principal,
  subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
})

const errorFields = {
  GenericError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
  GenericBatchError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
  NonExistingTokenId: IDL.Null,
  Unauthorized: IDL.Null,
  // nat64 in ICRC-37 errors, nat in ICRC-7 ones.
  CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
  TooOld: IDL.Null,
}

const ApproveTokenError = IDL.Variant({
  ...errorFields,
  InvalidSpender: IDL.Null,
})
const RevokeTokenApprovalError = IDL.Variant({
  ...errorFields,
  ApprovalDoesNotExist: IDL.Null,
})
const TransferError = IDL.Variant({
  ...errorFields,
  CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat }),
  Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
  InvalidRecipient: IDL.Null,
})

const methods = {
  icrc37_approve_tokens: {
    arg: IDL.Record({
      token_id: IDL.Nat,
      approval_info: IDL.Record({
        spender: Account,
        from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        expires_at: IDL.Opt(IDL.Nat64),
        memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
        created_at_time: IDL.Nat64,
      }),
    }),
    error: ApproveTokenError,
  },
  icrc37_revoke_token_approvals: {
    arg: IDL.Record({
      token_id: IDL.Nat,
      spender: IDL.Opt(Account),
      from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
      created_at_time: IDL.Opt(IDL.Nat64),
    }),
    error: RevokeTokenApprovalError,
  },
  icrc7_transfer: {
    arg: IDL.Record({
      to: Account,
      token_id: IDL.Nat,
      memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
      from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      created_at_time: IDL.Opt(IDL.Nat64),
    }),
    error: TransferError,
  },
}

export type Icrc7BatchMethod = keyof typeof methods

/** One error as text, e.g. `CreatedInFuture {"ledger_time":"17…"}`. */
export const describeIcrcError = (err: Record<string, unknown>): string => {
  const [name, value] = Object.entries(err)[0] ?? ["Unknown", null]
  if (value === null || value === undefined) return name
  const details = JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v,
  )
  return `${name} ${details}`
}

/**
 * Decodes the reply in the ORIGYN shape or the spec shape. Returns an empty
 * array if neither fits (e.g. an unknown error variant): the caller then
 * has to check the effect another way.
 */
export function decodeBatchReply(
  method: Icrc7BatchMethod,
  reply: Uint8Array,
): Array<ItemResult | undefined> {
  const { error } = methods[method]
  const item = IDL.Variant({ Ok: IDL.Nat, Err: error })
  const spec = IDL.Vec(IDL.Opt(item))
  const origyn = IDL.Variant({ Ok: spec, Err: error })

  try {
    const [res] = IDL.decode([origyn], reply) as [
      { Ok: Array<[] | [ItemResult]> } | { Err: Record<string, unknown> },
    ]
    return "Err" in res ? [{ Err: res.Err }] : res.Ok.map((i) => i[0])
  } catch {
    // Not the ORIGYN shape.
  }
  try {
    const [items] = IDL.decode([spec], reply) as [Array<[] | [ItemResult]>]
    return items.map((i) => i[0])
  } catch (e) {
    console.warn(`Unexpected ${method} reply`, e)
    return []
  }
}

/** Calls a batch method and returns one result per argument. */
export async function callIcrc7Batch(
  agent: HttpAgent,
  canisterId: string,
  method: Icrc7BatchMethod,
  args: unknown[],
): Promise<Array<ItemResult | undefined>> {
  const { arg } = methods[method]
  const { reply } = await agent.update(Principal.fromText(canisterId), {
    methodName: method,
    arg: IDL.encode([IDL.Vec(arg)], [args]),
    effectiveCanisterId: Principal.fromText(canisterId),
  })
  const results = decodeBatchReply(method, new Uint8Array(reply))
  // An outer error applies to the whole batch.
  return results.length === 1 && args.length > 1
    ? args.map(() => results[0])
    : results
}
