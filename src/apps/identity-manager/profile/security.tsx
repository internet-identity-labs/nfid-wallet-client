import React from "react"

import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import {
  LegacyDevice,
  RecoveryDevice,
} from "frontend/integration/identity-manager/devices/state"
import ProfileSecurityPage from "frontend/ui/pages/new-profile/security"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "./routes"

const ProfileSecurity = () => {
  const [fetched, loadOnce] = React.useReducer(() => true, false)
  const { navigate } = useNFIDNavigate()

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

  const handleCreateRecoveryPhrase = React.useCallback(async () => {
    // NOTE: NEVER LOG RECOVERY PHRASE
    const recoveryPhrase = await createRecoveryPhrase()
    navigate(
      `${ProfileConstants.base}/${ProfileConstants.copyRecoveryPhrase}`,
      {
        state: {
          recoveryPhrase,
        },
      },
    )
  }, [createRecoveryPhrase, navigate])

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
      onCreateRecoveryPhrase={handleCreateRecoveryPhrase}
      onRegisterRecoveryKey={handleRegisterRecoveryKey}
      recoveryMethods={recoveryDevices}
    />
  )
}

export default ProfileSecurity
