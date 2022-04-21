import {
  DesktopIcon,
  KeyIcon,
  LaptopIcon,
  ListItem,
  Loader,
  MobileIcon,
  ModalAdvanced,
  ModalAdvancedProps,
  P,
  PencilIcon,
  TabletIcon,
  TrashIcon,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { MdLaptopMac } from "react-icons/md"

import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { Device } from "frontend/services/identity-manager/devices/state"

import { DeviceListButtonGroup } from "./device-list-button-group"

interface DeviceListItemProps {
  device: Device
  onChangeIcon: (device: Device) => Promise<void>
  onChangeLabel: (device: Device) => Promise<void>
  onDelete: (device: Device) => Promise<void>
}

export const DeviceListItem: React.FC<DeviceListItemProps> = ({ device }) => {
  const [showModal, setShowModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [modalOptions, setModalOptions] =
    React.useState<ModalAdvancedProps | null>(null)
  const { deleteDevice, handleLoadDevices } = useDevices()

  console.log(">> ", { showModal, loading })

  const handleDeleteDevice = React.useCallback(
    (publicKey) => async () => {
      setLoading(true)

      await deleteDevice(publicKey)
      await handleLoadDevices()

      setLoading(false)
      setShowModal(false)
    },
    [deleteDevice, handleLoadDevices],
  )

  const handleDeleteDeviceDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      setShowModal(true)

      setModalOptions({
        title: "Delete access point",
        children: (
          <P>
            Do you really want to delete{" "}
            <span className="font-bold">{device.alias}</span> access point? This
            process cannot be undone.
          </P>
        ),
        primaryButton: {
          text: "Delete",
          type: "error",
          onClick: handleDeleteDevice(device.pubkey),
        },
        secondaryButton: {
          text: "Cancel",
          type: "secondary",
          onClick: () => {
            setShowModal(false)
          },
        },
      })
    },
    [device.alias, device.pubkey, handleDeleteDevice],
  )

  const handleEditDeviceDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      console.log(">> handleEditDeviceDialog", { device })
    },
    [device],
  )

  const handleEditDeviceIconDialog = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.stopPropagation()
      setShowModal(true)

      setModalOptions({
        title: "Change icon",
        children: (
          <div>
            <P>
              Choose icon for <span className="font-bold">{device.alias}</span>
            </P>
            <DeviceListButtonGroup />
          </div>
        ),
        primaryButton: {
          text: "Change",
          type: "primary",
          onClick: handleDeleteDevice(device.pubkey),
        },
        secondaryButton: {
          text: "Cancel",
          type: "secondary",
          onClick: () => {
            setShowModal(false)
          },
        },
      })
    },
    [device.alias, device.pubkey, handleDeleteDevice],
  )

  return (
    <>
      <ListItem
        key={device.alias}
        title={device.alias}
        subtitle={""}
        icon={
          <MdLaptopMac
            className="text-xl text-blue-base"
            onClick={handleEditDeviceIconDialog}
          />
        }
        action={
          <div className="flex space-x-2">
            <div
              className="hover:bg-gray-200 text-red-base"
              onClick={handleEditDeviceDialog}
            >
              <PencilIcon />
            </div>
            <div
              className="hover:bg-gray-200 text-red-base"
              onClick={handleDeleteDeviceDialog}
            >
              <TrashIcon />
            </div>
          </div>
        }
      />
      {showModal && modalOptions && (
        <ModalAdvanced
          title={modalOptions.title}
          onClose={() => setShowModal(false)}
          primaryButton={modalOptions.primaryButton}
          secondaryButton={modalOptions.secondaryButton}
        >
          {modalOptions.children}
          <Loader isLoading={loading} />
        </ModalAdvanced>
      )}
    </>
  )
}
