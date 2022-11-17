import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

interface RosettaRequest {
  network_identifier: {
    blockchain: string
    network: string
  }
  account_identifier: {
    address: string
  }
}

export function getRosettaRequest(principal: Principal): RosettaRequest {
  let address: string = principalToAddress(principal as any)
  return {
    network_identifier: {
      blockchain: "Internet Computer",
      network: "00000000000000020101",
    },
    account_identifier: {
      address: address,
    },
  }
}
