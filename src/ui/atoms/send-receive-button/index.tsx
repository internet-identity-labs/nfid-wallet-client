import clsx from "clsx"
import { useState } from "react"

import ProfileNewTransaction from "frontend/ui/organisms/profile-new-transaction"

import { Button } from "../button"
import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  return (
    <>
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
            account={"228hdi02jqd0912edjc98h9281ejd09fj09j09ejc09jx019j0jd"}
            onSendTransaction={(values) => {
              console.log({ values })
              setIsSuccess(true)
            }}
            balance={0}
            onClose={() => {
              setIsModalVisible(false)
              setIsSuccess(false)
            }}
            isSuccess={isSuccess}
          />
        </div>
      )}
    </>
  )
}
