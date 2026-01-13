import { IconCmpInfo, Tooltip } from "@nfid/ui"

export const VaultPolicyInfoTooltip = () => {
  return (
    <Tooltip
      tip={
        <ul className="text-xs max-w-[360px] list-disc leading-4 space-y-1">
          <li>
            Individual wallet policies take precedent over policies applied to
            all wallets.
          </li>
          <li>
            If a wallet (or Any source) has one or more policies available, a
            transaction will trigger the policy with the highest value first and
            approver threshold next.
          </li>
          <li>Make sure no gaps exist in your policy workflows.</li>
          <li>
            Known shortcomings: Policies can have more approvers than members in
            a vault.
          </li>
        </ul>
      }
      className="!px-3"
    >
      <IconCmpInfo className="text-secondary cursor-pointer" />
    </Tooltip>
  )
}
