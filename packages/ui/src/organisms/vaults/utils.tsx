/* eslint-disable @nx/enforce-module-boundaries */
import BigNumber from "bignumber.js"
import { format } from "date-fns"
import { NS_PER_MS } from "@nfid/integration"
import { FT } from "frontend/integration/ft/ft"
import { PolicyUpdateType } from "./types"
import {
  ControllersUpdateTransaction,
  ICRC1CanistersAddTransaction,
  ICRC1CanistersRemoveTransaction,
  MemberCreateTransactionV2,
  MemberRemoveTransaction,
  MemberUpdateNameTransaction,
  QuorumUpdateTransaction,
  TopUpQuorumTransaction,
  Transaction,
  TransactionState,
  TransactionType,
  TransferICRC1QuorumTransaction,
  TransferQuorumTransaction,
  VaultUpdateNamingTransaction,
  WalletCreateTransaction,
} from "@nfid/vaults"
import { HexagonIcon } from "../../atoms/icons/hexagon"
import clsx from "clsx"
import { IconCmpArrow } from "../../atoms/icons"
import CopyAddress from "../../molecules/copy-address"
import { ICP_CANISTER_ID, TRIM_ZEROS } from "@nfid/integration/token/constants"
import { icpToTCycles } from "frontend/features/vaults/utils"
import { e8s } from "frontend/integration/nft/constants/constants"
import { VaultMember } from "@nfid/vaults"
import { getAddress } from "frontend/util/get-address"
import { Principal } from "@dfinity/principal"

export const vaultTxTimestampToDate = (timestamp: bigint): string => {
  return format(new Date(Number(timestamp / NS_PER_MS)), "MMMM d, yyyy")
}

export const vaultTxTimestampToTime = (timestamp: bigint): string => {
  return format(
    new Date(Number(timestamp / NS_PER_MS)),
    "hh:mm:ss aa",
  ).toLowerCase()
}

export const memberCreatedToDate = (timestamp: bigint): string => {
  return format(
    new Date(Number(timestamp / NS_PER_MS)),
    "MMM d, yyyy 'at' h:mm:ss aa",
  )
}

export const renderPolicyUpdateTitle = (type: PolicyUpdateType | null) => {
  switch (type) {
    case PolicyUpdateType.THRESHOLD:
      return "Update approval threshold"
    case PolicyUpdateType.ADD_APPROVER:
      return "Add approver"
    case PolicyUpdateType.EDIT_APPROVER:
      return "Edit approver"
    case PolicyUpdateType.REMOVE_APPROVER:
      return "Remove approver"
    default:
      return null
  }
}

export const groupTransactionsByDate = (
  groups: Transaction[][],
): { date: string; rows: Transaction[][] }[] => {
  const result: { date: string; rows: Transaction[][] }[] = []
  for (const txGroup of groups) {
    const date = vaultTxTimestampToDate(txGroup[0].modifiedDate)
    const last = result[result.length - 1]
    if (last && last.date === date) {
      last.rows.push(txGroup)
    } else {
      result.push({ date, rows: [txGroup] })
    }
  }
  return result
}

export const groupTransactionsByBatch = (
  transactions: Transaction[],
): Transaction[][] => {
  const groups = new Map<string, Transaction[]>()
  const ungrouped: Transaction[][] = []

  for (const tx of transactions) {
    if (tx.batchUid) {
      const group = groups.get(tx.batchUid)
      if (group) {
        group.push(tx)
      } else {
        groups.set(tx.batchUid, [tx])
      }
    } else {
      ungrouped.push([tx])
    }
  }

  return [...ungrouped, ...groups.values()]
}

export const isCreateVaultGroup = (txGroup: Transaction[]): boolean => {
  const types = new Set(txGroup.map((t) => t.transactionType))
  if (
    types.has(TransactionType.VaultNamingUpdate) &&
    types.has(TransactionType.WalletCreate)
  )
    return true
  if (txGroup.length === 1) {
    const tx = txGroup[0]
    return (
      tx.transactionType === TransactionType.MemberCreateV2 &&
      (tx as MemberCreateTransactionV2).name === "Initiator"
    )
  }
  return false
}

