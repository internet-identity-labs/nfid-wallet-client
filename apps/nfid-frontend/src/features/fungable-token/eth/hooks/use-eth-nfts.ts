import useSWR from "swr"

import { getAllEthNFTs } from "../get-all-nfts"

export const useEthNFTs = () => {
  const { data: nfts, ...rest } = useSWR("ethereumNFTS", getAllEthNFTs)
  console.log(nfts)
  return { nfts, ...rest }
}
