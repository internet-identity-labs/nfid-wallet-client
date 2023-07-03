import { Button } from "@nfid-frontend/ui"
import { ThirdPartyAuthSession } from "@nfid/integration"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import { AuthAppMeta } from "../ui/app-meta"

export interface IAuthChooseAccount {
  appMeta: AuthorizingAppMeta
  handleSelectAccount: (account: ThirdPartyAuthSession) => void
}

export const AuthChooseAccount = ({
  appMeta,
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
      {/* <ChooseItem
        // {...rootAccount}
        // handleClick={() => handleSelectAccount()}
      />
      <hr />
      {appSpecificAccounts.map((account) => (
        <ChooseItem
          {...account}
          key={account.value}
          handleClick={() => handleSelectAccount(account)}
        />
      ))} */}
      <div className="flex-1" />
      <Button type="ghost" block>
        Use a different NFID
      </Button>
    </>
  )
}
