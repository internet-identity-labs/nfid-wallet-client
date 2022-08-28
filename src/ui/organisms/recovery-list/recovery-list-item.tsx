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
  Icon,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"
import { IconCancel } from "frontend/ui/atoms/icons/cancle"
import { IconCheckMark } from "frontend/ui/atoms/icons/check-mark"

import { DeviceIconDecider } from "../device-list/device-icon-decider"
import { DeviceListButtonGroup } from "../device-list/device-list-button-group"

interface recoveryMethodListItemProps {
  recoveryMethod: RecoveryDevice
  onRecoveryUpdate: (recoveryMethod: RecoveryDevice) => Promise<void>
  onRecoveryDelete: (recoveryMethod: RecoveryDevice) => Promise<void>
}

export const RecoveryMethodListItem: React.FC<recoveryMethodListItemProps> = ({
  recoveryMethod: initialRecovery,
  onRecoveryUpdate,
  onRecoveryDelete,
}) => {
  const [updatedRecovery, setUpdatedRecovery] =
    React.useState<RecoveryDevice | null>(null)

  const recoveryMethod = updatedRecovery ?? initialRecovery

  const [editIconModal, toggleIconModal] = React.useReducer(
    (state) => !state,
    false,
  )
  const [deleteRecoveryModal, toggleDeleteRecoveryModal] = React.useReducer(
    (state) => !state,
    false,
  )

  const [isEditingLabel, toggleEditLabel] = React.useReducer(
    (state) => !state,
    false,
  )

  const [loading, setLoading] = React.useState(false)

  const handleDeleteRecovery = React.useCallback(
    async (method: RecoveryDevice) => {
      setLoading(true)

      await onRecoveryDelete(method)

      setLoading(false)
      toggleDeleteRecoveryModal()
    },
    [onRecoveryDelete],
  )

  const handleDeleteRecoveryDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleDeleteRecoveryModal()
    },
    [],
  )

  const handleSelectIcon = React.useCallback(
    (icon: Icon) => {
      setUpdatedRecovery(
        produce(
          updatedRecovery || initialRecovery,
          (draft: RecoveryDevice) => ({
            ...draft,
            icon,
          }),
        ),
      )
    },
    [initialRecovery, updatedRecovery],
  )

  const handleEditRecoveryIconDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      toggleIconModal()
    },
    [],
  )

  const handleOnChangeLabel = React.useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setUpdatedRecovery(
        produce(
          updatedRecovery || initialRecovery,
          (draft: RecoveryDevice) => ({
            ...draft,
            label: value,
          }),
        ),
      )
    },
    [initialRecovery, updatedRecovery],
  )

  const handleOnRecoveryUpdate = React.useCallback(async () => {
    setLoading(true)
    if (updatedRecovery) {
      await onRecoveryUpdate(updatedRecovery)
    }
    setLoading(false)
  }, [onRecoveryUpdate, updatedRecovery])

  const handleOnIconUpdate = React.useCallback(async () => {
    await handleOnRecoveryUpdate()
    toggleIconModal()
  }, [handleOnRecoveryUpdate])

  const handleOnLabelUpdate = React.useCallback(async () => {
    await handleOnRecoveryUpdate()
    toggleEditLabel()
  }, [handleOnRecoveryUpdate])

  return (
    <div
      className={clsx(
        "relative flex flex-row hover:bg-gray-200 hover:rounded transition-colors duration-100 -mx-3 mt-2",
      )}
    >
      <div className="flex flex-wrap items-center flex-1 px-3 py-2 cursor-pointer select-none peer">
        <div className="mr-4">
          <div className="relative flex items-center justify-center bg-white rounded-full w-9 h-9">
            <DeviceIconDecider
              icon={recoveryMethod.icon}
              onClick={
                isEditingLabel ? () => null : handleEditRecoveryIconDialog
              }
            />
          </div>
        </div>

        <div className="relative flex items-center flex-1 border-b border-gray-300">
          <div className="flex-1 flex-shrink">
            {isEditingLabel ? (
              <input
                className="flex-1 flex-shrink px-2 py-1 rounded"
                defaultValue={recoveryMethod.label}
                onChange={handleOnChangeLabel}
              ></input>
            ) : (
              <div className="flex-1 flex-shrink">
                <div className="text-gray-700">{recoveryMethod.label}</div>
                {recoveryMethod.lastUsed ? (
                  <div className="my-1 text-sm text-gray-400">
                    Last activity:{" "}
                    {format(recoveryMethod.lastUsed, "MMM d, yyyy")}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="pl-1 md:pl-4">
            <div className="flex space-x-2">
              <div
                className="hover:bg-gray-200 text-red-base"
                onClick={isEditingLabel ? handleOnLabelUpdate : toggleEditLabel}
                style={{ display: !recoveryMethod.isSecurityKey ? "none" : "" }}
              >
                {isEditingLabel ? <IconCheckMark /> : <PencilIcon />}
              </div>
              <div
                className="hover:bg-gray-200 text-red-base"
                onClick={
                  isEditingLabel ? toggleEditLabel : handleDeleteRecoveryDialog
                }
              >
                {isEditingLabel ? <IconCancel /> : <TrashIcon />}
              </div>
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
            onClick: updatedRecovery ? handleOnIconUpdate : toggleIconModal,
          }}
          secondaryButton={{
            text: "Cancel",
            type: "secondary",
            onClick: () => {
              setUpdatedRecovery(null)
              toggleIconModal()
            },
          }}
        >
          <div>
            <P>
              Choose icon for{" "}
              <span className="font-bold">{recoveryMethod.label}</span>
            </P>
            <DeviceListButtonGroup
              onSelect={handleSelectIcon}
              selected={recoveryMethod.icon}
            />
          </div>
        </ModalAdvanced>
      )}
      {deleteRecoveryModal && (
        <ModalAdvanced
          title="Delete access point"
          onClose={toggleDeleteRecoveryModal}
          primaryButton={{
            text: "Delete",
            type: "error",
            onClick: async () => {
              await handleDeleteRecovery(recoveryMethod)
            },
          }}
          secondaryButton={{
            text: "Cancel",
            type: "secondary",
            onClick: toggleDeleteRecoveryModal,
          }}
        >
          <P>
            Do you really want to delete{" "}
            <span className="font-bold">{recoveryMethod.label}</span> access
            point? This process cannot be undone.
          </P>
        </ModalAdvanced>
      )}
      <Loader isLoading={loading} />
    </div>
  )
}
