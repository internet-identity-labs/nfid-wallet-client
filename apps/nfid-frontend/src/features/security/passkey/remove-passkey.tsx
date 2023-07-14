import React, { useCallback } from "react"

import { Button } from "@nfid-frontend/ui"

import { removeAccessPointFacade } from "frontend/integration/facade"
import { removeAccessPoint } from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { IHandleWithLoading } from ".."
import { IDevice } from "../types"

interface IDeletePasskeyModal extends React.HTMLAttributes<HTMLDivElement> {
  handleWithLoading: IHandleWithLoading
  device: IDevice
}

export const DeletePasskey: React.FC<IDeletePasskeyModal> = ({
  handleWithLoading,
  device,
  children,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)

  const { profile } = useProfile()

  const onDelete = useCallback(async () => {
    if (device.isLegacyDevice) {
      handleWithLoading(() =>
        removeAccessPointFacade(BigInt(profile?.anchor!), device.principal),
      )
    } else handleWithLoading(() => removeAccessPoint(device.principal))
  }, [
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
        className="p-5 w-[500px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Remove passkey</p>
        <div className="p-5 mt-5 text-sm text-orange-900 bg-orange-50 rounded-xl">
          <p className="font-bold">Caution</p>
          <p className="mt-3">
            You will not be able to sign back in with this passkey once removed.
            Make sure you have other methods of signing in.
          </p>
        </div>
        <p className="mt-3 text-sm">
          Are you sure you want to remove <b>{device.label}</b>?
        </p>
        <div className="flex items-center justify-end space-x-2.5 mt-5">
          <Button type="stroke" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>
          <Button type="red" onClick={onDelete}>
            Remove
          </Button>
        </div>
      </ModalComponent>
    </div>
  )
}
