import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { Profile } from "frontend/screens/profile"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { Device } from "frontend/services/identity-manager/devices/state"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface AuthenticateNFIDHomeProps {}

export const NFIDProfile: React.FC<AuthenticateNFIDHomeProps> = () => {
  const applications: any[] = ["NFID Demo"]

  const [hasPoa, setHasPoa] = React.useState(false)
  const [fetched, loadOnce] = React.useReducer(() => true, false)

  const {
    devices,
    recoveryDevices,
    getDevices,
    deleteDevice,
    handleLoadDevices,
    updateDevice,
    getRecoveryDevices,
  } = useDevices()
  const { nfidPersonas, getPersona } = usePersona()
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

  return (
    <Profile
      account={account}
      applications={applications}
      onDeviceDelete={handleDeleteDevice}
      onDeviceUpdate={handleDeviceUpdate}
      hasPoa={hasPoa}
      devices={devices}
      personas={nfidPersonas}
      recoveryPhrase={recoveryDevices[0]}
    />
  )
}
