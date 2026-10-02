import { IconWallet } from "packages/ui/src/atoms/icons/wallet"

export const VaultPolicyInfo = () => {
  return (
    <div className="sm:px-[30px] text-gray-500 dark:text-zinc-500">
      <div className="text-black dark:text-zinc-500">
        <IconWallet />
      </div>
      <p className="text-sm leading-[22px] mt-2.5 sm:mt-5">
        Approvers are wallets used to authorize NFID Vault transactions.
      </p>
      <div className="flex gap-0.5 mt-10 mb-5">
        <div className="w-6 h-2 bg-teal-600 rounded-l-[10px]"></div>
        <div className="w-6 h-2 bg-rangeSliderNeutral dark:bg-zinc-500 rounded-r-[10px]"></div>
      </div>
      <p className="text-sm leading-[22px]">
        The higher the number, the more secure the NFID Vault.
      </p>
      <div className="flex gap-0.5 mt-10 mb-5">
        <div className="w-6 h-2 bg-orange-600 rounded-[10px]"></div>
      </div>
      <p className="text-sm leading-[22px]">
        We recommend at least one fewer approver required than total, in case
        one is lost or stolen.
      </p>
    </div>
  )
}
