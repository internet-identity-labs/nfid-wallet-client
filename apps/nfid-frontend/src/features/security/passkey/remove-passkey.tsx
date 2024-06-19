import React, { useCallback } from "react"
import { toast } from "react-toastify"

import { Button } from "@nfid-frontend/ui"
import { RootWallet, securityTracking } from "@nfid/integration"
import { authState } from "@nfid/integration"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"
import { removeAccessPointFacade } from "frontend/integration/facade"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { IHandleWithLoading } from ".."
import { RemoveDeviceInUseError } from "../components/remove-device-in-use-error"
import { securityConnector } from "../device-connector"
import { IDevice } from "../types"

interface IDeletePasskeyModal extends React.HTMLAttributes<HTMLDivElement> {
  handleWithLoading: IHandleWithLoading
  showLastPasskeyWarning: boolean
  device: IDevice
}

export const DeletePasskey: React.FC<IDeletePasskeyModal> = ({
  handleWithLoading,
  device,
  showLastPasskeyWarning,
  children,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const { profile } = useProfile()
  const { activeDevicePrincipalId } = authState.get()
  const isInUseDevice = activeDevicePrincipalId === device.principal

  const handleTrackRemovePasskey = useCallback(async (device: IDevice) => {
    if (device.isLegacyDevice) {
      return securityTracking.passkeyRemoved({
        legacy: true,
      })
    }

    const data = await passkeyConnector.getPasskeyByCredentialID(
      device.credentialId,
    )
    securityTracking.passkeyRemoved({
      legacy: false,
      authenticatorAttachment: data.type,
      transports: data.transports,
      userPresent: data.flags.userPresent,
      userVerified: data.flags.userVerified,
      backupEligibility: data.flags.backupEligibility,
      backupState: data.flags.backupState,
      name: data.name,
    })
  }, [])

  const onDelete = useCallback(async () => {
    handleWithLoading(
      async () => {
        showLastPasskeyWarning && (await securityConnector.toggle2FA(false))
        try {
          await removeAccessPointFacade(
            BigInt(profile?.anchor!),
            device.principal,
            device.publickey!,
            profile?.wallet === RootWallet.II,
          )
          toast.success("Device has been removed")
        } catch (e: any) {
          toast.error(e.message)
        }
      },
      () => {
        handleTrackRemovePasskey(device)
        setIsModalVisible(false)
      },
    )
  }, [
    handleWithLoading,
    showLastPasskeyWarning,
    profile,
    device,
    handleTrackRemovePasskey,
  ])

  return (
    <div>
      <div onClick={() => setIsModalVisible(true)}>{children}</div>
      <RemoveDeviceInUseError
        isModalVisible={isModalVisible && isInUseDevice}
        setIsModalVisible={setIsModalVisible}
      />
      <ModalComponent
        isVisible={isModalVisible && !isInUseDevice}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[500px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Remove Passkey</p>
        <div className="p-5 mt-5 text-sm text-orange-900 bg-orange-50 rounded-xl">
          <p className="font-bold">
            {showLastPasskeyWarning
              ? "Your two-factor authentication will be disabled"
              : "Caution"}
          </p>
          <p className="mt-3">
            {showLastPasskeyWarning
              ? "Passkeys are the most secure authentication method available on the internet today. Disabling 2FA means anyone with access to your email address will be able to sign in."
              : "You will not be able to sign back in with this Passkey once removed. Make sure you have other methods of signing in."}
          </p>
        </div>
        <p className="mt-3 text-sm">
          {showLastPasskeyWarning ? (
            <>
              Are you sure you want to disable 2FA and remove{" "}
              <b>{device.label}</b>?{" "}
            </>
          ) : (
            <>
              Are you sure you want to remove <b>{device.label}</b>
            </>
          )}
        </p>
        <div className="flex items-center justify-end space-x-2.5 mt-5">
          <Button type="stroke" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>
          <Button type="red" onClick={onDelete}>
            {showLastPasskeyWarning ? "Disable and remove" : "Remove"}
          </Button>
        </div>
      </ModalComponent>
    </div>
  )
}
