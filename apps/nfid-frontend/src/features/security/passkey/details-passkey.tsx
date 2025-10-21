import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React from "react"

import { Button } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"

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
    device?.credentialId?.length
      ? [device.credentialId, "_passkeyMetadata"]
      : null,
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
        <p className="text-2xl font-bold dark:text-white">Passkey details</p>
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-[130px] sm:w-[180px]" />
              <th className="w-auto" />
            </tr>
          </thead>
          <tbody className="text-sm break-all">
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">Name</td>
              <td className="dark:text-white">{device.label}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">Passkey type</td>
              <td className="dark:text-white">
                {device.isMultiDevice
                  ? "Multi-device Passkey"
                  : "Single-device Passkey"}
              </td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">Created</td>
              <td className="dark:text-white">{device.created_at}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">
                Last activity
              </td>
              <td className="dark:text-white">{device.last_used}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">Transports</td>
              <td className="dark:text-white">{data?.transports.join(", ")}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">
                User verification
              </td>
              <td className="dark:text-white">
                {data?.flags.userVerified ? "True" : "False"}
              </td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">
                User presence
              </td>
              <td className="dark:text-white">
                {data?.flags.userPresent ? "True" : "False"}
              </td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-zinc-500 h-14">
              <td className="text-gray-400 dark:text-zinc-500">AAGUID</td>
              <td className="dark:text-white">{data?.aaguid}</td>
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
