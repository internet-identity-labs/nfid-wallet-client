import React, { useCallback } from "react"

import { Button } from "@nfid-frontend/ui"

import { removeAccessPointFacade } from "frontend/integration/facade"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { IHandleWithLoading } from ".."
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

  const onDelete = useCallback(async () => {
    if (device.isLegacyDevice) {
      handleWithLoading(
        async () => {
          showLastPasskeyWarning && (await securityConnector.toggle2FA(false))
          removeAccessPointFacade(BigInt(profile?.anchor!), device.principal)
        },
        () => setIsModalVisible(false),
      )
    } else
      handleWithLoading(async () => {
        showLastPasskeyWarning && (await securityConnector.toggle2FA(false))
        await removeAccessPoint(device.principal)
      })
  }, [
    showLastPasskeyWarning,
    device.isLegacyDevice,
    device.principal,
    handleWithLoading,
    profile?.anchor,
  ])

  return (
    <div>
      <div onClick={() => setIsModalVisible(true)}>{children}</div>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[500px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Remove passkey</p>
        <div className="p-5 mt-5 text-sm text-orange-900 bg-orange-50 rounded-xl">
          <p className="font-bold">
            {showLastPasskeyWarning
              ? "Your two-factor authentication will be disabled"
              : "Caution"}
          </p>
          <p className="mt-3">
            {showLastPasskeyWarning
              ? "You will not be able to sign back in with this passkey once removed. Make sure you have other methods of signing in."
              : "Passkeys are the most secure authentication method available on the internet today. Disabling 2FA means anyone with access to your email address will be able to sign in."}
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
