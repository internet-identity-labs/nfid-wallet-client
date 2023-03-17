import { EmbedControllerContext } from "../machine"

export const MethodControllerService = async ({
  rpcMessage,
  data,
}: EmbedControllerContext) => {
  let dataString: string
  if (rpcMessage?.params && rpcMessage.params.length > 1) {
    const data = JSON.parse(rpcMessage.params[1])
    console.debug("MethodControllerService", { data })

    if (data?.message?.tokenURI?.length) dataString = "LazyMint"
    else dataString = data.message.makeAsset.assetType.assetClass
  } else {
    dataString = rpcMessage?.params[0].data
  }

  // TODO: move to integration-ethereum package
  // "0x0d5f7d35" and "0x973bb640"
  if (dataString.startsWith("0x0d5f7d35")) return "Buy"
  if (dataString.startsWith("0x973bb640") || data?.method === "sell")
    return "Sell"
  if (
    dataString.startsWith("0x27050d1f") ||
    dataString.startsWith("0x72397ad5")
  )
    return "DeployCollection"
  if (dataString.startsWith("0x22a775b6")) return "Mint"
  if (dataString.startsWith("LazyMint")) return "LazyMint"
  if (dataString.startsWith("0xb94ee332")) return "BatchBuy"

  return rpcMessage?.method === "eth_signTypedData_v4"
    ? "DefaultSign"
    : "DefaultSendTransaction"
}