export const mergeCreateVaultGroup = (
  groups: Transaction[][],
): Transaction[][] => {
  const initiatorIdx = groups.findIndex(
    (g) =>
      g.length === 1 &&
      g[0].transactionType === TransactionType.MemberCreateV2 &&
      (g[0] as MemberCreateTransactionV2).name === "Initiator",
  )
  const creationBatchIdx = groups.findIndex((g) => {
    const types = new Set(g.map((t) => t.transactionType))
    return (
      types.has(TransactionType.VaultNamingUpdate) &&
      types.has(TransactionType.WalletCreate)
    )
  })

  if (initiatorIdx === -1 || creationBatchIdx === -1) return groups

  const merged = [...groups[initiatorIdx], ...groups[creationBatchIdx]]
  return groups
    .filter((_, i) => i !== initiatorIdx && i !== creationBatchIdx)
    .concat([merged])
}

export const getBatchSidePanelContent = (
  txGroup: Transaction[],
  vaultId?: string,
  tokens?: FT[],
  members?: VaultMember[],
  xdrPermyriadPerIcp?: bigint,
) => {
  const sorted = [...txGroup].sort((a, b) => Number(a.id - b.id))
  return sorted.map((tx) => {
    const markup = getSidePanelMarkupByType(
      tx,
      vaultId,
      tokens,
      members,
      xdrPermyriadPerIcp,
    )
    return (
      <div
        key={tx.id.toString()}
        className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[20px] mb-4"
      >
        <p className="text-[18px] font-semibold dark:text-white mb-2">
          {markup?.title}
        </p>

        <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
          <p className="text-gray-400 dark:text-zinc-500">Transaction number</p>
          <p className="dark:text-white">{tx.id.toString()}</p>
        </div>
        {markup?.info && (
          <>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            {markup.info}
          </>
        )}
      </div>
    )
  })
}

