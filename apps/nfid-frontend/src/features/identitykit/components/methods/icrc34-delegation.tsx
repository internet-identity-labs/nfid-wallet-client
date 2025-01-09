import React, { useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"

import { Tooltip } from "@nfid-frontend/ui"

import { SNS_STEP_VISITED } from "frontend/features/authentication/constants"
import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import InvalidIcon from "../../assets/invalid.svg"
import ValidIcon from "../../assets/valid.svg"
import { VerificationReport } from "../../service/target.service"
import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { TokenLaunch } from "../token-launch"

const tooltipTextMapping: Record<string, string> = {
  icrc28Verified: "ICRC-28 verified",
  icrc1LedgersExcluded: "ICRC-1 ledgers excluded",
  icrc7LedgersExcluded: "ICRC-7 ledgers excluded",
  extLedgersExcluded: "EXT ledgers excluded",
}

export interface IRPCComponentICRC34 {
  origin: string
  publicProfile: Account
  anonymous: Account[]
  getVerificationReport: () => Promise<VerificationReport>
  onApprove: (data: Account) => void
  onBack: () => void
}

const RPCComponentICRC34 = ({
  origin,
  publicProfile,
  anonymous,
  getVerificationReport,
  onApprove,
  onBack,
}: IRPCComponentICRC34) => {
  const { data: verificationReport, isLoading } = useSWRImmutable(
    getVerificationReport
      ? [getVerificationReport, "verificationReport"]
      : null,
    getVerificationReport,
  )

  const [selectedProfile, setSelectedProfile] = React.useState<Account>(
    anonymous[0],
  )

  useEffect(() => {
    if (!verificationReport?.isPublicAccountAvailable) return
    setSelectedProfile(publicProfile)
  }, [verificationReport, publicProfile])

  const [showTokenLaunch, setShowTokenLaunch] = useState(false)

  const applicationName = new URL(origin).host

  return showTokenLaunch ? (
    <TokenLaunch onSubmit={() => onApprove(selectedProfile)} />
  ) : (
    <RPCPromptTemplate
      title="Approve connection"
      subTitle={
        <div className="flex items-center justify-center gap-1">
          for{" "}
          <a
            href={origin}
            target="_blank"
            className="no-underline text-primaryButtonColor"
            rel="noreferrer"
          >
            {applicationName}
          </a>
          {verificationReport && verificationReport.details && (
            <Tooltip
              align="center"
              className="!p-[10px]"
              tip={
                <div className="w-[347px] text-xs leading-[18px]">
                  <div className="mb-2">
                    {verificationReport.isPublicAccountAvailable ? (
                      <div>
                        <b>Connection secure.</b> This dapp cannot access or
                        transfer <br />
                        your assets without your explicit approval.
                      </div>
                    ) : (
                      <div>
                        <b>The connection is not secure.</b> Sharing your wallet
                        address is disabled because this dapp would be able to
                        access and transfer your assets without your explicit
                        consent.
                      </div>
                    )}
                  </div>
                  <div>
                    {Object.entries(verificationReport.details).map((entry) => (
                      <div
                        key={entry[0]}
                        className="flex items-center gap-[6px]"
                      >
                        <img
                          src={entry[1] ? ValidIcon : InvalidIcon}
                          alt="Public account report"
                          className="w-4 h-4"
                        />
                        {tooltipTextMapping[entry[0]]}
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <div>
                <img
                  src={
                    verificationReport?.isPublicAccountAvailable
                      ? ValidIcon
                      : InvalidIcon
                  }
                  alt="Public account report"
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </Tooltip>
          )}
        </div>
      }
      onPrimaryButtonClick={() => {
        if (!!localStorage.getItem(SNS_STEP_VISITED)) {
          onApprove(selectedProfile)
        } else {
          setShowTokenLaunch(true)
        }
      }}
      primaryButtonText="Connect"
      isPrimaryDisabled={isLoading}
    >
      <ChooseAccount
        onBack={onBack}
        verificationReport={verificationReport}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC34
