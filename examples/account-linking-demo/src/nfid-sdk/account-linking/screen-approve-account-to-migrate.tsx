import React from "react"
import clsx from "clsx"
import { Button, H5, NFIDGradientBar, Logo } from "@identity-labs/ui"
import { Identity } from "@dfinity/agent"

interface ExternalScreenMigrateExistingAccountDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLinkAccount: () => void
  accountInformation: { [key: string]: string | undefined } | null
  identityA: Identity
  identityB: Identity
}

export const ExternalScreenApproveAccountToMigrate: React.FC<
  ExternalScreenMigrateExistingAccountDeciderProps
> = ({ onLinkAccount, accountInformation, identityA, identityB }) => {
  return (
    <div className="relative min-h-[510px]">
      <NFIDGradientBar />

      <Logo className="px-5 pt-6" />

      <div className={clsx("p-5")}>
        <H5 className="mb-4">Link this account</H5>

        {accountInformation
          ? Object.entries(accountInformation || {}).map(([key, value]) => (
              <div key={key}>
                <div>{key}:</div>
                <div>{value}</div>
              </div>
            ))
          : identityB.getPrincipal().toString()}

        <div className="mt-6">
          <Button secondary block onClick={onLinkAccount}>
            Yes, link this account
          </Button>
        </div>
      </div>
    </div>
  )
}
