import {
  Loader,
  ModalAdvanced,
  P,
  PencilIcon,
  TrashIcon,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import produce from "immer"
import React from "react"

import { IconCancel } from "frontend/design-system/atoms/icons/cancle"
import { IconCheckMark } from "frontend/design-system/atoms/icons/check-mark"
import { Device, Icon } from "frontend/services/identity-manager/devices/state"

import { DeviceIconDecider } from "./device-icon-decider"
import { DeviceListButtonGroup } from "./device-list-button-group"

interface DeviceListItemProps {
  device: Device
  onDeviceUpdate: (device: Device) => Promise<void>
  onDelete: (device: Device) => Promise<void>
}

export const DeviceListItem: React.FC<DeviceListItemProps> = ({
  device: initialDevice,
  onDelete,
  onDeviceUpdate,
}) => {
  const [updatedDevice, setUpdatedDevice] = React.useState<Device | null>(null)

  const device = updatedDevice ?? initialDevice

  const [editIconModal, toggleIconModal] = React.useReducer(
    (state) => !state,
    false,
  )
  const [deleteDeviceModal, toggleDeleteDeviceModal] = React.useReducer(
    (state) => !state,
    false,
  )

  const [isEditingLabel, toggleEditLabel] = React.useReducer(
    (state) => !state,
    false,
  )

  const [loading, setLoading] = React.useState(false)
  console.log(">> ", { loading })

  const handleDeleteDevice = React.useCallback(
    async (publicKey) => {
      setLoading(true)

      await onDelete(publicKey)

      setLoading(false)
      toggleDeleteDeviceModal()
    },
    [onDelete],
  )

  const handleDeleteDeviceDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleDeleteDeviceModal()
    },
    [],
  )

  const handleSelectIcon = React.useCallback(
    (icon: Icon) => {
      console.log(">> DeviceListButtonGroup.onSelect", { icon })
      setUpdatedDevice(
        produce(updatedDevice || initialDevice, (draft: Device) => ({
          ...draft,
          icon,
        })),
      )
    },
    [initialDevice, updatedDevice],
  )

  const handleEditDeviceIconDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleIconModal()
    },
    [],
  )

  const handleOnChangeLabel = React.useCallback(
    ({ target: { value } }) => {
      setUpdatedDevice(
        produce(updatedDevice || initialDevice, (draft: Device) => ({
          ...draft,
          label: value,
        })),
      )
    },
    [initialDevice, updatedDevice],
  )

  const handleOnDeviceUpdate = React.useCallback(async () => {
    setLoading(true)
    if (updatedDevice) {
      await onDeviceUpdate(updatedDevice)
      toggleEditLabel()
    }
    setLoading(false)
  }, [onDeviceUpdate, updatedDevice])

  return (
    <>
      <div
        className={clsx(
          "relative flex flex-row hover:bg-gray-200 hover:rounded transition-colors duration-100 -mx-3 mt-2",
        )}
      >
        <div className="flex flex-wrap items-center flex-1 px-3 py-2 cursor-pointer select-none peer">
          <div className="mr-4">
            <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
              <DeviceIconDecider
                icon={device.icon}
                onClick={
                  isEditingLabel ? () => null : handleEditDeviceIconDialog
                }
              />
            </div>
          </div>

          <div className="relative flex items-center flex-1">
            {isEditingLabel ? (
              <input
                className="flex-1 flex-shrink px-2 py-1 rounded"
                defaultValue={device.label}
                onChange={handleOnChangeLabel}
              ></input>
            ) : (
              <div className="flex-1 flex-shrink">
                <div className="text-gray-700">{device.label}</div>
                <div className="my-1 text-sm text-gray-400">
                  {/* TODO: LAST USED AND BROWSER */}
                </div>
              </div>
            )}

            <div className="pl-1 md:pl-4">
              <div
                className="flex space-x-2"
                style={{ display: (device as any).recovery ? "none" : "" }}
              >
                <div
                  className="hover:bg-gray-200 text-red-base"
                  onClick={
                    isEditingLabel ? handleOnDeviceUpdate : toggleEditLabel
                  }
                >
                  {isEditingLabel ? <IconCheckMark /> : <PencilIcon />}
                </div>
                <div
                  className="hover:bg-gray-200 text-red-base"
                  onClick={
                    isEditingLabel ? toggleEditLabel : handleDeleteDeviceDialog
                  }
                >
                  {isEditingLabel ? <IconCancel /> : <TrashIcon />}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-0 w-full mx-3 border-b -bottom-1"></div>
        </div>
      </div>
      {editIconModal && (
        <ModalAdvanced
          title="Change icon"
          onClose={toggleIconModal}
          primaryButton={{
            text: "Change",
            type: "primary",
            onClick: updatedDevice ? handleOnDeviceUpdate : toggleIconModal,
          }}
          secondaryButton={{
            text: "Cancel",
            type: "secondary",
            onClick: () => {
              setUpdatedDevice(null)
              toggleIconModal()
            },
          }}
        >
          <div>
            <P>
              Choose icon for <span className="font-bold">{device.label}</span>
            </P>
            <DeviceListButtonGroup
              onSelect={handleSelectIcon}
              selected={device.icon}
            />
          </div>
        </ModalAdvanced>
      )}
      {deleteDeviceModal && (
        <ModalAdvanced
          title="Delete access point"
          onClose={toggleDeleteDeviceModal}
          primaryButton={{
            text: "Delete",
            type: "error",
            onClick: async () => {
              await handleDeleteDevice(device.pubkey)
            },
          }}
          secondaryButton={{
            text: "Cancel",
            type: "secondary",
            onClick: toggleDeleteDeviceModal,
          }}
        >
          <P>
            Do you really want to delete{" "}
            <span className="font-bold">{device.label}</span> access point? This
            process cannot be undone.
          </P>
        </ModalAdvanced>
      )}
      <Loader isLoading={loading} />
    </>
  )
}
