import React, { useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

import { Button } from "@nfid-frontend/ui"
import { removeICRC1Canister } from "@nfid/integration/token/icrc1"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { TrashIcon } from "frontend/ui/atoms/icons/trash"
import { resetCachesByKey } from "frontend/ui/connnector/cache"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { TokenToRemove } from "."

type IAssetModal = {
  token: TokenToRemove | null
  setTokenToRemove: (v: TokenToRemove | null) => void
}

const AssetModal: React.FC<IAssetModal> = ({ token, setTokenToRemove }) => {
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)

  const removeHandler = async () => {
    setIsRemoveLoading(true)
    try {
      const { rootPrincipalId } = await getLambdaCredentials()
      if (!rootPrincipalId || !token) return
      await removeICRC1Canister(rootPrincipalId, token.canisterId)
      toast.success(`${token.name} has been removed.`)
      resetCachesByKey(
        [
          `ICRC1TransferConnector:getTokensOptions:[]`,
          `ICRC1TransferConnector:getTokens:[]`,
        ],
        () =>
          mutate(
            (key) => Array.isArray(key) && key[1] === "getAllTokensOptions",
          ),
      )
      mutate("getICRC1Data")
      mutate((key) => Array.isArray(key) && key[0] === "useTokenConfig")
    } catch (e) {
      console.error("removeICRC1Canister", e)
      toast.error((e as Error)?.message ?? "Error during removing the asset")
    } finally {
      setTokenToRemove(null)
      setIsRemoveLoading(false)
    }
  }

  return (
    <ModalComponent
      isVisible={Boolean(token)}
      onClose={() => setTokenToRemove(null)}
      className="p-5 w-[95%] md:w-[540px] z-[100] rounded-xl"
    >
      <BlurredLoader isLoading={isRemoveLoading} />
      <p className="text-2xl font-bold mb-[20px]">Remove token</p>
      <div className="flex items-center gap-[20px]">
        <div
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, rgba(220, 38, 38, 0.08), rgb(255, 255, 255))",
          }}
          className="flex flex-[0 0 70px] justify-center items-center min-w-[70px] h-[70px] rounded-[24px] hidden sm:flex"
        >
          <TrashIcon className="h-[38px] w-[38px] !text-red-500" />
        </div>

        <p className="text-sm">
          Are you sure you want to remove{" "}
          <span className="font-semibold">{token?.name}</span>? Your balance
          will remain if you re-add this token in the future.
        </p>
      </div>

      <div className="flex items-center justify-end space-x-2.5 mt-5">
        <Button
          className="min-w-[120px]"
          type="stroke"
          onClick={() => setTokenToRemove(null)}
        >
          Cancel
        </Button>
        <Button className="min-w-[120px]" type="red" onClick={removeHandler}>
          Remove
        </Button>
      </div>
    </ModalComponent>
  )
}

export default AssetModal
