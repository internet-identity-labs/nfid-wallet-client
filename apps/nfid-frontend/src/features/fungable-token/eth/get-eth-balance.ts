import Web3 from "web3"

import { getEthProvider } from "./provider"

interface GetBalanceParams {
  ethAddress: string
}

export const getEthBalance = async ({ ethAddress }: GetBalanceParams) => {
  const web3 = new Web3(getEthProvider())

  const balance = await web3.eth.getBalance(ethAddress)
  return (parseFloat(balance) / 10 ** 18).toFixed(8)
}
