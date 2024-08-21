import { FC } from "react"

import { Table } from "@nfid-frontend/ui"

import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"

export interface SecurityProps {
  primarySignInElement: JSX.Element
  toggleElement: JSX.Element
  addPasskeyElement: JSX.Element
  renderPasskeys: () => JSX.Element
  renderRecoveryOptions: () => JSX.Element
  isLoading: boolean
}

export const Security: FC<SecurityProps> = ({
  primarySignInElement,
  toggleElement,
  addPasskeyElement,
  renderPasskeys,
  renderRecoveryOptions,
  isLoading,
}) => {
  return (
    <>
      <ProfileContainer
        title="Login info"
        subTitle="Primary method of signing in"
        className="my-[20px] sm:my-[30px] p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
      >
        {primarySignInElement}
      </ProfileContainer>
      <ProfileContainer
        className="p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
        title={
          <>
            <span>Self-sovereign mode</span>
            {toggleElement}
          </>
        }
        subTitle={
          <span>
            Use biometric authentication or external USB keys to make NFID
            Wallet access impossible without a Passkey.
            <br />
            <br />
            Passkeys and email authentication can both be used when
            self-sovereign mode is disabled.
          </span>
        }
      >
        <Table
          className="w-full !min-w-full"
          theadClassName="h-[40px]"
          tableHeader={
            <tr className="text-bold text-sm text-gray-400">
              <th>Passkeys</th>
              <th className="hidden sm:table-cell">Created</th>
              <th className="hidden sm:table-cell">Last activity</th>
              <th className="w-[18px]"></th>
              <th className="w-6"></th>
            </tr>
          }
        >
          {renderPasskeys()}
        </Table>
        {addPasskeyElement}
      </ProfileContainer>
      <ProfileContainer
        className="mt-[20px] mb-[120px] sm:my-[30px] p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
        title="Recovery options"
        subTitle="Access your account even if you lose access to all other authentication factors."
      >
        {renderRecoveryOptions()}
      </ProfileContainer>
      <Loader isLoading={isLoading} />
    </>
  )
}