export const getSidePanelMarkupByType = (
  tx: Transaction,
  vaultId?: string,
  tokens?: FT[],
  members?: VaultMember[],
  xdrPermyriadPerIcp?: bigint,
) => {
  const membersCount = members?.length
  switch (tx.transactionType) {
    case TransactionType.VaultNamingUpdate: {
      return {
        title: "Add vault details",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Cybersafe name</p>
              <p className="dark:text-white">
                {(tx as VaultUpdateNamingTransaction).name}
              </p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">
                Approval threshold
              </p>
              <p className="dark:text-white">1 of 1 approval is required</p>
            </div>
          </>
        ),
      }
    }
    case TransactionType.WalletCreate: {
      const walletTx = tx as WalletCreateTransaction
      const walletAddress = vaultId
        ? (() => {
            try {
              return getAddress(Principal.fromText(vaultId), walletTx.uid)
            } catch {
              return walletTx.uid
            }
          })()
        : walletTx.uid
      return {
        title: "Wallet create",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Wallet name</p>
              <p className="dark:text-white">{walletTx.name}</p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Wallet address</p>
              <span onClick={(e) => e.stopPropagation()}>
                <CopyAddress
                  className="dark:text-white"
                  address={walletAddress}
                  leadingChars={8}
                  trailingChars={6}
                />
              </span>
            </div>
          </>
        ),
      }
    }
    case TransactionType.TransferQuorum:
      return {
        title: "Withdraw",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">From</p>
              <CopyAddress
                className="dark:text-white"
                address={vaultId || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">To</p>
              <CopyAddress
                className="dark:text-white"
                address={(tx as TransferQuorumTransaction).address || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token</p>
              <div>
                {(() => {
                  const token = tokens?.find(
                    (t) => t.getTokenAddress() === ICP_CANISTER_ID,
                  )
                  if (!token) return null
                  const amount = new BigNumber(
                    (tx as TransferQuorumTransaction).amount,
                  )
                    .dividedBy(10 ** token.getTokenDecimals())
                    .toFixed(token.getTokenDecimals())
                    .replace(TRIM_ZEROS, "")
                  return (
                    <>
                      <p className="dark:text-white">
                        {amount} {token.getTokenSymbol()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {token.getTokenRateFormatted(amount)}
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          </>
        ),
      }
    case TransactionType.TransferICRC1Quorum:
      return {
        title: "Withdraw",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">From</p>
              <CopyAddress
                className="dark:text-white"
                address={vaultId || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">To</p>
              <CopyAddress
                className="dark:text-white"
                address={
                  (
                    tx as TransferICRC1QuorumTransaction
                  ).to_principal.toText() || ""
                }
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token</p>
              <div>
                {(() => {
                  const token = tokens?.find(
                    (t) =>
                      t.getTokenAddress() ===
                      (tx as TransferICRC1QuorumTransaction).ledger_id.toText(),
                  )
                  if (!token) return null
                  const amount = new BigNumber(
                    (tx as TransferQuorumTransaction).amount,
                  )
                    .dividedBy(10 ** token.getTokenDecimals())
                    .toFixed(token.getTokenDecimals())
                    .replace(TRIM_ZEROS, "")
                  return (
                    <>
                      <p className="dark:text-white">
                        {amount} {token.getTokenSymbol()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {token.getTokenRateFormatted(amount)}
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          </>
        ),
      }
    case TransactionType.TopUpQuorum:
      return {
        title: "Top-up",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">From</p>
              <CopyAddress
                className="dark:text-white"
                address={vaultId || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token</p>
              <div>
                {(() => {
                  const token = tokens?.find(
                    (t) => t.getTokenAddress() === ICP_CANISTER_ID,
                  )
                  if (!token) return null
                  const amount = new BigNumber(
                    (tx as TopUpQuorumTransaction).amount,
                  )
                    .dividedBy(10 ** token.getTokenDecimals())
                    .toFixed(token.getTokenDecimals())
                    .replace(TRIM_ZEROS, "")
                  return (
                    <>
                      <p className="dark:text-white">
                        {amount} {token.getTokenSymbol()}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {token.getTokenRateFormatted(amount)}
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">T Cycles</p>
              <p className="dark:text-white">
                {xdrPermyriadPerIcp
                  ? `${icpToTCycles(
                      Number((tx as TopUpQuorumTransaction).amount) / e8s,
                      xdrPermyriadPerIcp,
                    )
                      .toFixed(3)
                      .replace(TRIM_ZEROS, "")} T Cycles`
                  : null}
              </p>
            </div>
          </>
        ),
      }
    case TransactionType.MemberCreateV2:
      return {
        title: "Add approver",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-start h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500 leading-[54px]">
                Approver name
              </p>
              <p className="dark:text-white">
                {(tx as MemberCreateTransactionV2).name}
              </p>
            </div>
            <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Wallet address</p>
              <CopyAddress
                className="dark:text-white"
                address={(
                  tx as MemberCreateTransactionV2
                ).account.owner.toText()}
                leadingChars={29}
                trailingChars={5}
              />
            </div>
          </>
        ),
      }
    case TransactionType.MemberUpdateName: {
      const updateTx = tx as MemberUpdateNameTransaction
      const existingMember = members?.find(
        (m) => m.userId === updateTx.memberId,
      )
      return {
        title: "Edit approver",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-start h-[124px]">
              <p className="text-gray-400 dark:text-zinc-500 leading-[54px]">
                Approver name
              </p>
              <div className="dark:text-white">
                {existingMember?.name ? (
                  <p className="text-gray-500 dark:text-zinc-500 leading-[54px]">
                    {existingMember.name}
                  </p>
                ) : (
                  <span onClick={(e) => e.stopPropagation()}>
                    <CopyAddress
                      className="text-gray-500 dark:text-zinc-500 leading-[54px]"
                      address={updateTx.memberId}
                      leadingChars={29}
                      trailingChars={5}
                    />
                  </span>
                )}
                <IconCmpArrow
                  className={clsx(
                    "block rotate-[-90deg] w-4 h-4 min-w-4 min-h-4 text-emerald-500",
                    tx.state !== TransactionState.Pending &&
                      tx.state !== TransactionState.Blocked &&
                      "!text-gray-400 dark:!text-zinc-400",
                  )}
                />
                <p className="leading-[54px]">{updateTx.name}</p>
              </div>
            </div>
          </>
        ),
      }
    }
    case TransactionType.MemberRemove: {
      const removedId = (tx as MemberRemoveTransaction).memberId
      const removedMember = members?.find((m) => m.userId === removedId)
      return {
        title: "Remove approver",
        info: (
          <>
            {removedMember ? (
              <>
                <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                  <p className="text-gray-400 dark:text-zinc-500">Name</p>
                  <p className="dark:text-white">{removedMember.name}</p>
                </div>
                <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                  <p className="text-gray-400 dark:text-zinc-500">Wallet</p>
                  <span onClick={(e) => e.stopPropagation()}>
                    <CopyAddress
                      className="dark:text-white"
                      address={removedMember.account?.owner.toText() || ""}
                      leadingChars={29}
                      trailingChars={5}
                    />
                  </span>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                <p className="text-gray-400 dark:text-zinc-500">Approver ID</p>
                <span onClick={(e) => e.stopPropagation()}>
                  <CopyAddress
                    className="dark:text-white"
                    address={removedId}
                    leadingChars={29}
                    trailingChars={5}
                  />
                </span>
              </div>
            )}
          </>
        ),
      }
    }
    case TransactionType.QuorumUpdate:
      return {
        title: "Update approval threshold",
        info: (
          <div className="grid grid-cols-[160px_1fr] text-sm h-[124px] items-start">
            <p className="text-gray-400 dark:text-zinc-500 leading-[54px]">
              Approval threshold
            </p>
            <div className="dark:text-white">
              <p className="text-gray-500 dark:text-zinc-500 leading-[54px]">
                {tx.threshold} of {membersCount} approvals are required
              </p>
              <IconCmpArrow
                className={clsx(
                  "block rotate-[-90deg] w-4 h-4 min-w-4 min-h-4 text-emerald-500",
                  tx.state !== TransactionState.Pending &&
                    tx.state !== TransactionState.Blocked &&
                    "!text-gray-400 dark:!text-zinc-400",
                )}
              />
              <p className="leading-[54px]">
                {(tx as QuorumUpdateTransaction).quorum} of {membersCount}{" "}
                approvals are required
              </p>
            </div>
          </div>
        ),
      }
    case TransactionType.ICRC1AddCanisters: {
      const icrc1Tx = tx as ICRC1CanistersAddTransaction
      const icrc1Token = tokens?.find(
        (t) => t.getTokenAddress() === icrc1Tx.ledger_canister.toText(),
      )
      const indexCanister = icrc1Token?.getTokenIndex()

      return {
        title: "Import asset",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">
                Ledger canister ID
              </p>
              <CopyAddress
                className="dark:text-white"
                address={icrc1Tx.ledger_canister.toText()}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px] dark:text-white">
              <p className="text-gray-400 dark:text-zinc-500">
                Index canister ID
              </p>
              {indexCanister ? (
                <CopyAddress
                  className="dark:text-white"
                  address={indexCanister}
                  leadingChars={6}
                  trailingChars={4}
                />
              ) : (
                "No index canister"
              )}
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token icon</p>
              {icrc1Token?.getTokenLogo() ? (
                <img
                  src={icrc1Token.getTokenLogo()}
                  alt={icrc1Token.getTokenName()}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <p className="dark:text-white">—</p>
              )}
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token symbol</p>
              <p className="dark:text-white">{icrc1Token?.getTokenSymbol()}</p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token name</p>
              <p className="dark:text-white">{icrc1Token?.getTokenName()}</p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Network</p>
              <p className="dark:text-white">Internet Computer</p>
            </div>
          </>
        ),
      }
    }
    case TransactionType.ICRC1RemoveCanisters: {
      const icrc1Tx = tx as ICRC1CanistersRemoveTransaction
      const icrc1Token = tokens?.find(
        (t) => t.getTokenAddress() === icrc1Tx.ledger_canister.toText(),
      )
      const indexCanister = icrc1Token?.getTokenIndex()

      return {
        title: "Remove asset",
        info: (
          <>
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">
                Ledger canister ID
              </p>
              <CopyAddress
                className="dark:text-white"
                address={icrc1Tx.ledger_canister.toText()}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px] dark:text-white">
              <p className="text-gray-400 dark:text-zinc-500">
                Index canister ID
              </p>
              {indexCanister ? (
                <CopyAddress
                  className="dark:text-white"
                  address={indexCanister}
                  leadingChars={6}
                  trailingChars={4}
                />
              ) : (
                "No index canister"
              )}
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token icon</p>
              {icrc1Token?.getTokenLogo() ? (
                <img
                  src={icrc1Token.getTokenLogo()}
                  alt={icrc1Token.getTokenName()}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <p className="dark:text-white">—</p>
              )}
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token symbol</p>
              <p className="dark:text-white">
                {icrc1Token?.getTokenSymbol() ?? "—"}
              </p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Token name</p>
              <p className="dark:text-white">
                {icrc1Token?.getTokenName() ?? "—"}
              </p>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
              <p className="text-gray-400 dark:text-zinc-500">Network</p>
              <p className="dark:text-white">Internet Computer</p>
            </div>
          </>
        ),
      }
    }
    case TransactionType.ControllerUpdate: {
      const t = tx as ControllersUpdateTransaction
      const prev = new Set(t.current_controllers.map((p) => p.toText()))
      const next = new Set(t.principals.map((p) => p.toText()))
      const removed = t.current_controllers.filter((p) => !next.has(p.toText()))
      const added = t.principals.filter((p) => !prev.has(p.toText()))
      const unchanged = t.current_controllers.filter((p) =>
        next.has(p.toText()),
      )
      return {
        title: "Edit controllers",
        info: (
          <div className="grid grid-cols-[160px_1fr] text-sm items-start py-[14px]">
            <p className="text-gray-400 dark:text-zinc-500 pt-0.5">
              Controller IDs
            </p>
            <div className="space-y-1.5">
              {unchanged.map((p) => (
                <p key={p.toText()} className="break-all dark:text-white">
                  {p.toText()}
                </p>
              ))}
              {removed.map((p) => (
                <p key={p.toText()} className="text-red-600 break-all">
                  {p.toText()}
                </p>
              ))}
              <IconCmpArrow className="rotate-[-90deg] w-4 h-4 text-emerald-500" />
              {unchanged.map((p) => (
                <p
                  key={`next-${p.toText()}`}
                  className="break-all dark:text-white"
                >
                  {p.toText()}
                </p>
              ))}
              {added.map((p) => (
                <p key={p.toText()} className="break-all text-emerald-600">
                  {p.toText()}
                </p>
              ))}
            </div>
          </div>
        ),
      }
    }
    case TransactionType.Purge:
      return {
        title: "Clear queue",
        info: (
          <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[64px]">
            <p className="text-gray-400 dark:text-zinc-500">Description</p>
            <p className="dark:text-white">
              Every active transaction before #{tx.id} will be canceled.
            </p>
          </div>
        ),
      }

    default:
      return null
  }
}

export const getTxMarkupByType = (
  tx: Transaction,
  vaultId?: string,
  tokens?: FT[],
  members?: VaultMember[],
  xdrPermyriadPerIcp?: bigint,
) => {
  const membersCount = members?.length
  switch (tx.transactionType) {
    case TransactionType.VaultNamingUpdate:
      return {
        title: "Add vault details",
      }
    case TransactionType.WalletCreate:
      return {
        title: "Wallet create",
      }
    case TransactionType.TransferQuorum:
      return {
        title: "Withdraw",
        icon: (
          <IconCmpArrow
            className={clsx(
              "rotate-[135deg] text-cyan-500",
              tx.state !== TransactionState.Pending &&
                tx.state !== TransactionState.Blocked &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-cyan-50 dark:bg-cyan-900",
        info: (
          <div className="flex justify-between w-full relative">
            <span onClick={(e) => e.stopPropagation()}>
              <CopyAddress
                className="text-sm dark:text-white basis-[35%]"
                address={vaultId || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </span>
            <IconCmpArrow className="rotate-[180deg] w-6 h-6 absolute left-0 top-0 bottom-0 right-0 m-auto" />
            <span onClick={(e) => e.stopPropagation()}>
              <CopyAddress
                className="text-sm dark:text-white basis-[35%]"
                address={(tx as TransferQuorumTransaction).address || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </span>
          </div>
        ),
      }
    case TransactionType.TransferICRC1Quorum:
      return {
        title: "Withdraw",
        icon: (
          <IconCmpArrow
            className={clsx(
              "rotate-[135deg] text-cyan-500",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-cyan-50 dark:bg-cyan-900",
        info: (
          <div className="flex justify-between w-full relative">
            <span onClick={(e) => e.stopPropagation()}>
              <CopyAddress
                className="text-sm dark:text-white basis-[35%]"
                address={vaultId || ""}
                leadingChars={6}
                trailingChars={4}
              />
            </span>
            <IconCmpArrow className="rotate-[180deg] w-6 h-6 absolute left-0 top-0 bottom-0 right-0 m-auto" />
            <span onClick={(e) => e.stopPropagation()}>
              <CopyAddress
                className="text-sm dark:text-white basis-[35%]"
                address={(
                  tx as TransferICRC1QuorumTransaction
                ).to_principal.toText()}
                leadingChars={6}
                trailingChars={4}
              />
            </span>
          </div>
        ),
      }
    case TransactionType.TopUpQuorum:
      return {
        title: "Top-up",
        icon: (
          <IconCmpArrow
            className={clsx(
              "rotate-[135deg] text-cyan-500",
              tx.state !== TransactionState.Pending &&
                tx.state !== TransactionState.Blocked &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-cyan-50 dark:bg-cyan-900",
        info: (() => {
          if (!xdrPermyriadPerIcp) return null
          const icpAmount = Number((tx as TopUpQuorumTransaction).amount) / e8s
          const tCycles = icpToTCycles(icpAmount, xdrPermyriadPerIcp)
            .toFixed(3)
            .replace(TRIM_ZEROS, "")
          return <p className="dark:text-white">{tCycles} T Cycles</p>
        })(),
      }
    case TransactionType.MemberCreateV2:
      return {
        title: "Add approver",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: `${(tx as MemberCreateTransactionV2).name}`,
      }
    case TransactionType.MemberUpdateName: {
      const updateTx = tx as MemberUpdateNameTransaction
      const existingMember = members?.find(
        (m) => m.userId === updateTx.memberId,
      )
      return {
        title: "Edit approver",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: existingMember?.name ? (
          <div className="flex items-center gap-2">
            <p className="dark:text-white">{existingMember.name}</p>
            <IconCmpArrow className="rotate-[180deg]" />
            <p className="dark:text-white">
              {(tx as MemberUpdateNameTransaction).name}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span onClick={(e) => e.stopPropagation()}>
              <CopyAddress
                className="dark:text-white"
                address={updateTx.memberId || ""}
                leadingChars={29}
                trailingChars={5}
              />
            </span>
            <IconCmpArrow className="rotate-[180deg]" />
            <p className="dark:text-white">
              {(tx as MemberUpdateNameTransaction).name}
            </p>
          </div>
        ),
      }
    }
    case TransactionType.MemberRemove: {
      const removedId = (tx as MemberRemoveTransaction).memberId
      const removedMember = members?.find((m) => m.userId === removedId)
      return {
        title: "Remove approver",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: removedMember?.name ? (
          <p className="dark:text-white">{removedMember.name}</p>
        ) : (
          <span onClick={(e) => e.stopPropagation()}>
            <CopyAddress
              className="dark:text-white"
              address={removedId || ""}
              leadingChars={29}
              trailingChars={5}
            />
          </span>
        ),
      }
    }
    case TransactionType.QuorumUpdate:
      return {
        title: "Update approval threshold",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: (
          <div className="flex items-center gap-2">
            <span>
              {tx.threshold} of {membersCount}
            </span>
            <IconCmpArrow className="rotate-[180deg]" />
            <span>
              {(tx as QuorumUpdateTransaction).quorum} of {membersCount}
            </span>
          </div>
        ),
      }
    case TransactionType.ICRC1AddCanisters:
      return {
        title: "Import asset",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: (() => {
          const ledger = (
            tx as ICRC1CanistersAddTransaction
          ).ledger_canister.toText()
          const token = tokens?.find((t) => t.getTokenAddress() === ledger)
          return token
            ? `${token.getTokenName()} (${token.getTokenSymbol()}) ${ledger}`
            : ledger
        })(),
      }
    case TransactionType.ICRC1RemoveCanisters:
      return {
        title: "Remove asset",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: (() => {
          const ledger = (
            tx as ICRC1CanistersRemoveTransaction
          ).ledger_canister.toText()
          const token = tokens?.find((t) => t.getTokenAddress() === ledger)
          return token
            ? `${token.getTokenName()} (${token.getTokenSymbol()}) ${ledger}`
            : ledger
        })(),
      }
    case TransactionType.ControllerUpdate:
      return {
        title: "Edit controllers",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: (tx as ControllersUpdateTransaction).current_controllers.join(
          " | ",
        ),
      }
    case TransactionType.Purge:
      return {
        title: "Clear queue",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              tx.state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
        info: `Every active transaction before #${tx.id} will be canceled.`,
      }
    default:
      return null
  }
}
