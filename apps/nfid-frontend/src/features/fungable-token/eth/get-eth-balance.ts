import Web3 from "web3"

import { getEthProvider } from "./provider"

interface GetBalanceParams {
  ethAddress: string
}

export const getEthBalance = async ({ ethAddress }: GetBalanceParams) => {
  const web3 = new Web3(getEthProvider())

  return await web3.eth.getBalance(ethAddress)
}
