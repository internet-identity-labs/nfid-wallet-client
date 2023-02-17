import { ethers } from "ethers"
import { RPCMessage, RPC_BASE } from "../rpc-service"
import { EthWallet } from "@nfid/integration"

export const ConnectAccountService = async (_: any, event: { type: string, data: RPCMessage }) => {

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)
  const address = await nfidWallet.getAddress()

  console.debug("ConnectAccountService")
  return Promise.resolve({ ...RPC_BASE, id: event.data.id, result: [address] })
}


export const SendTransactionService = async (_: any, event: { type: string, data: RPCMessage }) => {
  const message = event.data.params[0]

  console.debug('SendTransactionService', { message });

  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)

  try {
    console.time("SendTransactionService sendTransaction:")
    const { wait, ...result } = await nfidWallet.sendTransaction({
      data: message.data,
      from: message.from,
      to: message.to,
      gasPrice: message.gasPrice,
      value: message.value,
    })
    console.timeEnd("SendTransactionService sendTransaction:")
    console.debug("SendTransactionService", { result })
    return Promise.resolve({ ...RPC_BASE, id: event.data.id, result })
  } catch (e) {
    console.error("SendTransactionService", { e })
    return Promise.resolve({ ...RPC_BASE, id: event.data.id, error: e })
  }
}
