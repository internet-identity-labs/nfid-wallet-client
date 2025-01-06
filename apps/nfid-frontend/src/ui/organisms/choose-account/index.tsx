import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import useSWRImmutable from "swr/immutable"

import {
  IconCmpArrow,
  RadioButton,
  Skeleton,
  Tooltip,
  CardType,
  Card,
} from "@nfid-frontend/ui"
import { ICP_DECIMALS } from "@nfid/integration/token/constants"

import { VerificationReport } from "frontend/features/identitykit/service/target.service"
import { Account } from "frontend/features/identitykit/type"

const tooltipTextMapping: Record<string, string> = {
  icrc28Verified: "ICRC-28 verified",
  icrc1LedgersExcluded: "ICRC-1 ledgers excluded",
  icrc7LedgersExcluded: "ICRC-7 ledgers excluded",
  extLedgersExcluded: "EXT ledgers excluded",
}

export interface ChooseAccountProps {
  getVerificationReport: () => Promise<VerificationReport>
  selectedProfile: Account
  setSelectedProfile: (profile: Account) => void
  publicProfile: Account
  anonymous: Account[]
  onBack: () => void
}

export const ChooseAccount = ({
  getVerificationReport,
  selectedProfile,
  setSelectedProfile,
  publicProfile,
  anonymous,
  onBack,
}: ChooseAccountProps) => {
  const { data: verificationReport } = useSWRImmutable(
    getVerificationReport
      ? [getVerificationReport, "verificationReport"]
      : null,
    getVerificationReport,
  )

  // useEffect(() => {
  //   if (isPublicAccountAvailable?.isPublicAccountAvailable) {
  //     setSelectedProfile(publicProfile)
  //   }
  // }, [isPublicAccountAvailable])

  const getWarning = (report: VerificationReport) => (
    <Card
      hasIcon={false}
      type={
        report.isPublicAccountAvailable ? CardType.NOTICE : CardType.WARNING
      }
      text={
        report.isPublicAccountAvailable ? (
          <>
            <b>Connection secure.</b> This dapp cannot access or transfer your
            assets without your explicit approval.
          </>
        ) : (
          <>
            <b>Connection insecure.</b> This dapp could access and transfer your
            assets without your explicit approval.
          </>
        )
      }
    />
  )

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
          !verificationReport?.isPublicAccountAvailable &&
            "text-gray-400 pointer-events-none",
        )}
      >
        <div className="flex items-center">
          <RadioButton
            id="profile_public"
            onChange={(e) => setSelectedProfile(publicProfile)}
            value={publicProfile.principal}
            checked={selectedProfile.principal === publicProfile.principal}
            name={"profile"}
            disabled={!verificationReport?.isPublicAccountAvailable}
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

      {!verificationReport && (
        <Skeleton className="w-full p-[15px] my-3 rounded-[12px] h-[90px] flex items-center justify-center">
          <Spinner className="w-7 h-7 text-gray-400" />
        </Skeleton>
      )}

      {verificationReport && !verificationReport.details && (
        <span>{getWarning(verificationReport)}</span>
      )}

      {verificationReport && verificationReport.details && (
        <Tooltip
          sideOffset={-15}
          align="end"
          arrowClassname="sm:translate-x-[130px] translate-x-[100px] visible"
          alignOffset={-7}
          className="!p-[10px]"
          tip={
            <table className="table-auto w-[230px] text-xs">
              <tbody>
                {Object.entries(verificationReport.details).map((entry) => (
                  <tr key={entry[0]}>
                    <td>{tooltipTextMapping[entry[0]]}</td>
                    <td
                      className={clsx(
                        "capitalize text-right",
                        entry[1] ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {entry[1].toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div>{getWarning(verificationReport)}</div>
        </Tooltip>
      )}

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
