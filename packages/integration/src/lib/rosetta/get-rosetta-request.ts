interface RosettaRequest {
  network_identifier: {
    blockchain: string
    network: string
  }
  account_identifier: {
    address: string
  }
}

export function getRosettaRequest(address: string): RosettaRequest {
  return {
    network_identifier: {
      blockchain: "Internet Computer",
      network: "00000000000000020101",
    },
    account_identifier: {
      address,
    },
  }
}
