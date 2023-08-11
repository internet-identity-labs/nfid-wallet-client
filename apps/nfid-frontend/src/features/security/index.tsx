import clsx from "clsx"
import React, { useMemo } from "react"
import useSWR from "swr"

import { IconCmpPlus, Table, Toggle } from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { Loader } from "frontend/ui/atoms/loader"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { PasskeyDeviceItem } from "./components/passkey-device-item"
import { securityConnector } from "./device-connector"
import { AddPasskey } from "./passkey/add-passkey"
import { AddRecoveryPhrase } from "./recovery-phrase/add-recovery"
import { DeleteRecoveryPhrase } from "./recovery-phrase/remove-recovery"

export type IHandleWithLoading = (
  action: () => Promise<any>,
  callback?: () => void,
) => void

const ProfileSecurityPage = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const { profile, refreshProfile } = useProfile()

  const {
    data: devices,
    mutate: refetchDevices,
    isValidating,
  } = useSWR(
    profile?.anchor ? [profile.anchor.toString(), "devices"] : null,
    securityConnector.getDevices,
    { revalidateOnFocus: false },
  )

  const showLastPasskeyWarning = useMemo(() => {
    if (!profile?.is2fa) return false

    return devices?.passkeys.filter((d) => !d.isLegacyDevice).length === 1
  }, [devices?.passkeys, profile?.is2fa])

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

  if (!profile) return <Loader isLoading={true} />

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
              "pointer-events-none !text-gray-400 cursor-not-allowed",
            )}
          >
            <IconCmpPlus className="w-[18px] h-[18px]" />
            <span className="text-sm font-bold">Add an email</span>
          </div>
        )}
      </ProfileContainer>

      <ProfileContainer
        className="mt-[30px]"
        title={
          <>
            <span>Two-factor authentication</span>
            <Toggle
              isDisabled={!devices?.passkeys?.length}
              isChecked={!!profile?.is2fa}
              onToggle={async (val) => {
                handleWithLoading(
                  async () => await securityConnector.toggle2FA(val),
                  () => refreshProfile(),
                )
              }}
            />
          </>
        }
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
          className="w-full !min-w-full"
          tableHeader={
            <tr className="border-b border-black">
              <th>Passkeys</th>
              <th className="hidden sm:table-cell">Created</th>
              <th className="hidden sm:table-cell">Last activity</th>
              <th className="w-[18px]"></th>
              <th className="w-6"></th>
            </tr>
          }
        >
          {devices?.passkeys.map((device, key) => (
            <PasskeyDeviceItem
              showLastPasskeyWarning={
                device.isLegacyDevice ? false : showLastPasskeyWarning
              }
              device={device}
              key={`passkey_device_${key}`}
              handleWithLoading={handleWithLoading}
            />
          ))}
        </Table>
        <AddPasskey
          isDisabled={!!profile.email?.length}
          handleWithLoading={handleWithLoading}
        />
      </ProfileContainer>

      <ProfileContainer
        className="my-[30px]"
        title="Recovery options"
        subTitle="Access your account even if you lose access to all other authentication factors."
      >
        {devices?.recoveryDevice ? (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2.5 items-center">
              <div className="w-10 h-10 p-2 rounded-full">
                <DeviceIconDecider icon={Icon.document} />
              </div>
              <div>
                <p className="text-sm leading-5">
                  {devices.recoveryDevice.label}
                </p>
                <p className="text-xs leading-4 text-gray-400">
                  Last activity: {devices.recoveryDevice.last_used}
                </p>
              </div>
            </div>
            <DeleteRecoveryPhrase handleWithLoading={handleWithLoading} />
          </div>
        ) : (
          <AddRecoveryPhrase handleWithLoading={handleWithLoading} />
        )}
      </ProfileContainer>
      <Loader isLoading={isLoading || isValidating} />
    </ProfileTemplate>
  )
}

export default ProfileSecurityPage
