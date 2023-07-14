import clsx from "clsx"
import React from "react"
import useSWR from "swr"

import { IconCmpPlus, IconCmpTrash, Table } from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { Loader } from "frontend/ui/atoms/loader"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { AddPasskey } from "./add-passkey"
import { PasskeyDeviceItem } from "./components/passkey-device-item"
import { securityConnector } from "./device-connector"

export type IHandleWithLoading = (
  action: () => Promise<void>,
  callback?: () => void,
) => void

const ProfileSecurityPage = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const { profile } = useProfile()

  const {
    data: imDevices,
    mutate: refetchDevices,
    isValidating,
  } = useSWR(
    profile?.anchor ? [profile.anchor.toString(), "devices"] : null,
    securityConnector.getIMDevices,
    { revalidateOnFocus: false },
  )

  const handleWithLoading: IHandleWithLoading = async (action, callback) => {
    try {
      setIsLoading(true)
      await action()
      callback?.()
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
      refetchDevices()
    }
  }

  return (
    <ProfileTemplate pageTitle="Security">
      <ProfileContainer
        title="Login info"
        subTitle="Primary method of signing in"
      >
        {profile?.email ? (
          <div className="flex space-x-2.5 items-center">
            <div className="w-10 h-10 p-2 rounded-full">
              <DeviceIconDecider
                icon={
                  profile.email.includes("gmail") ? Icon.google : Icon.email
                }
              />
            </div>
            <div>
              <p className="text-sm leading-5">{profile.email}</p>
              <p className="text-xs leading-4 text-gray-400">
                {profile.email.includes("gmail") ? "Google" : "Email"} sign in
              </p>
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "flex items-center space-x-2.5 pl-2.5 h-[61px] text-blue",
              "hover:opacity-50 cursor-pointer transition-opacity",
            )}
          >
            <IconCmpPlus className="w-[18px] h-[18px]" />
            <span className="text-sm font-bold">Add an email</span>
          </div>
        )}
      </ProfileContainer>

      <ProfileContainer
        className="mt-[30px]"
        title="Two-factor authentication"
        subTitle={
          <span>
            Use biometric authentication or external USB keys for very strong
            two-factor authentication to your account. <br />
            <br />
            At least one passkey and an email login are required to enable 2FA.
            Passkeys can be used for authentication even when 2FA is disabled.
          </span>
        }
      >
        <Table
          tableHeader={
            <tr className="border-b border-black">
              <th>Passkeys</th>
              <th>Created</th>
              <th>Last activity</th>
              <th className="w-[18px]"></th>
              <th className="w-6"></th>
            </tr>
          }
        >
          {imDevices?.passkeys.map((device, key) => (
            <PasskeyDeviceItem
              device={device}
              key={`passkey_device_${key}`}
              handleWithLoading={handleWithLoading}
            />
          ))}
        </Table>
        <AddPasskey handleWithLoading={handleWithLoading} />
      </ProfileContainer>

      <ProfileContainer
        className="my-[30px]"
        title="Recovery options"
        subTitle="Access your account even if you lose access to all other authentication factors."
      >
        {imDevices?.recoveryDevice ? (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2.5 items-center">
              <div className="w-10 h-10 p-2 rounded-full">
                <DeviceIconDecider icon={Icon.document} />
              </div>
              <div>
                <p className="text-sm leading-5">
                  {imDevices.recoveryDevice.label}
                </p>
                <p className="text-xs leading-4 text-gray-400">
                  Last activity: {imDevices.recoveryDevice.last_used}
                </p>
              </div>
            </div>
            <IconCmpTrash className="w-6 text-gray-400" />
          </div>
        ) : (
          <div
            className={clsx(
              "flex items-center space-x-2.5 pl-2.5 h-[61px] text-blue",
              "hover:opacity-50 cursor-pointer transition-opacity",
            )}
          >
            <IconCmpPlus className="w-[18px] h-[18px]" />
            <span className="text-sm font-bold">Add recovery phrase</span>
          </div>
        )}
      </ProfileContainer>
      <Loader isLoading={isLoading || isValidating} />
    </ProfileTemplate>
  )
}

export default ProfileSecurityPage