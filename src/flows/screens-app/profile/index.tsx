import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { Profile, recoveryMethod } from "frontend/screens/profile"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { Device } from "frontend/services/identity-manager/devices/state"
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
    async (method: recoveryMethod) => {
      // await deleteDevice(device.pubkey)
      // await handleLoadDevices()
      // TODO logic
    },
    [],
  )

  const handleRecoveryUpdate = React.useCallback(
    async (method: recoveryMethod) => {
      // await updateDevice(device)
      // await getDevices()
      // TODO logic
    },
    [],
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
      applications={applications}
      onDeviceDelete={handleDeleteDevice}
      onDeviceUpdate={handleDeviceUpdate}
      hasPoa={hasPoa}
      devices={devices}
      accounts={allAccounts}
      onRecoveryDelete={handleRecoveryDelete}
      onRecoveryUpdate={handleRecoveryUpdate}
      recoveryMethods={recoveryDevices.map((d) => ({
        ...d,
        label: d.alias,
        isSecurityKey: Object.keys(d.key_type).indexOf("cross_platform") > -1,
        isRecoveryPhrase: Object.keys(d.key_type).indexOf("seed_phrase") > -1,
        icon: "document",
        lastUsed: 0,
      }))}
      onCreateRecoveryPhrase={handleCreateRecoveryPhrase}
      onRegisterRecoveryKey={handleRegisterRecoveryKey}
    />
  )
}
