import clsx from "clsx"
import { useState } from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import ProfileNewTransaction from "frontend/ui/organisms/profile-new-transaction"

import { Button } from "../../../../ui/atoms/button"
import { useTransfer, useWallet } from "../wallet/hooks"
import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { walletAddress, walletBalance } = useWallet()
  const { data: transfer } = useTransfer()

  const sendTransfer = async (values: { address: string; sum: string }) => {
    try {
      if (!transfer) throw new Error("Transfer doesn't exist")
      setIsLoading(true)
      await transfer(values.address, values.sum)
      setIsSuccess(true)
    } catch (e) {
      console.log({ e })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Loader isLoading={isLoading} />
      <Button
        className={clsx(
          "px-[10px] py-[11px] space-x-2.5 items-center",
          "hidden sm:flex",
        )}
        onClick={() => setIsModalVisible(true)}
        primary
      >
        <img src={SendReceiveIcon} alt="send/receive" />
        <span>Send / Receive</span>
      </Button>
      <div
        className={clsx(
          "sm:hidden fixed bottom-3 right-3 w-12 h-12",
          "bg-blue-600 flex items-center justify-center",
          "rounded-full shadow-blueLight shadow-blue-600",
          "cursor-pointer z-50",
        )}
        onClick={() => setIsModalVisible(true)}
      >
        <img className="w-6 h-6" src={SendReceiveIcon} alt="transaction" />
      </div>
      {isModalVisible && (
        <div
          onClick={() => setIsModalVisible(false)}
          className={clsx([
            "transition ease-in-out delay-150 duration-300",
            "z-30 top-0 left-0 w-full h-screen",
            "fixed bg-opacity-75 bg-gray-600",
          ])}
          style={{ margin: 0 }}
        >
          <ProfileNewTransaction
            account={walletAddress ?? ""}
            balance={walletBalance?.value ?? 0}
            isSuccess={isSuccess}
            onSendTransaction={sendTransfer}
            onClose={() => {
              setIsModalVisible(false)
              setIsSuccess(false)
            }}
          />
        </div>
      )}
    </>
  )
}
