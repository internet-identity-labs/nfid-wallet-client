import React, { useMemo, useCallback, FC, useState } from "react"
import { useSWR } from "@nfid/swr"
import { Loader, PasskeySkeleton, Toggle } from "@nfid-frontend/ui"
import { Icon } from "@nfid/integration"
import { useDarkTheme } from "frontend/hooks"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Security } from "packages/ui/src/organisms/security"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { DeviceIconDecider } from "frontend/ui/organisms/device-list/device-icon-decider"
import { PasskeyDeviceItem } from "./components/passkey-device-item"
import { PrimarySignInMethod } from "./components/primary-sign-in-method"
import { AddPasskey } from "./passkey/add-passkey"
import { AddRecoveryPhrase } from "./recovery-phrase/add-recovery"
import { DeleteRecoveryPhrase } from "./recovery-phrase/remove-recovery"
import { securityConnector } from "./device-connector"
import { NFIDTheme } from "frontend/App"

type SecurityPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

export type IHandleWithLoading = <T>(
  action: () => Promise<T>,
  callback?: () => void,
) => Promise<void>

const SecurityPage: FC<SecurityPageProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const isDarkTheme = useDarkTheme()
  const [isLoading, setIsLoading] = useState(false)
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

  const PasskeysSection = () => (
    <>
      {isLoading || isValidating || devices === undefined ? (
        <PasskeySkeleton rows={3} />
      ) : (
        devices?.passkeys.map((device, key) => (
          <PasskeyDeviceItem
            key={`passkey_device_${key}`}
            device={device}
            showLastPasskeyWarning={
              device.isLegacyDevice ? false : showLastPasskeyWarning
            }
            handleWithLoading={handleWithLoading}
          />
        ))
      )}
    </>
  )

  const RecoveryPhraseSection = () => (
    <>
      {devices?.recoveryDevice ? (
        <div className="flex items-center justify-between">
          <div className="flex space-x-2.5 items-center">
            <div className="w-10 h-10 p-2 rounded-full">
              <DeviceIconDecider
                color={isDarkTheme ? "#71717A" : "#9CA3AF"}
                icon={Icon.document}
              />
            </div>
            <div>
              <p className="text-sm leading-5">Recovery phrase</p>
              <p className="text-xs leading-4 text-gray-400 dark:text-zinc-500">
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
  )

  const showLastPasskeyWarning = useMemo(() => {
    if (!profile?.is2fa) return false

    return devices?.passkeys.filter((d) => !d.isLegacyDevice).length === 1
  }, [devices?.passkeys, profile?.is2fa])

  const tooltip = useMemo(() => {
    if (!profile?.email || !devices?.passkeys?.length) {
      return "At least one passkey and an email are required to enable Self-sovereign mode."
    }
    if (!profile.email) {
      return "Self-sovereign mode is always enabled for passkey-only users."
    }
    return ""
  }, [profile?.email, devices?.passkeys])

  if (!profile) return <Loader isLoading={true} />

  const showCreatePasskeyOnCanister = devices?.passkeys.find(
    (d) => d.origin === CANISTER_WITH_AT_LEAST_ONE_PASSKEY,
  )
    ? undefined
    : CANISTER_WITH_AT_LEAST_ONE_PASSKEY

  const hasActivePasskey =
    devices?.passkeys?.some((d) => !d.isLegacyDevice) ?? false
  const hasAnyPasskey = (devices?.passkeys?.length ?? 0) > 0
  const isToggleDisabled =
    !hasActivePasskey || isLoading || !profile?.email || !hasAnyPasskey

  return (
    <ProfileTemplate
      showBackButton
      pageTitle="Security"
      className="dark:text-white"
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
    >
      <Security
        primarySignInElement={<PrimarySignInMethod profile={profile} />}
        showCreatePasskeyOnCanister={showCreatePasskeyOnCanister}
        toggleElement={
          <Toggle
            isDisabled={isToggleDisabled}
            isChecked={!!profile?.is2fa}
            onToggle={async (val) => {
              handleWithLoading(
                async () => await securityConnector.toggle2FA(val),
                () => refreshProfile(),
              )
            }}
            tooltip={tooltip}
          />
        }
        addPasskeyElement={
          <AddPasskey
            // Disable "Add Passkey" for legacy II-only users since we cannot create passkeys for them.
            // Currently, the button is enabled if the user has at least one of:
            //   - email (Google/Email signup),
            //   - name (passkey signup),
            //   - principalId (II signup).
            // TODO: Revisit this logic when we have a better way to identify legacy II-only users.
            isDisabled={!profile.email && !profile.name && !profile.principalId}
            handleWithLoading={handleWithLoading}
            isLoading={isLoading}
          />
        }
        renderPasskeys={PasskeysSection}
        renderRecoveryOptions={RecoveryPhraseSection}
      />
    </ProfileTemplate>
  )
}

export default SecurityPage
