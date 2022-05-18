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

  const { devices, getDevices, deleteDevice, handleLoadDevices } = useDevices()
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
      getPersona()
    }
  }, [fetched, getDevices, getPersona, readAccount])

  const handleDeleteDevice = React.useCallback(
    async (device: Device) => {
      await deleteDevice(device.pubkey)
      await handleLoadDevices()
    },
    [deleteDevice, handleLoadDevices],
  )

  const handleDeviceUpdateIcon = React.useCallback(async (device: Device) => {
    console.log(">> handleDeviceUpdateIcon", { device })
  }, [])

  const handleDeviceUpdateLabel = React.useCallback(async (device: Device) => {
    console.log(">> handleDeviceUpdateLabel", { device })
  }, [])

  return (
    <Profile
      account={account}
      applications={applications}
      onDeviceDelete={handleDeleteDevice}
      onDeviceUpdateIcon={handleDeviceUpdateIcon}
      onDeviceUpdateLabel={handleDeviceUpdateLabel}
      hasPoa={hasPoa}
      devices={devices}
      personas={nfidPersonas}
    />
  )
}
