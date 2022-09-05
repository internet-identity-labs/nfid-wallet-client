import clsx from "clsx"
import { format } from "date-fns"
import produce from "immer"
import React from "react"

import {
  Loader,
  ModalAdvanced,
  P,
  PencilIcon,
  TrashIcon,
} from "@internet-identity-labs/nfid-sdk-react"

import {
  LegacyDevice,
  Icon,
} from "frontend/integration/identity-manager/devices/state"
import { IconCancel } from "frontend/ui/atoms/icons/cancle"
import { IconCheckMark } from "frontend/ui/atoms/icons/check-mark"
import { InfoIcon } from "frontend/ui/atoms/icons/info"

import { DeviceIconDecider } from "./device-icon-decider"
import { DeviceListButtonGroup } from "./device-list-button-group"

interface DeviceListItemProps {
  device: LegacyDevice
  onDeviceUpdate: (device: LegacyDevice) => Promise<void>
  onDelete: (device: LegacyDevice) => Promise<void>
}

export const DeviceListItem: React.FC<DeviceListItemProps> = ({
  device: initialDevice,
  onDelete,
  onDeviceUpdate,
}) => {
  const [updatedDevice, setUpdatedDevice] = React.useState<LegacyDevice | null>(
    null,
  )

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

  const handleDeleteDevice = React.useCallback(
    async (device: LegacyDevice) => {
      setLoading(true)

      await onDelete(device)

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
      setUpdatedDevice(
        produce(updatedDevice || initialDevice, (draft: LegacyDevice) => ({
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
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setUpdatedDevice(
        produce(updatedDevice || initialDevice, (draft: LegacyDevice) => ({
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
    }
    setLoading(false)
  }, [onDeviceUpdate, updatedDevice])

  const handleOnIconUpdate = React.useCallback(async () => {
    await handleOnDeviceUpdate()
    toggleIconModal()
  }, [handleOnDeviceUpdate])

  const handleOnLabelUpdate = React.useCallback(async () => {
    await handleOnDeviceUpdate()
    toggleEditLabel()
  }, [handleOnDeviceUpdate])

  return (
    <>
      <div
        className={clsx(
          "relative flex flex-row hover:bg-gray-50 hover:rounded transition-colors duration-100 -mx-3",
        )}
      >
        <div className="flex flex-wrap items-center flex-1 px-3 select-none py-2cursor-pointer peer">
          <div className="mr-4">
            <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
              <DeviceIconDecider
                icon={device.isAccessPoint ? device.icon : "unknown"}
                onClick={
                  isEditingLabel ? () => null : handleEditDeviceIconDialog
                }
              />
            </div>
          </div>

          <div className="relative flex items-center flex-1 py-2 border-b border-gray-200 ">
            {isEditingLabel ? (
              <input
                className="flex-1 flex-shrink px-2 py-1 rounded"
                defaultValue={device.label}
                onChange={handleOnChangeLabel}
              ></input>
            ) : (
              <div className="flex-1 flex-shrink">
                <div className="text-gray-700">
                  {device.isAccessPoint ? device.label : device.browser}
                </div>
                <div className="my-1 text-sm text-gray-400">
                  {device.isAccessPoint
                    ? `Last activity: ${
                        format(device.lastUsed, "MMM d, yyyy 'on '") +
                          device.browser ?? null
                      }`
                    : "This is not an NFID device"}
                </div>
              </div>
            )}

            <div className="flex items-center pl-1 md:pl-4">
              <div
                className={clsx(
                  "flex space-x-2 items-center",
                  !device.isAccessPoint && "hidden",
                  device.isSocialDevice && "hidden",
                )}
                style={{ display: (device as any).recovery ? "none" : "" }}
              >
                <div
                  className="hover:bg-gray-50 text-red-base"
                  onClick={
                    isEditingLabel ? handleOnLabelUpdate : toggleEditLabel
                  }
                >
                  {isEditingLabel ? <IconCheckMark /> : <PencilIcon />}
                </div>
                <div
                  className="hover:bg-gray-50 text-red-base"
                  onClick={
                    isEditingLabel ? toggleEditLabel : handleDeleteDeviceDialog
                  }
                >
                  {isEditingLabel ? <IconCancel /> : <TrashIcon />}
                </div>
              </div>

              <InfoIcon className={clsx(device.isAccessPoint && "hidden")} />
            </div>
          </div>
        </div>
      </div>
      {editIconModal && (
        <ModalAdvanced
          title="Change icon"
          onClose={toggleIconModal}
          primaryButton={{
            text: "Change",
            type: "primary",
            onClick: updatedDevice ? handleOnIconUpdate : toggleIconModal,
          }}
          secondaryButton={{
            text: "Cancel",
            type: "primary",
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
              await handleDeleteDevice(device)
            },
          }}
          secondaryButton={{
            text: "Cancel",
            type: "primary",
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
