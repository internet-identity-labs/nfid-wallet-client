import { ModalAdvancedProps } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { Profile } from "frontend/screens/profile"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { PublicKey } from "frontend/services/internet-identity/generated/internet_identity_types"

interface AuthenticateNFIDHomeProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const NFIDProfile: React.FC<AuthenticateNFIDHomeProps> = ({
  children,
  className,
}) => {
  const applications: any[] = ["NFID Demo"]

  const [hasPoa, setHasPoa] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fetched, loadOnce] = React.useReducer(() => true, false)
  const [modalOptions, setModalOptions] =
    React.useState<ModalAdvancedProps | null>(null)

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
    (publicKey: PublicKey) => async () => {
      setLoading(true)

      await deleteDevice(publicKey)
      await handleLoadDevices()

      setLoading(false)
      setShowModal(false)
    },
    [deleteDevice, handleLoadDevices],
  )

  return (
    <Profile
      account={account}
      applications={applications}
      onDeleteDeviceFactory={handleDeleteDevice}
      showModal={showModal}
      modalOptions={modalOptions}
      setModalOptions={setModalOptions}
      setShowModal={setShowModal}
      hasPoa={hasPoa}
      devices={devices}
      loading={loading}
      personas={nfidPersonas}
    />
  )
}
