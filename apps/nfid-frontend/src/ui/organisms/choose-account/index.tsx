import clsx from "clsx"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"

import { IconCmpArrow, RadioButton } from "@nfid-frontend/ui"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { Account } from "frontend/features/identitykit/type"

export interface ChooseAccountProps {
  isPublicAvailable?: boolean
  selectedProfile: Account
  setSelectedProfile: (profile: Account) => void
  publicProfile: Account
  anonymous: Account[]
  onBack: () => void
}

export const ChooseAccount = ({
  isPublicAvailable = false,
  selectedProfile,
  setSelectedProfile,
  publicProfile,
  anonymous,
  onBack,
}: ChooseAccountProps) => {
  return (
    <div
      className={clsx(
        "w-full pt-4 pb-8 rounded-xl",
        "flex flex-col flex-1 font-inter bg-white",
        "border border-gray-200",
        "shadow-[0px_4px_10px_0px_rgba(0,0,0,0.02)]",
        "px-5",
      )}
    >
      <IconCmpArrow
        onClick={onBack}
        className="absolute cursor-pointer top-5 left-5"
      />

      <p className="text-sm font-bold">Share my wallet address</p>
      <p className="mt-2 text-xs text-gray-500">
        Allow this site to request payments and view your balances.
      </p>
      <div
        className={clsx(
          "flex justify-between items-center text-xs uppercase h-5 mt-2.5",
          !isPublicAvailable && "text-gray-400 pointer-events-none",
        )}
      >
        <div className="flex items-center">
          <RadioButton
            id="profile_public"
            onChange={(e) => setSelectedProfile(publicProfile)}
            value={publicProfile.principal}
            checked={selectedProfile.principal === publicProfile.principal}
            name={"profile"}
            disabled={!isPublicAvailable}
          />
          <label
            htmlFor="profile_public"
            className="ml-2 lowercase cursor-pointer"
          >
            {publicProfile.displayName}
          </label>
        </div>
        {publicProfile?.balance !== undefined ? (
          <span>
            <TickerAmount
              symbol={"ICP"}
              value={publicProfile.balance}
              decimals={ICP_DECIMALS}
            />
          </span>
        ) : null}
      </div>

      <div className="bg-gray-200 w-full h-[1px] my-[14px]" />

      <p className="text-sm font-bold">Hide my wallet address</p>
      <p className="mt-2 text-xs text-gray-500">
        This site will be unable to request payments, view balances, or access
        any of your other on-chain activity.
      </p>

      {anonymous?.map((acc) => (
        <div
          className="flex items-center h-5 mt-5 text-xs text-gray-400"
          key={`legacy_persona_${acc.id}`}
        >
          <RadioButton
            id={`profile_legacy_${acc.id}`}
            value={`anonymous-${acc.id}`}
            onChange={(e) => setSelectedProfile(acc)}
            checked={selectedProfile.principal === acc.principal}
            name={`profile-${acc.id}`}
            text={acc.displayName}
          />
        </div>
      ))}
    </div>
  )
}
