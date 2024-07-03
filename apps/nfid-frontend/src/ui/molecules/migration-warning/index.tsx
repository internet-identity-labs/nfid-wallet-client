import { useActor } from "@xstate/react"
import clsx from "clsx"
import { useContext } from "react"
import React from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { IconCmpWarning } from "@nfid-frontend/ui"
import { RootWallet } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { ProfileContext } from "frontend/provider"
import { getICPublicDelegation } from "frontend/ui/connnector/fungible-asset-screen/ic/hooks/use-icp"

export const useMigrationTransfer = () => {
  const { profile } = useProfile()

  const { data: principal } = useSWR(
    "ICPublicDelegation",
    getICPublicDelegation,
  )
  const globalServices = useContext(ProfileContext)

  const [, send] = useActor(globalServices.transferService)

  const onTransferClick = React.useCallback(async () => {
    if (!principal)
      return toast.warn("Please wait a few seconds and try again.")

    send({ type: "CHANGE_TOKEN_TYPE", data: "ft" })
    send({ type: "CHANGE_DIRECTION", data: "send" })
    send({
      type: "ASSIGN_RECEIVER_WALLET",
      data: principal,
    })

    send({ type: "SHOW" })
  }, [principal, send])

  return {
    onTransferClick,
    showMigrationWarning: profile?.wallet === RootWallet.II,
  }
}

export const MigrationWarning: React.FC = () => {
  const { showMigrationWarning, onTransferClick } = useMigrationTransfer()
  if (!showMigrationWarning) return null

  return (
    <div
      className={clsx(
        "bg-orange-50 rounded-xl flex space-x-5 p-[30px] text-orange-900",
        "mb-[30px]",
      )}
    >
      <IconCmpWarning className="w-[22px] h-[22px] shrink-0" />
      <div className="text-sm">
        <p className="font-bold mb-2.5">NFID upgrade</p>
        <p className="leading-[22px]">
          Starting November 1, 2023, assets from external applications will not
          be displayed in NFID. To manage those assets in NFID, transfer them to
          your <b>NFID Wallet</b>. Otherwise, you’ll only have access through
          the application’s website.
        </p>
        <p
          onClick={onTransferClick}
          className="mt-4 font-semibold cursor-pointer text-blue"
        >
          Transfer assets to my NFID Wallet
        </p>
      </div>
    </div>
  )
}
