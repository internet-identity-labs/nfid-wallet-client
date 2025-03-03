import clsx from "clsx"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC } from "react"

import { IconCmpWarning, Table } from "@nfid-frontend/ui"

import { CustomLink } from "../../atoms/custom-link"

export interface SecurityProps {
  primarySignInElement: JSX.Element
  toggleElement: JSX.Element
  addPasskeyElement: JSX.Element
  renderPasskeys: () => JSX.Element
  renderRecoveryOptions: () => JSX.Element
  showCreatePasskeyOnCanister?: string
}

export const Security: FC<SecurityProps> = ({
  primarySignInElement,
  toggleElement,
  addPasskeyElement,
  renderPasskeys,
  renderRecoveryOptions,
  showCreatePasskeyOnCanister,
}) => {
  return (
    <>
      <ProfileContainer
        title="Login info"
        subTitle="Primary method of signing in"
        className="my-[20px] sm:my-[30px] p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
        titleClassName="!px-0"
      >
        {primarySignInElement}
      </ProfileContainer>
      <ProfileContainer
        className="p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
        titleClassName="!px-0"
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
            <tr className="text-sm text-gray-400 text-bold">
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
        {true && (
          <div
            className={clsx(
              "px-4 sm:px-[30px] h-[64px] bg-warningBgColor rounded-[12px]",
              "flex items-center my-[20px]",
            )}
          >
            <IconCmpWarning className="text-orange-900 w-[24px] h-[24px] mr-[10px]" />
            <p className="text-sm text-orange-900">
              Please create a passkey on{" "}
              {showCreatePasskeyOnCanister && (
                <CustomLink
                  isExternal
                  text={showCreatePasskeyOnCanister}
                  link={showCreatePasskeyOnCanister}
                />
              )}{" "}
              for additional security and URL access redundancy.
            </p>
          </div>
        )}
        {addPasskeyElement}
      </ProfileContainer>
      <ProfileContainer
        className="mt-[20px] mb-[120px] sm:my-[30px] p-[20px] sm:p-[30px]"
        innerClassName="!px-0"
        titleClassName="!px-0"
        title="Recovery options"
        subTitle="Access your account even if you lose access to all other authentication factors."
      >
        {renderRecoveryOptions()}
      </ProfileContainer>
    </>
  )
}
