import React from "react"
import useSWR from "swr"

import { Button } from "@nfid-frontend/ui"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { IDevice } from "../types"

interface IDetailsPasskeyModal extends React.HTMLAttributes<HTMLDivElement> {
  device: IDevice
}

export const DetailsPasskey: React.FC<IDetailsPasskeyModal> = ({
  device,
  children,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)

  const { data } = useSWR(
    [device.credentialId, "_passkeyMetadata"],
    ([credentialId]) => passkeyConnector.getPasskeyByCredentialID(credentialId),
  )

  return (
    <div>
      <div onClick={() => setIsModalVisible(true)}>{children}</div>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[540px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Passkey details</p>
        <table>
          <thead>
            <tr>
              <th className="w-[110px] sm:w-[180px]" />
              <th className="w-auto" />
            </tr>
          </thead>
          <tbody className="text-sm break-all">
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">Name</td>
              <td>{device.label}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">Passkey type</td>
              <td>
                {device.isMultiDevice
                  ? "Multi-device passkey"
                  : "Single-device passkey"}
              </td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">Created</td>
              <td>{device.created_at}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">Last activity</td>
              <td>{device.last_used}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">Transports</td>
              <td>{data?.transports.join(", ")}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">User verification</td>
              <td>{data?.flags.userVerified ? "True" : "False"}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">User presence</td>
              <td>{data?.flags.userPresent ? "True" : "False"}</td>
            </tr>
            <tr className="border-b border-gray-200 h-14">
              <td className="text-gray-400">AAGUID</td>
              <td>{data?.aaguid}</td>
            </tr>
          </tbody>
        </table>
        <Button
          className="mt-5"
          type="primary"
          block
          onClick={() => setIsModalVisible(false)}
        >
          Close
        </Button>
      </ModalComponent>
    </div>
  )
}
