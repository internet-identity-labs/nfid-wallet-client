import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

import { Loader } from "frontend/ui/atoms/loader"
import ProfileNewTransaction from "frontend/ui/organisms/profile-new-transaction"
import { isHex } from "frontend/ui/utils"

import { Button } from "../../../../ui/atoms/button"
import { useTransfer, useWallet } from "../wallet/hooks"
import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { walletAddress, walletBalance, walletPrincipal } = useWallet()
  const { data: transfer } = useTransfer()

  const sendTransfer = async (values: { address: string; sum: string }) => {
    if (Number(values.sum) === 0) return toast.error("You can't send 0 ICP")
    if (Number(values.sum) < 0)
      return toast.error("Transfer amount can't be negative value", {
        toastId: "transferAmountError",
      })
    if (values.address === walletAddress)
      return toast.error("You can't transfer ICP to yourself", {
        toastId: "transferToSelfError",
      })

    if (!transfer) throw new Error("Transfer doesn't exist")

    let validAddress = isHex(values.address)
      ? values.address
      : principalToAddress(Principal.fromText(values.address) as any)

    try {
      setIsLoading(true)
      await transfer(validAddress, values.sum)
      setIsSuccess(true)
    } catch (e: any) {
      if (e.message === "InsufficientFunds")
        toast.error("You don't have enough ICP for this transaction", {
          toastId: "insufficientFundsError",
        })
      else
        toast.error("Unexpected error: The transaction has been cancelled", {
          toastId: "unexpectedTransferError",
        })
      console.log({ e })
    } finally {
      mutate("walletBalance")
      setIsLoading(false)
    }
  }

  return (
    <div id="sendReceiveButton">
      <Loader isLoading={isLoading} />
      <Button
        className={clsx(
          "px-[10px] py-[11px] space-x-2.5 items-center",
          "hidden md:flex z-10",
        )}
        onClick={() => setIsModalVisible(true)}
        primary
      >
        <img src={SendReceiveIcon} alt="send/receive" />
        <span>Send / Receive</span>
      </Button>
      <div
        className={clsx(
          "md:hidden fixed bottom-3 right-3 w-12 h-12",
          "bg-blue-600 flex items-center justify-center",
          "rounded-full shadow-blueLight shadow-blue-600",
          "cursor-pointer z-30",
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
            "z-40 top-0 left-0 w-full h-screen",
            "fixed bg-opacity-75 bg-gray-600",
          ])}
          style={{ margin: 0 }}
        >
          <ProfileNewTransaction
            account={walletAddress ?? ""}
            accountPrincipal={walletPrincipal?.toText() ?? ""}
            balance={walletBalance?.value ?? 0}
            isSuccess={isSuccess}
            onSendTransaction={sendTransfer}
            onClose={() => {
              mutate("walletBalance")
              setIsModalVisible(false)
              setIsSuccess(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
