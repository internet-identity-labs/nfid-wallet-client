import React from "react"
import { toast } from "react-toastify"

import { removeRecoveryDeviceFacade } from "frontend/integration/facade"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import {
  LegacyDevice,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"
import { useAccount } from "frontend/integration/identity-manager/queries"
import { protectRecoveryPhrase } from "frontend/integration/internet-identity"
import ProfileSecurityPage from "frontend/ui/pages/new-profile/security"

const ProfileSecurity = () => {
  const [fetched, loadOnce] = React.useReducer(() => true, false)
  const { data: user } = useAccount()

  const {
    devices,
    recoveryDevices,
    getDevices,
    deleteDevice,
    handleLoadDevices,
    updateDevice,
    getRecoveryDevices,
    createRecoveryPhrase,
    createSecurityDevice,
  } = useDevices()

  React.useEffect(() => {
    if (!fetched) {
      loadOnce()
      getDevices()
      getRecoveryDevices()
    }
  }, [fetched, getDevices, getRecoveryDevices])

  const handleDeleteDevice = React.useCallback(
    async (device: LegacyDevice) => {
      await deleteDevice(device.pubkey)
      await handleLoadDevices()
    },
    [deleteDevice, handleLoadDevices],
  )

  const handleDeviceUpdate = React.useCallback(
    async (device: LegacyDevice) => {
      await updateDevice(device)
      await getDevices()
    },
    [getDevices, updateDevice],
  )

  const handleRecoveryDelete = React.useCallback(
    async (method: RecoveryDevice) => {
      await deleteDevice(method.pubkey)
      await getRecoveryDevices()
    },
    [deleteDevice, getRecoveryDevices],
  )

  const handleRecoveryUpdate = React.useCallback(
    async (device: RecoveryDevice) => {
      await updateDevice({ ...device, browser: "" })
      await getDevices()
    },
    [getDevices, updateDevice],
  )

  const handleCreateRecoveryPhrase = React.useCallback(
    async (protect = true) => {
      // NOTE: NEVER LOG RECOVERY PHRASE
      return await createRecoveryPhrase(protect)
    },
    [createRecoveryPhrase],
  )

  const handleDeleteRecoveryPhrase = React.useCallback(
    async (seedPhrase: string) => {
      if (!user?.anchor) return

      let phrase = seedPhrase.split(" ")
      const possibleUserNumber = parseInt(phrase[0])

      if (
        !isNaN(possibleUserNumber) &&
        Number(user.anchor) !== possibleUserNumber
      ) {
        toast.error("Incorrect seed phrase")
        return
      }

      if (!isNaN(possibleUserNumber)) phrase.shift()

      await removeRecoveryDeviceFacade(BigInt(user?.anchor), phrase.join(" "))
      await getRecoveryDevices()
    },
    [getRecoveryDevices, user?.anchor],
  )

  const handleProtectRecovery = React.useCallback(
    async (seedPhrase: string) => {
      if (!user?.anchor) return

      let phrase = seedPhrase.split(" ")
      const possibleUserNumber = parseInt(phrase[0])

      if (
        !isNaN(possibleUserNumber) &&
        Number(user.anchor) !== possibleUserNumber
      ) {
        toast.error("Incorrect seed phrase")
        return
      }

      if (!isNaN(possibleUserNumber)) phrase.shift()

      try {
        return await protectRecoveryPhrase(
          BigInt(user?.anchor ?? 0),
          phrase.join(" "),
        )
      } catch {
        toast.error("Incorrect seed phrase")
        return
      } finally {
        getRecoveryDevices()
      }
    },
    [getRecoveryDevices, user?.anchor],
  )

  const handleRegisterRecoveryKey = React.useCallback(async () => {
    await createSecurityDevice()
  }, [createSecurityDevice])

  return (
    <ProfileSecurityPage
      onDeviceDelete={handleDeleteDevice}
      onDeviceUpdate={handleDeviceUpdate}
      devices={devices}
      onRecoveryDelete={handleRecoveryDelete}
      onRecoveryUpdate={handleRecoveryUpdate}
      onRecoveryProtect={handleProtectRecovery}
      onRegisterRecoveryKey={handleRegisterRecoveryKey}
      onCreateRecoveryPhrase={handleCreateRecoveryPhrase}
      onDeleteRecoveryPhrase={handleDeleteRecoveryPhrase}
      recoveryMethods={recoveryDevices}
    />
  )
}

export default ProfileSecurity
