import { useMemo, useCallback, FC, memo, useState } from "react"
import { useSWR } from "@nfid/swr"
import { Loader, PasskeySkeleton, Toggle } from "@nfid-frontend/ui"
import {
  Icon,
  deleteAccountService,
  PasskeyNotConfirmedError,
  IncorrectSeedPhraseError,
  Plan,
  DeletionMode,
} from "@nfid/integration"
import { useDarkTheme } from "frontend/hooks"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { Security } from "packages/ui/src/organisms/security"
import { ProfileTemplate } from "@nfid-frontend/ui"
import { DeviceIconDecider } from "@nfid-frontend/ui"
import { PasskeyDeviceItem } from "./components/passkey-device-item"
import { PrimarySignInMethod } from "./components/primary-sign-in-method"
import { AddPasskey } from "./passkey/add-passkey"
import { AddRecoveryPhrase } from "./recovery-phrase/add-recovery"
import { DeleteRecoveryPhrase } from "./recovery-phrase/remove-recovery"
import { securityConnector } from "./device-connector"
import { NFIDTheme } from "frontend/App"
import { useAuthentication } from "frontend/apps/authentication/use-authentication"

type SecurityPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

export type IHandleWithLoading = <T>(
  action: () => Promise<T>,
  callback?: () => void,
) => Promise<void>

const SecurityPage: FC<SecurityPageProps> = memo(
  ({ walletTheme, setWalletTheme }) => {
    const isDarkTheme = useDarkTheme()
    // const { logout } = useAuthentication()
    const [isLoading, setIsLoading] = useState(false)
    const [plan, setPlan] = useState<Plan | null>(null)
    const [stepValue, setStepValue] = useState("")
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { profile, refreshProfile } = useProfile()

    const handleGetPlan = useCallback(async () => {
      setDeleteError(null)
      setPlan(null)
      setStepValue("")
      try {
        const p = await deleteAccountService.getPlan()
        if (p.steps[0] === DeletionMode.PASSKEY) {
          await deleteAccountService.prepareStep(p)
          const next = await deleteAccountService.executeStep(p, "confirm")
          if (next.isCompleted) {
            setPlan(next)
          } else {
            setPlan(await deleteAccountService.prepareStep(next))
          }
        } else {
          setPlan(await deleteAccountService.prepareStep(p))
        }
      } catch (e) {
        if (e instanceof PasskeyNotConfirmedError) {
          setDeleteError("Passkey confirmation was cancelled or failed.")
        } else {
          setDeleteError((e as Error).message ?? "Failed to get plan.")
        }
      }
    }, [])

    const handleSubmitStep = useCallback(async () => {
      if (!plan) return
      setIsDeleting(true)
      setDeleteError(null)
      try {
        const next = await deleteAccountService.executeStep(plan, stepValue)
        setStepValue("")
        if (next.isCompleted) {
          setPlan(next)
          return
        }
        setPlan(await deleteAccountService.prepareStep(next))
      } catch (e) {
        if (e instanceof PasskeyNotConfirmedError) {
          setDeleteError("Passkey confirmation was cancelled or failed.")
        } else if (e instanceof IncorrectSeedPhraseError) {
          setDeleteError("Incorrect seed phrase.")
        } else {
          setDeleteError((e as Error).message ?? "Step failed.")
        }
      } finally {
        setIsDeleting(false)
      }
    }, [plan, stepValue])

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
          console.debug(e)
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
      (d) => d.origin === NFID_WALLET_CLIENT_CANISTER,
    )
      ? undefined
      : NFID_WALLET_CLIENT_CANISTER

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
              isDisabled={
                !profile.email && !profile.name && !profile.principalId
              }
              handleWithLoading={handleWithLoading}
              isLoading={isLoading}
            />
          }
          renderPasskeys={PasskeysSection}
          renderRecoveryOptions={RecoveryPhraseSection}
        />
        <div className="px-[20px] sm:px-[30px] pb-[30px] space-y-3">
          {!plan ? (
            <button
              onClick={handleGetPlan}
              className="w-full h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Delete account
            </button>
          ) : plan.isCompleted ? (
            <p className="text-sm text-green-600 font-medium">
              Account deleted.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Steps:{" "}
                <span className="font-mono">{plan.steps.join(" → ")}</span>
              </p>
              <p className="text-sm font-medium">
                Current step:{" "}
                <span className="font-mono text-red-600">{plan.steps[0]}</span>
              </p>
              <input
                type="text"
                value={stepValue}
                onChange={(e) => setStepValue(e.target.value)}
                placeholder="Enter value for this step…"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSubmitStep}
                disabled={isDeleting || !stepValue}
                className="w-full h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Processing…" : "Submit"}
              </button>
            </>
          )}
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
        </div>
      </ProfileTemplate>
    )
  },
)

export default SecurityPage
