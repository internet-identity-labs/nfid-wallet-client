import { Security } from "packages/ui/src/pages/security"
import React, { useMemo, useCallback } from "react"

import { Loader, PasskeySkeleton, Toggle } from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { PasskeyDeviceItem } from "./components/passkey-device-item"
import { PrimarySignInMethod } from "./components/primary-sign-in-method"
import { securityConnector } from "./device-connector"
import { AddPasskey } from "./passkey/add-passkey"
import { AddRecoveryPhrase } from "./recovery-phrase/add-recovery"
import { DeleteRecoveryPhrase } from "./recovery-phrase/remove-recovery"

export type IHandleWithLoading = (
  action: () => Promise<any>,
  callback?: () => void,
) => void

const SecurityPage = () => {
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

  const handleWithLoading: IHandleWithLoading = useCallback(
    async (action, callback) => {
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
    },
    [refetchDevices],
  )

  const renderPasskeys = useCallback(() => {
    return (
      <>
        {isLoading || isValidating || devices === undefined ? (
          <PasskeySkeleton rows={3} />
        ) : (
          devices?.passkeys.map((device, key) => (
            <PasskeyDeviceItem
              showLastPasskeyWarning={
                device.isLegacyDevice ? false : showLastPasskeyWarning
              }
              device={device}
              key={`passkey_device_${key}`}
              handleWithLoading={handleWithLoading}
            />
          ))
        )}
      </>
    )
  }, [
    showLastPasskeyWarning,
    handleWithLoading,
    devices,
    isLoading,
    isValidating,
  ])

  const renderRecoveryOptions = useCallback(
    () => (
      <>
        {devices?.recoveryDevice ? (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2.5 items-center">
              <div className="w-10 h-10 p-2 rounded-full">
                <DeviceIconDecider icon={Icon.document} />
              </div>
              <div>
                <p className="text-sm leading-5">Recovery phrase</p>
                <p className="text-xs leading-4 text-gray-400">
                  Last activity: {devices.recoveryDevice.last_used}
                </p>
              </div>
            </div>
            <DeleteRecoveryPhrase
              device={devices.recoveryDevice}
              handleWithLoading={handleWithLoading}
            />
          </div>
        ) : (
          <AddRecoveryPhrase handleWithLoading={handleWithLoading} />
        )}
      </>
    ),
    [devices?.recoveryDevice, handleWithLoading],
  )

  if (!profile) return <Loader isLoading={true} />

  return (
    <ProfileTemplate showBackButton pageTitle="Security">
      <Security
        primarySignInElement={<PrimarySignInMethod profile={profile} />}
        toggleElement={
          <Toggle
            isDisabled={
              !devices?.passkeys?.filter((d) => !d.isLegacyDevice).length
            }
            isChecked={!!profile?.is2fa}
            onToggle={async (val) => {
              handleWithLoading(
                async () => await securityConnector.toggle2FA(val),
                () => refreshProfile(),
              )
            }}
          />
        }
        addPasskeyElement={
          <AddPasskey
            isDisabled={!profile.email?.length}
            handleWithLoading={handleWithLoading}
            isLoading={isLoading}
          />
        }
        renderPasskeys={renderPasskeys}
        renderRecoveryOptions={renderRecoveryOptions}
      />
    </ProfileTemplate>
  )
}

export default SecurityPage
