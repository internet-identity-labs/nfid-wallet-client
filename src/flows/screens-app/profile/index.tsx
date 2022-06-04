import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { Profile } from "frontend/screens/profile"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import {
  Device,
  RecoveryDevice,
} from "frontend/services/identity-manager/devices/state"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

import { ProfileConstants } from "./routes"

interface AuthenticateNFIDHomeProps {}

export const NFIDProfile: React.FC<AuthenticateNFIDHomeProps> = () => {
  const applications: any[] = ["NFID Demo"]

  const [hasPoa, setHasPoa] = React.useState(false)
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
  const { allAccounts, getPersona } = usePersona()
  const { account, readAccount } = useAccount()
  const { imAddition } = useAuthentication()

  React.useEffect(() => {
    imAddition &&
      imAddition.has_poap().then((response) => {
        setHasPoa(response)
      })
  }, [imAddition])

  React.useEffect(() => {
    if (!fetched) {
      loadOnce()
      readAccount()
      getDevices()
      getRecoveryDevices()
      getPersona()
    }
  }, [fetched, getDevices, getPersona, getRecoveryDevices, readAccount])

  const handleDeleteDevice = React.useCallback(
    async (device: Device) => {
      await deleteDevice(device.pubkey)
      await handleLoadDevices()
    },
    [deleteDevice, handleLoadDevices],
  )

  const handleDeviceUpdate = React.useCallback(
    async (device: Device) => {
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
    <Profile
      account={account}
      accounts={allAccounts}
      applications={applications}
      devices={devices}
      hasPoa={hasPoa}
      onCreateRecoveryPhrase={handleCreateRecoveryPhrase}
      onDeviceDelete={handleDeleteDevice}
      onDeviceUpdate={handleDeviceUpdate}
      onRecoveryDelete={handleRecoveryDelete}
      onRecoveryUpdate={handleRecoveryUpdate}
      onRegisterRecoveryKey={handleRegisterRecoveryKey}
      recoveryMethods={recoveryDevices}
    />
  )
}
