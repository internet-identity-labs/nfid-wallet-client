import { ChooseItem } from "packages/ui/src/molecules/choose-modal/choose-item"

import { Button, IGroupOption } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import { AuthAppMeta } from "../ui/app-meta"

export interface IAuthChooseAccount {
  appMeta: AuthorizingAppMeta
  rootAccount: IGroupOption
  appSpecificAccounts: IGroupOption[]
  handleSelectAccount: (account: IGroupOption) => void
}

export const AuthChooseAccount = ({
  appMeta,
  rootAccount,
  appSpecificAccounts,
  handleSelectAccount,
}: IAuthChooseAccount) => {
  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url}
        applicationName={appMeta?.name}
        title="Choose an account"
      />
      <ChooseItem
        {...rootAccount}
        handleClick={() => handleSelectAccount(rootAccount)}
      />
      <hr />
      {appSpecificAccounts.map((account) => (
        <ChooseItem
          {...account}
          key={account.value}
          handleClick={() => handleSelectAccount(account)}
        />
      ))}
      <div className="flex-1" />
      <Button type="ghost" block>
        Use a different NFID
      </Button>
    </>
  )
}
