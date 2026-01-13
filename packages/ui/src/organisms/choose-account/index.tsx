import clsx from "clsx"
import { TickerAmount } from "@nfid/ui/molecules/ticker-amount"

import { IconCmpArrow, RadioButton, Skeleton } from "@nfid/ui"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { VerificationReport } from "frontend/features/identitykit/service/target.service"
import { Account } from "frontend/features/identitykit/type"

export interface ChooseAccountProps {
  selectedProfile: Account
  setSelectedProfile: (profile: Account) => void
  publicProfile: Account
  anonymous: Account[]
  onBack: () => void
  verificationReport?: VerificationReport
}

export const ChooseAccount = ({
  selectedProfile,
  setSelectedProfile,
  publicProfile,
  anonymous,
  onBack,
  verificationReport,
}: ChooseAccountProps) => {
  return (
    <div
      className={clsx(
        "w-full pt-4 pb-8 rounded-xl",
        "flex flex-col flex-1 font-inter bg-white",
        "border border-gray-200",
        "shadow-[0px_4px_10px_0px_rgba(0,0,0,0.02)]",
        "px-5 dark:bg-zinc-700 dark:border-zinc-600",
      )}
    >
      <IconCmpArrow
        onClick={onBack}
        className="absolute cursor-pointer top-5 left-5 dark:text-white"
      />

      <p className="text-sm font-bold dark:text-white">
        Share my wallet address
      </p>
      <p className="mt-2 text-xs text-gray-500 mb-2.5 dark:text-zinc-500">
        Allow this site to request payments and view your balances.
      </p>

      {!verificationReport ? (
        <div className="flex items-center justify-between my-[5px]">
          <Skeleton className="w-[160px] h-[10px]" />
          <Skeleton className="w-[70px] h-[10px]" />
        </div>
      ) : (
        <div
          className={clsx(
            "flex justify-between items-center text-xs uppercase h-5",
            !verificationReport?.isPublicAccountAvailable &&
              "text-gray-400 pointer-events-none dark:text-zinc-500",
          )}
        >
          <div className="flex items-center">
            <RadioButton
              id="profile_public"
              onChange={() => setSelectedProfile(publicProfile)}
              value={publicProfile.principal}
              checked={selectedProfile.principal === publicProfile.principal}
              name={"profile"}
              disabled={!verificationReport?.isPublicAccountAvailable}
            />
            <label
              htmlFor="profile_public"
              className="ml-2 lowercase cursor-pointer dark:text-white"
            >
              {publicProfile.displayName}
            </label>
          </div>
          {publicProfile?.balance !== undefined ? (
            <span className="dark:text-white">
              <TickerAmount
                symbol={"ICP"}
                value={publicProfile.balance}
                decimals={ICP_DECIMALS}
              />
            </span>
          ) : null}
        </div>
      )}
      <div className="bg-gray-200 w-full h-[1px] my-[14px] dark:text-zinc-500" />
      <p className="text-sm font-bold dark:text-white">
        Hide my wallet address
      </p>
      <p className="mt-2 mb-2.5 text-xs text-gray-500 dark:text-zinc-500">
        This site will be unable to request payments, view balances, <br />
        or access any of your other on-chain activity.
      </p>
      {!verificationReport ? (
        <div>
          <Skeleton className="w-[160px] h-[10px] my-[5px]" />
        </div>
      ) : (
        <div className="grid gap-y-2">
          {anonymous?.map((acc) => (
            <div
              className="flex items-center h-5 text-xs text-gray-400 dark:text-zinc-500"
              key={`legacy_persona_${acc.id}`}
            >
              <RadioButton
                id={`profile_legacy_${acc.id}`}
                value={`anonymous-${acc.id}`}
                onChange={() => setSelectedProfile(acc)}
                checked={selectedProfile.principal === acc.principal}
                name={`profile-${acc.id}`}
                text={acc.displayName}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
